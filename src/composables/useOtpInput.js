import { ref, computed, watch, nextTick } from 'vue';
import { debounce } from 'lodash-es';

export function useOtpInput(props, emit) {
    const inputRefs = ref([]);
    const focusedIndex = ref(null);
    const isDebouncing = ref(false);
    let debounceTimeout = null;

    // Parse format to get field positions and separators
    const formatInfo = computed(() => {
        const format = props.content?.format || 'xxxxxx';
        const fields = [];
        const separators = [];
        let fieldIndex = 0;

        for (let i = 0; i < format.length; i++) {
            if (format[i] === 'x' || format[i] === 'X') {
                fields.push({ position: i, index: fieldIndex++ });
            } else {
                separators.push({ position: i, char: format[i] });
            }
        }

        return { fields, separators, totalFields: fields.length };
    });

    // Initialize value based on format length
    const defaultValue = computed(() => {
        const initValue = props.content?.value || '';
        const totalFields = formatInfo.value.totalFields;
        return initValue.padEnd(totalFields, '').slice(0, totalFields);
    });

    // Create component variable for value persistence
    const { value: otpValue, setValue: setOtpValue } = wwLib.wwVariable.useComponentVariable({
        uid: props.uid,
        name: 'value',
        type: 'string',
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
        const value = otpValue.value || '';
        return formatInfo.value.fields.map(field => value[field.index] || '');
    });

    // Combined value without separators
    const combinedValue = computed(() => fieldValues.value.join(''));

    // Check if all fields are filled
    const isComplete = computed(() => {
        return fieldValues.value.every(val => val !== '');
    });

    // Validation state
    const isValid = computed(() => {
        if (!props.content?.required && combinedValue.value === '') return true;
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
        return props.content?.type === 'numeric' ? '[0-9]' : '[a-zA-Z0-9]';
    });

    const inputMode = computed(() => {
        return props.content?.type === 'numeric' ? 'numeric' : 'text';
    });

    // Debounce delay
    const delay = computed(() => {
        const delayStr = props.content?.debounceDelay || '500ms';
        return parseInt(delayStr);
    });

    // Handle input changes
    function handleInput(index, event) {
        const value = event.target.value;
        const char = value.slice(-1); // Get last character

        // Validate input based on type
        if (props.content?.type === 'numeric' && !/[0-9]/.test(char)) {
            event.target.value = fieldValues.value[index];
            return;
        }
        if (props.content?.type === 'alphanumeric' && !/[a-zA-Z0-9]/.test(char)) {
            event.target.value = fieldValues.value[index];
            return;
        }

        // Update value
        const newValues = [...fieldValues.value];
        newValues[index] = char;
        const newOtpValue = newValues.join('');
        setOtpValue(newOtpValue);

        // Auto advance to next field
        if (char && index < formatInfo.value.totalFields - 1) {
            focusField(index + 1);
        }

        // Emit change event
        emitChange(newOtpValue);

        // Check for completion
        if (newValues.every(val => val !== '')) {
            emit('trigger-event', { name: 'complete', event: { value: newOtpValue } });
            
            // Auto submit if enabled
            if (props.content?.autoSubmit) {
                emit('trigger-event', { name: 'submit', event: { value: newOtpValue } });
            }
        }
    }

    // Handle backspace
    function handleKeydown(index, event) {
        if (event.key === 'Backspace') {
            if (!fieldValues.value[index] && index > 0) {
                // Move to previous field if current is empty
                focusField(index - 1);
                event.preventDefault();
            } else if (fieldValues.value[index]) {
                // Clear current field
                const newValues = [...fieldValues.value];
                newValues[index] = '';
                const newOtpValue = newValues.join('');
                setOtpValue(newOtpValue);
                emitChange(newOtpValue);
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            focusField(index - 1);
        } else if (event.key === 'ArrowRight' && index < formatInfo.value.totalFields - 1) {
            focusField(index + 1);
        }
    }

    // Handle paste
    function handlePaste(event) {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text');
        const cleanedData = pastedData.replace(/[^a-zA-Z0-9]/g, '');
        
        // Filter based on input type
        let filteredData = cleanedData;
        if (props.content?.type === 'numeric') {
            filteredData = cleanedData.replace(/[^0-9]/g, '');
        }

        // Split and fill fields
        const chars = filteredData.split('');
        const newValues = [...fieldValues.value];
        
        chars.forEach((char, i) => {
            if (i < formatInfo.value.totalFields) {
                newValues[i] = char;
            }
        });

        const newOtpValue = newValues.join('');
        setOtpValue(newOtpValue);
        emitChange(newOtpValue);

        // Focus last filled field or last field
        const lastFilledIndex = newValues.findLastIndex(val => val !== '');
        const focusIndex = Math.min(lastFilledIndex + 1, formatInfo.value.totalFields - 1);
        focusField(focusIndex);

        // Check for completion
        if (newValues.every(val => val !== '')) {
            emit('trigger-event', { name: 'complete', event: { value: newOtpValue } });
            
            // Auto submit if enabled
            if (props.content?.autoSubmit) {
                emit('trigger-event', { name: 'submit', event: { value: newOtpValue } });
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
        emit('trigger-event', { name: 'focus' });
        emit('add-state', 'focus');
    }

    // Handle blur events
    function handleBlur() {
        // Check if focus moved to another input
        nextTick(() => {
            const stillFocused = inputRefs.value.some(ref => ref === document.activeElement);
            if (!stillFocused) {
                focusedIndex.value = null;
                emit('trigger-event', { name: 'blur' });
                emit('remove-state', 'focus');
            }
        });
    }

    // Emit change event with debounce
    function emitChange(value) {
        if (props.content?.debounce) {
            isDebouncing.value = true;
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            debounceTimeout = setTimeout(() => {
                emit('trigger-event', { name: 'change', event: { value } });
                isDebouncing.value = false;
            }, delay.value);
        } else {
            emit('trigger-event', { name: 'change', event: { value } });
        }
    }

    // Public methods
    function focus() {
        const firstEmptyIndex = fieldValues.value.findIndex(val => val === '');
        focusField(firstEmptyIndex !== -1 ? firstEmptyIndex : 0);
    }

    function clear() {
        setOtpValue('');
        emit('trigger-event', { name: 'clear', event: { value: '' } });
        focusField(0);
    }

    function setValue(value) {
        const cleanValue = String(value || '').slice(0, formatInfo.value.totalFields);
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
            emit('add-state', 'complete');
        } else {
            emit('remove-state', 'complete');
        }
    });

    watch(isValid, (valid) => {
        if (!valid) {
            emit('add-state', 'error');
        } else {
            emit('remove-state', 'error');
        }
    });

    watch(() => props.content?.readonly, (readonly) => {
        if (readonly) {
            emit('add-state', 'readonly');
        } else {
            emit('remove-state', 'readonly');
        }
    }, { immediate: true });

    watch(() => props.content?.disabled, (disabled) => {
        if (disabled) {
            emit('add-state', 'disabled');
        } else {
            emit('remove-state', 'disabled');
        }
    }, { immediate: true });

    return {
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
    };
}