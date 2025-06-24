<template>
  <div
    class="ww-input-otp"
    :class="rootClasses"
    :style="rootStyles"
    ref="rootElement"
  >
    <template
      v-for="(item, index) in renderItems"
      :key="`${item.type}-${index}`"
    >
      <input
        v-if="item.type === 'field'"
        :ref="(el) => (inputRefs[item.fieldIndex] = el)"
        type="text"
        :inputmode="inputMode"
        :pattern="inputPattern"
        :maxlength="1"
        :value="fieldValues[item.fieldIndex]"
        :placeholder="maskInput ? '' : content.placeholderChar"
        :readonly="content.readonly"
        :disabled="content.disabled"
        :class="fieldClasses(item.fieldIndex)"
        :style="fieldStyles(item.fieldIndex)"
        @input="handleInput(item.fieldIndex, $event)"
        @keydown="handleKeydown(item.fieldIndex, $event)"
        @paste="item.fieldIndex === 0 ? handlePaste($event) : null"
        @focus="handleFocus(item.fieldIndex)"
        @blur="handleBlur"
      />
      <div
        v-else-if="item.type === 'separator'"
        class="ww-input-otp__separator"
        :style="separatorStyles"
        v-html="separatorContent"
      />
    </template>
  </div>
</template>

<script>
import { computed, inject, ref, watch, nextTick } from "vue";

