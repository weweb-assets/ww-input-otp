<template>
    <div class="ww-input-otp" :class="rootClasses" :style="rootStyles">
        <template v-for="(item, index) in renderItems" :key="`${item.type}-${index}`">
            <input
                v-if="item.type === 'field'"
                :ref="el => inputRefs[item.fieldIndex] = el"
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
import { computed, inject, ref, watch, onMounted } from 'vue';
import { useOtpInput } from './composables/useOtpInput';

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
    emits: ['trigger-event', 'add-state', 'remove-state', 'update:sidepanel-content'],
    setup(props, { emit }) {
        // Form integration
        const useForm = inject('_wwForm:useForm', () => {});
        const formContext = inject('_wwForm:info', null);
        
        // Use OTP input composable
        const {
            inputRefs,
            focusedIndex,
            formatInfo,
            fieldValues,
            combinedValue,
            isComplete,
            isValid,
            inputPattern,
            inputMode,
            handleInput,
            handleKeydown,
            handlePaste,
            handleFocus,
            handleBlur,
            focus,
            clear,
            setValue,
            isDebouncing,
        } = useOtpInput(props, emit);

        // Form field configuration
        const fieldName = computed(() => props.content?.fieldName);
        const validation = computed(() => props.content?.validation);
        const customValidation = computed(() => props.content?.customValidation);
        const required = computed(() => props.content?.required);

        // Use form integration
        useForm(
            combinedValue,
            { fieldName, validation, customValidation, required },
            { elementState: props.wwElementState, emit, sidepanelFormPath: 'form', setValue }
        );

        // Separator icon handling
        const { getIcon } = wwLib.useIcons();
        const separatorIconHtml = ref('');

        watch(
            [() => props.content?.separatorIcon, () => props.content?.separatorType],
            async ([icon, type]) => {
                console.log('OTP Debug - Watch triggered - icon:', icon, 'type:', type);
                if (icon && type === 'icon') {
                    try {
                        const html = await getIcon(icon);
                        console.log('OTP Debug - Got icon HTML:', html);
                        separatorIconHtml.value = html;
                    } catch (error) {
                        console.error('OTP Debug - Icon error:', error);
                        separatorIconHtml.value = '';
                    }
                } else {
                    separatorIconHtml.value = '';
                }
            },
            { immediate: true }
        );

        // Compute render items (fields and separators)
        const renderItems = computed(() => {
            const items = [];
            const format = props.content?.format || 'xxxxxx';
            let fieldIndex = 0;

            console.log('OTP Debug - format:', format);
            console.log('OTP Debug - content:', props.content);
            console.log('OTP Debug - format.length:', format.length);

            for (let i = 0; i < format.length; i++) {
                console.log(`OTP Debug - checking char at ${i}:`, format[i]);
                if (format[i] === 'x' || format[i] === 'X') {
                    items.push({ type: 'field', position: i, fieldIndex: fieldIndex++ });
                } else if (props.content?.separatorType !== 'none') {
                    items.push({ type: 'separator', position: i, char: format[i] });
                }
            }

            console.log('OTP Debug - final renderItems:', items);
            console.log('OTP Debug - items.length:', items.length);
            return items;
        });

        // Computed styles
        const rootStyles = computed(() => ({
            display: 'flex',
            alignItems: 'center',
            gap: props.content?.gap || '8px',
        }));

        const rootClasses = computed(() => [
            {
                'is-focused': focusedIndex.value !== null,
                'is-complete': isComplete.value,
                'is-invalid': !isValid.value,
                'is-readonly': props.content?.readonly,
                'is-disabled': props.content?.disabled,
            }
        ]);

        const fieldStyles = (index) => ({
            width: props.content?.fieldWidth || '40px',
            height: props.content?.fieldHeight || '40px',
            borderRadius: props.content?.borderRadius || '4px',
            borderWidth: props.content?.borderWidth || '1px',
            borderStyle: 'solid',
            borderColor: getBorderColor(index),
            backgroundColor: props.content?.backgroundColor || '#ffffff',
            textAlign: props.content?.textAlign || 'center',
            fontSize: props.content?.fontSize || '18px',
            fontWeight: props.content?.fontWeight || 500,
            color: props.content?.color || '#000000',
            outline: 'none',
            transition: 'border-color 0.2s',
            '--placeholder-color': props.content?.placeholderColor || '#999999',
        });

        const fieldClasses = (index) => [
            'ww-input-otp__field',
            {
                'is-focused': focusedIndex.value === index,
                'is-filled': fieldValues.value[index] !== '',
                'is-masked': props.content?.maskInput,
            }
        ];

        const separatorStyles = computed(() => ({
            color: props.content?.separatorColor || '#000000',
            fontSize: props.content?.separatorSize || '18px',
            fontWeight: 'bold',
            userSelect: 'none',
        }));

        const separatorContent = computed(() => {
            console.log('OTP Debug - separatorType:', props.content?.separatorType);
            console.log('OTP Debug - separatorChar:', props.content?.separatorChar);
            console.log('OTP Debug - separatorIcon:', props.content?.separatorIcon);
            console.log('OTP Debug - separatorIconHtml:', separatorIconHtml.value);
            
            if (props.content?.separatorType === 'icon') {
                return separatorIconHtml.value;
            } else if (props.content?.separatorType === 'char') {
                return props.content?.separatorChar || '-';
            }
            return '';
        });

        // Helper function to get border color
        function getBorderColor(index) {
            if (!isValid.value) {
                return props.content?.borderColorError || '#ef4444';
            }
            if (focusedIndex.value === index) {
                return props.content?.borderColorFocus || '#3b82f6';
            }
            return props.content?.borderColor || '#cccccc';
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
                    label: 'Focus',
                    description: 'Focus the first empty field or first field',
                },
            },
            clear: {
                method: clear,
                editor: {
                    label: 'Clear',
                    description: 'Clear all OTP fields',
                },
            },
            setValue: {
                method: setValue,
                editor: {
                    label: 'Set Value',
                    description: 'Set the OTP value programmatically',
                    args: [
                        {
                            name: 'value',
                            type: 'string',
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

        wwLib.wwElement.useRegisterElementLocalContext('otp-input', localData, methods, markdown);

        // Mask input display
        const maskInput = computed(() => props.content?.maskInput);

        // Watch for masked input changes
        watch(maskInput, (masked) => {
            // Force re-render by toggling a key
            // This ensures proper placeholder/value display
        });

        return {
            inputRefs,
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

        &::placeholder {
            color: var(--placeholder-color);
            opacity: 1;
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

        ::v-deep svg {
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