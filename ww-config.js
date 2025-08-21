export default {
    inherit: {
        type: 'ww-layout',
    },
    options: {
        displayAllowedValues: ['flex', 'grid', 'inline-flex', 'inline-grid'],
    },
    editor: {
        label: { en: 'OTP Input', fr: 'Entrée OTP' },
        icon: 'input',
        customSettingsPropertiesOrder: [
            'formInfobox',
            ['fieldName', 'customValidation', 'validation'],
            'format',
            'type',
            'value',
            'autoFocus',
            'autoSubmit',
            'required',
            'readonly',
            'disabled',
        ],
        customStylePropertiesOrder: [
            [
                'gap',
                'fieldWidth',
                'fieldHeight',
            ],
            [
                'borderRadius',
                'borderWidth',
                'borderColor',
                'borderColorFocus',
                'backgroundColor',
            ],
            [
                'textAlign',
                'fontFamily',
                'fontSize',
                'fontWeight',
                'color',
                'displayPlaceholder',
                'placeholderChar',
                'placeholderColor',
                'maskInput',
                'maskCharacter',
                'maskColor',
            ],
            [
                'separatorType',
                'separatorChar',
                'separatorIcon',
                'separatorColor',
                'separatorSize',
            ],
        ],
    },
    states: ['focus', 'readonly', 'disabled', 'error', 'complete'],
    actions: [
        { label: 'Focus first field', action: 'focus' },
        { label: 'Clear all fields', action: 'clear' },
        { label: 'Set value', action: 'setValue', args: [{ name: 'value', type: 'string' }] },
    ],
    triggerEvents: [
        { name: 'change', label: { en: 'On change' }, event: { value: '' }, default: true },
        { name: 'complete', label: { en: 'On complete' }, event: { value: '' } },
        { name: 'focus', label: { en: 'On focus' }, event: null },
        { name: 'blur', label: { en: 'On blur' }, event: null },
        { name: 'clear', label: { en: 'On clear' }, event: null },
    ],
    properties: {
        /* wwEditor:start */
        form: {
            editorOnly: true,
            hidden: true,
            defaultValue: false,
        },
        formInfobox: {
            type: 'InfoBox',
            section: 'settings',
            options: (_, sidePanelContent) => ({
                variant: sidePanelContent.form?.name ? 'success' : 'warning',
                icon: 'pencil',
                title: sidePanelContent.form?.name || 'Unnamed form',
                content: !sidePanelContent.form?.name && 'Give your form a meaningful name.',
            }),
            hidden: (_, sidePanelContent) => {
                return !sidePanelContent.form;
            },
        },
        /* wwEditor:end */
        fieldName: {
            label: 'Field name',
            section: 'settings',
            type: 'Text',
            defaultValue: '',
            bindable: true,
            hidden: (_, sidePanelContent) => {
                return !sidePanelContent.form?.uid;
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A string that defines the field name: `"otp_code"`',
            },
            /* wwEditor:end */
        },
        customValidation: {
            label: 'Custom validation',
            section: 'settings',
            type: 'OnOff',
            defaultValue: false,
            bindable: true,
            hidden: (_, sidePanelContent) => {
                return !sidePanelContent.form?.uid;
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean value',
            },
            /* wwEditor:end */
        },
        validation: {
            label: 'Validation',
            section: 'settings',
            type: 'Formula',
            defaultValue: '',
            bindable: false,
            hidden: (content, sidePanelContent) => {
                return !sidePanelContent.form?.uid || !content.customValidation;
            },
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean formula for validation',
            },
            /* wwEditor:end */
        },
        format: {
            label: { en: 'Format', fr: 'Format' },
            type: 'Text',
            section: 'settings',
            defaultValue: 'xxxxxx',
            placeholder: 'xx-xx-xx',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A format string like "xx-xx-xx" where x represents input fields',
            },
            propertyHelp: {
                tooltip: 'Define the OTP pattern. Use "x" for input fields and any other character as separator. Examples: "xxxxxx", "xxx-xxx", "xx xx xx"',
            },
            /* wwEditor:end */
        },
        type: {
            label: { en: 'Input type', fr: 'Type d\'entrée' },
            type: 'TextSelect',
            section: 'settings',
            options: {
                options: [
                    { value: 'numeric', label: { en: 'Numeric', fr: 'Numérique' } },
                    { value: 'alphanumeric', label: { en: 'Alphanumeric', fr: 'Alphanumérique' } },
                ],
            },
            defaultValue: 'numeric',
        },
        value: {
            label: { en: 'Init value', fr: 'Valeur initiale' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: '',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A string value like "123456"',
            },
            /* wwEditor:end */
        },
        autoFocus: {
            label: { en: 'Auto focus', fr: 'Focus automatique' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean value',
            },
            /* wwEditor:end */
        },
        autoSubmit: {
            label: { en: 'Auto submit', fr: 'Soumission automatique' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean value',
            },
            /* wwEditor:end */
        },
        required: {
            label: { en: 'Required', fr: 'Requis' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean value',
            },
            /* wwEditor:end */
        },
        readonly: {
            label: { en: 'Read only', fr: 'Lecture seule' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean value',
            },
            /* wwEditor:end */
        },
        disabled: {
            label: { en: 'Disabled', fr: 'Désactivé' },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean value',
            },
            /* wwEditor:end */
        },
        gap: {
            label: { en: 'Gap', fr: 'Écart' },
            type: 'Length',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 50 }],
            },
            responsive: true,
            states: true,
            defaultValue: '8px',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A length value like "8px"',
            },
            /* wwEditor:end */
        },
        fieldWidth: {
            label: { en: 'Field width', fr: 'Largeur du champ' },
            type: 'Length',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 20, max: 100 },
                    { value: 'em', label: 'em', min: 1, max: 10 },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: '40px',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A length value like "40px"',
            },
            /* wwEditor:end */
        },
        fieldHeight: {
            label: { en: 'Field height', fr: 'Hauteur du champ' },
            type: 'Length',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 20, max: 100 },
                    { value: 'em', label: 'em', min: 1, max: 10 },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: '40px',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A length value like "40px"',
            },
            /* wwEditor:end */
        },
        borderRadius: {
            label: { en: 'Border radius', fr: 'Rayon de bordure' },
            type: 'Length',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 50 }],
            },
            responsive: true,
            states: true,
            defaultValue: '4px',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A length value like "4px"',
            },
            /* wwEditor:end */
        },
        borderWidth: {
            label: { en: 'Border width', fr: 'Largeur de bordure' },
            type: 'Length',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 10 }],
            },
            responsive: true,
            states: true,
            defaultValue: '1px',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A length value like "1px"',
            },
            /* wwEditor:end */
        },
        borderColor: {
            label: { en: 'Border color', fr: 'Couleur de bordure' },
            type: 'Color',
            responsive: true,
            states: true,
            defaultValue: '#cccccc',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A color value like "#cccccc"',
            },
            /* wwEditor:end */
        },
        borderColorFocus: {
            label: { en: 'Border color (focus)', fr: 'Couleur de bordure (focus)' },
            type: 'Color',
            responsive: true,
            states: true,
            defaultValue: '#3b82f6',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A color value like "#3b82f6"',
            },
            /* wwEditor:end */
        },
        backgroundColor: {
            label: { en: 'Background color', fr: 'Couleur de fond' },
            type: 'Color',
            responsive: true,
            states: true,
            defaultValue: '#ffffff',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A color value like "#ffffff"',
            },
            /* wwEditor:end */
        },
        textAlign: {
            label: { en: 'Text align', fr: 'Alignement du texte' },
            type: 'TextRadioGroup',
            options: {
                choices: [
                    { value: 'left', icon: 'align-left' },
                    { value: 'center', icon: 'align-middle' },
                    { value: 'right', icon: 'align-right' },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: 'center',
        },
        fontFamily: {
            label: { en: 'Font family', fr: 'Police' },
            type: 'FontFamily',
            responsive: true,
            states: true,
            defaultValue: '',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A font family name',
            },
            /* wwEditor:end */
        },
        fontSize: {
            label: { en: 'Font size', fr: 'Taille de police' },
            type: 'Length',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 8, max: 48 },
                    { value: 'em', label: 'em', min: 0.5, max: 3 },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: '18px',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A length value like "18px"',
            },
            /* wwEditor:end */
        },
        fontWeight: {
            label: { en: 'Font weight', fr: 'Graisse de police' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: null, label: 'Default' },
                    { value: 100, label: '100 - Thin' },
                    { value: 200, label: '200 - Extra Light' },
                    { value: 300, label: '300 - Light' },
                    { value: 400, label: '400 - Normal' },
                    { value: 500, label: '500 - Medium' },
                    { value: 600, label: '600 - Semi Bold' },
                    { value: 700, label: '700 - Bold' },
                    { value: 800, label: '800 - Extra Bold' },
                    { value: 900, label: '900 - Black' },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: 500,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'A number between 100 and 900',
            },
            /* wwEditor:end */
        },
        color: {
            label: { en: 'Text color', fr: 'Couleur du texte' },
            type: 'Color',
            responsive: true,
            states: true,
            defaultValue: '#000000',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A color value like "#000000"',
            },
            /* wwEditor:end */
        },
        placeholderChar: {
            label: { en: 'Placeholder', fr: 'Caractère de remplacement' },
            type: 'Text',
            defaultValue: '·',
            hidden: content => !content.displayPlaceholder,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A single character like "•"',
            },
            /* wwEditor:end */
        },
        placeholderColor: {
            label: { en: 'Placeholder color', fr: 'Couleur du placeholder' },
            type: 'Color',
            responsive: true,
            states: true,
            defaultValue: '#999999',
            hidden: content => !content.displayPlaceholder,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A color value like "#999999"',
            },
            /* wwEditor:end */
        },
        maskInput: {
            label: { en: 'Mask input', fr: 'Masquer l\'entrée' },
            type: 'OnOff',
            defaultValue: false,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'A boolean value',
            },
            /* wwEditor:end */
        },
        maskCharacter: {
            label: { en: 'Mask character', fr: 'Caractère de masquage' },
            type: 'Text',
            defaultValue: '·',
            hidden: content => !content.maskInput,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A single character like "•"',
            },
            /* wwEditor:end */
        },
        maskColor: {
            label: { en: 'Mask color', fr: 'Couleur du masquage' },
            type: 'Color',
            responsive: true,
            states: true,
            defaultValue: '#000000',
            hidden: content => !content.maskInput,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A color value like "#000000"',
            },
            /* wwEditor:end */
        },
        displayPlaceholder: {
            label: { en: 'Display placeholder', fr: 'Afficher le placeholder' },
            type: 'OnOff',
            defaultValue: true,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'boolean',
                tooltip: 'Whether to show placeholder in empty fields',
            },
            /* wwEditor:end */
        },
        separatorType: {
            label: { en: 'Separator type', fr: 'Type de séparateur' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'none', label: { en: 'None', fr: 'Aucun' } },
                    { value: 'character', label: { en: 'Character', fr: 'Caractère' } },
                    { value: 'icon', label: { en: 'Icon', fr: 'Icône' } },
                ],
            },
            defaultValue: 'character',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Either "none", "character", or "icon"',
            },
            propertyHelp: {
                tooltip: 'To display separators, include them in the Format field. For example: "xxx-xxx" or "xx xx xx". Any non-x character in the format will be treated as a separator.',
            },
            /* wwEditor:end */
        },
        separatorChar: {
            label: { en: 'Separator', fr: 'Séparateur' },
            type: 'Text',
            defaultValue: '-',
            hidden: content => content.separatorType !== 'character',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A separator character like "-"',
            },
            /* wwEditor:end */
        },
        separatorIcon: {
            label: { en: 'Separator icon', fr: 'Icône de séparateur' },
            type: 'SystemIcon',
            hidden: content => content.separatorType !== 'icon',
            bindable: true,
            defaultValue: 'lucide/separator-vertical',
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'An icon name for the separator',
            },
            /* wwEditor:end */
        },
        separatorColor: {
            label: { en: 'Separator color', fr: 'Couleur du séparateur' },
            type: 'Color',
            responsive: true,
            states: true,
            defaultValue: '#000000',
            hidden: content => content.separatorType === 'none',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A color value like "#000000"',
            },
            /* wwEditor:end */
        },
        separatorSize: {
            label: { en: 'Separator size', fr: 'Taille du séparateur' },
            type: 'Length',
            options: {
                unitChoices: [
                    { value: 'px', label: 'px', min: 8, max: 48 },
                    { value: 'em', label: 'em', min: 0.5, max: 3 },
                ],
            },
            responsive: true,
            states: true,
            defaultValue: '18px',
            hidden: content => content.separatorType === 'none',
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'A length value like "18px"',
            },
            /* wwEditor:end */
        },
    },
};