export default {
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    wwElementState: { type: Object, required: true },
    /* wwEditor:start */
    wwFrontState: { type: Object, required: true },
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: [
    "trigger-event",
    "add-state",
    "remove-state",
    "update:sidepanel-content",
  ],
  setup(props, { emit }) {
    // OTP Input state and logic
    const inputRefs = ref([]);
    const focusedIndex = ref(null);

    // Parse format to get field positions and separators
    const formatInfo = computed(() => {
      const format = props.content?.format || "xxxxxx";
      const fields = [];
      const separators = [];
      let fieldIndex = 0;

      for (let i = 0; i < format.length; i++) {
        if (format[i] === "x" || format[i] === "X") {
          fields.push({ position: i, index: fieldIndex++ });
        } else {
          separators.push({ position: i, char: format[i] });
        }
      }

      return { fields, separators, totalFields: fields.length };
    });

    // Initialize value based on format length
    const defaultValue = computed(() => {
      const initValue = props.content?.value || "";
      const totalFields = formatInfo.value.totalFields;
      return initValue.padEnd(totalFields, "").slice(0, totalFields);
    });

    // Create component variable for value persistence
    const { value: otpValue, setValue: setOtpValue } =
      wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: "value",
        type: "string",
        defaultValue,
      });

    // Update internal value when default changes
    /* wwEditor:start */
    watch(defaultValue, (newValue) => {
      setOtpValue(newValue);
    });
    /* wwEditor:end */

    // Split value into individual field values
    const fieldValues = computed(() => {
      const value = otpValue.value || "";
      return formatInfo.value.fields.map((field) => value[field.index] || "");
    });

    // Combined value without separators
    const combinedValue = computed(() => fieldValues.value.join(""));

    // Check if all fields are filled
    const isComplete = computed(() => {
      return fieldValues.value.every((val) => val !== "");
    });

    // Validation state
    const isValid = computed(() => {
      if (!props.content?.required && combinedValue.value === "") return true;
      if (props.content?.required && !isComplete.value) return false;

      // Custom validation if enabled
      if (props.content?.customValidation && props.content?.validation) {
        const { resolveFormula } = wwLib.wwFormula?.useFormula() || {};
        if (resolveFormula) {
          const result = resolveFormula(props.content.validation);
          return result?.value !== false;
        }
      }

      return true;
    });

    // Input type pattern
    const inputPattern = computed(() => {
      return props.content?.type === "numeric" ? "[0-9]" : "[a-zA-Z0-9]";
    });

    const inputMode = computed(() => {
      return props.content?.type === "numeric" ? "numeric" : "text";
    });

    const rootElement = ref(null);

    // Form integration
    const useForm = inject("_wwForm:useForm", () => ({
      submitForm: () => {
        if (!rootElement.value) {
          return;
        }

        const form = rootElement.value.closest("form");
        if (form) {
          form.submit();
        }
      },
    }));

    // Form field configuration
    const fieldName = computed(() => props.content?.fieldName);
    const validation = computed(() => props.content?.validation);
    const customValidation = computed(() => props.content?.customValidation);
    const required = computed(() => props.content?.required);

    // Use form integration
    const { submitForm } = useForm(
      combinedValue,
      { fieldName, validation, customValidation, required },
      {
        elementState: props.wwElementState,
        emit,
        sidepanelFormPath: "form",
        setValue,
      },
    );

    // Handler functions
    function handleInput(index, event) {
      const value = event.target.value;
      const char = value.slice(-1); // Get last character

      // Validate input based on type
      if (props.content?.type === "numeric" && !/[0-9]/.test(char)) {
        event.target.value = fieldValues.value[index];
        return;
      }
      if (props.content?.type === "alphanumeric" && !/[a-zA-Z0-9]/.test(char)) {
        event.target.value = fieldValues.value[index];
        return;
      }

      // Update value
      const newValues = [...fieldValues.value];
      newValues[index] = char;
      const newOtpValue = newValues.join("");
      setOtpValue(newOtpValue);

      // Auto advance to next field
      if (char && index < formatInfo.value.totalFields - 1) {
        focusField(index + 1);
      }

      // Emit change event
      emitChange(newOtpValue);

      // Check for completion
      if (newValues.every((val) => val !== "")) {
        emit("trigger-event", {
          name: "complete",
          event: { value: newOtpValue },
        });

        // Auto submit if enabled
        if (props.content?.autoSubmit && submitForm) {
          // Submit the form directly
          nextTick(() => {
            submitForm();
          });
        }
      }
    }

    // Handle backspace
    function handleKeydown(index, event) {
      if (event.key === "Backspace") {
        if (!fieldValues.value[index] && index > 0) {
          // Move to previous field if current is empty
          focusField(index - 1);
          event.preventDefault();
        } else if (fieldValues.value[index]) {
          // Clear current field
          const newValues = [...fieldValues.value];
          newValues[index] = "";
          const newOtpValue = newValues.join("");
          setOtpValue(newOtpValue);
          emitChange(newOtpValue);
        }
      }
    }

    // Handle paste events
    function handlePaste(event) {
      event.preventDefault();
      const pastedData = event.clipboardData.getData("text");

      // Filter based on input type
      let filteredData = pastedData;
      if (props.content?.type === "numeric") {
        filteredData = pastedData.replace(/\D/g, "");
      } else if (props.content?.type === "alphanumeric") {
        filteredData = pastedData.replace(/[^a-zA-Z0-9]/g, "");
      }

      // Split and fill fields
      const chars = filteredData.split("");
      const newValues = [...fieldValues.value];

      chars.forEach((char, i) => {
        if (i < formatInfo.value.totalFields) {
          newValues[i] = char;
        }
      });

      const newOtpValue = newValues.join("");
      setOtpValue(newOtpValue);
      emitChange(newOtpValue);

      // Focus last filled field or last field
      const lastFilledIndex = newValues.findLastIndex((val) => val !== "");
      const focusIndex = Math.min(
        lastFilledIndex + 1,
        formatInfo.value.totalFields - 1,
      );
      focusField(focusIndex);

      // Check for completion
      if (newValues.every((val) => val !== "")) {
        emit("trigger-event", {
          name: "complete",
          event: { value: newOtpValue },
        });

        // Auto submit if enabled
        if (props.content?.autoSubmit && submitForm) {
          // Submit the form directly
          nextTick(() => {
            submitForm();
          });
        }
      }
    }

    // Focus specific field
    function focusField(index) {
      nextTick(() => {
        const input = inputRefs.value[index];
        if (input) {
          input.focus();
          input.select();
        }
      });
    }

    // Handle focus events
    function handleFocus(index) {
      focusedIndex.value = index;
      emit("trigger-event", { name: "focus" });
      emit("add-state", "focus");
    }

    // Handle blur events
    function handleBlur() {
      // Check if focus moved to another input
      nextTick(() => {
        const stillFocused = inputRefs.value.some(
          (ref) => ref === document.activeElement,
        );
        if (!stillFocused) {
          focusedIndex.value = null;
          emit("trigger-event", { name: "blur" });
          emit("remove-state", "focus");
        }
      });
    }

    // Emit change event
    function emitChange(value) {
      emit("trigger-event", { name: "change", event: { value } });
    }

    // Public methods
    function focus() {
      const firstEmptyIndex = fieldValues.value.findIndex((val) => val === "");
      focusField(firstEmptyIndex !== -1 ? firstEmptyIndex : 0);
    }

    function clear() {
      setOtpValue("");
      emit("trigger-event", { name: "clear", event: { value: "" } });
      focusField(0);
    }

    function setValue(value) {
      const cleanValue = String(value || "").slice(
        0,
        formatInfo.value.totalFields,
      );
      setOtpValue(cleanValue);
      emitChange(cleanValue);
    }

    // Auto-focus on mount if enabled
    if (props.content?.autoFocus) {
      nextTick(() => {
        focus();
      });
    }

    // State management
    watch(isComplete, (complete) => {
      if (complete) {
        emit("add-state", "complete");
      } else {
        emit("remove-state", "complete");
      }
    });

    watch(isValid, (valid) => {
      if (!valid) {
        emit("add-state", "error");
      } else {
        emit("remove-state", "error");
      }
    });

    watch(
      () => props.content?.readonly,
      (readonly) => {
        if (readonly) {
          emit("add-state", "readonly");
        } else {
          emit("remove-state", "readonly");
        }
      },
      { immediate: true },
    );

    watch(
      () => props.content?.disabled,
      (disabled) => {
        if (disabled) {
          emit("add-state", "disabled");
        } else {
          emit("remove-state", "disabled");
        }
      },
      { immediate: true },
    );

    // Separator icon handling
    const { getIcon } = wwLib.useIcons();
    const separatorIconHtml = ref("");

    watch(
      [() => props.content?.separatorIcon, () => props.content?.separatorType],
      async ([icon, type]) => {
        if (icon && type === "icon") {
          try {
            const html = await getIcon(icon);
            separatorIconHtml.value = html || "";
          } catch (error) {
            separatorIconHtml.value = "";
          }
        } else {
          separatorIconHtml.value = "";
        }
      },
      { immediate: true },
    );

    // Compute render items (fields and separators)
    const renderItems = computed(() => {
      const items = [];
      const format = props.content?.format || "xxxxxx";
      let fieldIndex = 0;

      for (let i = 0; i < format.length; i++) {
        if (format[i] === "x" || format[i] === "X") {
          items.push({ type: "field", position: i, fieldIndex: fieldIndex++ });
        } else if (props.content?.separatorType !== "none") {
          items.push({ type: "separator", position: i, char: format[i] });
        }
      }

      return items;
    });

    // Computed styles
    const rootStyles = computed(() => ({
      display: "flex",
      alignItems: "center",
      gap: props.content?.gap || "8px",
    }));

    const rootClasses = computed(() => [
      {
        "is-focused": focusedIndex.value !== null,
        "is-complete": isComplete.value,
        "is-invalid": !isValid.value,
        "is-readonly": props.content?.readonly,
        "is-disabled": props.content?.disabled,
      },
    ]);

    const fieldStyles = (index) => ({
      width: props.content?.fieldWidth || "40px",
      height: props.content?.fieldHeight || "40px",
      borderRadius: props.content?.borderRadius || "4px",
      borderWidth: props.content?.borderWidth || "1px",
      borderStyle: "solid",
      borderColor: getBorderColor(index),
      backgroundColor: props.content?.backgroundColor || "#ffffff",
      textAlign: props.content?.textAlign || "center",
      fontFamily: props.content?.fontFamily || "inherit",
      fontSize: props.content?.fontSize || "18px",
      fontWeight: props.content?.fontWeight || 500,
      color: props.content?.color || "#000000",
      outline: "none",
      transition: "border-color 0.2s",
      "--placeholder-color": props.content?.placeholderColor || "#999999",
    });

    const fieldClasses = (index) => [
      "ww-input-otp__field",
      {
        "is-focused": focusedIndex.value === index,
        "is-filled": fieldValues.value[index] !== "",
        "is-masked": props.content?.maskInput,
      },
    ];

    const separatorStyles = computed(() => ({
      color: props.content?.separatorColor || "#000000",
      fontSize: props.content?.separatorSize || "18px",
      fontWeight: "bold",
      userSelect: "none",
    }));

    const separatorContent = computed(() => {
      if (props.content?.separatorType === "icon") {
        return separatorIconHtml.value;
      } else if (props.content?.separatorType === "char") {
        return props.content?.separatorChar || "-";
      }
      return "";
    });

    // Helper function to get border color
    function getBorderColor(index) {
      if (focusedIndex.value === index) {
        return props.content?.borderColorFocus || "#3b82f6";
      }
      return props.content?.borderColor || "#cccccc";
    }

    // Register local context
    const localData = ref({
      value: combinedValue,
      isComplete,
      isValid,
      isFocused: computed(() => focusedIndex.value !== null),
    });

    const methods = {
      focus: {
        method: focus,
        editor: {
          label: "Focus",
          description: "Focus the first empty field or first field",
        },
      },
      clear: {
        method: clear,
        editor: {
          label: "Clear",
          description: "Clear all OTP fields",
        },
      },
      setValue: {
        method: setValue,
        editor: {
          label: "Set Value",
          description: "Set the OTP value programmatically",
          args: [
            {
              name: "value",
              type: "string",
              required: true,
            },
          ],
        },
      },
    };

    const markdown = `
### OTP Input Local Data

The OTP input component exposes the following data:

#### value
The current OTP value without separators

#### isComplete  
Boolean indicating if all fields are filled

#### isValid
Boolean indicating if the value passes validation

#### isFocused
Boolean indicating if any field is currently focused
`;

    wwLib.wwElement.useRegisterElementLocalContext(
      "otp-input",
      localData,
      methods,
      markdown,
    );

    // Mask input display
    const maskInput = computed(() => props.content?.maskInput);

    // Watch for masked input changes
    watch(maskInput, (masked) => {
      // Force re-render by toggling a key
      // This ensures proper placeholder/value display
    });

    return {
      inputRefs,
      rootElement,
      formatInfo,
      fieldValues,
      renderItems,
      rootStyles,
      rootClasses,
      fieldStyles,
      fieldClasses,
      separatorStyles,
      separatorContent,
      inputPattern,
      inputMode,
      maskInput,
      handleInput,
      handleKeydown,
      handlePaste,
      handleFocus,
      handleBlur,
      _focus: focus,
      _clear: clear,
      _setValue: setValue,
    };
  },
  methods: {
    focus() {
      this._focus();
    },
    clear() {
      this._clear();
    },
    setValue(value) {
      this._setValue(value);
    },
  },
};
</script>

<style lang="scss" scoped>
.ww-input-otp {
  position: relative;

  &__field {
    box-sizing: border-box;
    font-family: inherit;
    padding: 0;
    line-height: normal;

    &::placeholder {
      color: var(--placeholder-color);
      opacity: 1;
      line-height: normal;
    }

    &.is-masked {
      -webkit-text-security: disc;
      text-security: disc;
    }

    /* Remove spinner buttons */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    -moz-appearance: textfield;
  }

  &__separator {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    :deep(svg) {
      width: 1em;
      height: 1em;
    }
  }

  /* States */
  &.is-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &.is-readonly {
    .ww-input-otp__field {
      cursor: default;
    }
  }
}
</style>
