---
name: ww-input-otp
description: A customizable One-Time Password (OTP) input component with flexible format patterns, form integration, and validation support
keywords: otp, one-time password, verification, authentication, form, validation, pin, code
---

#### OTP Input

Properties:
- `format`: `string` - Defines the OTP pattern using 'x' for input fields and any other character as separator. Default: `'xxxxxx'`
- `type`: `'numeric' | 'alphanumeric'` - The allowed input type. Default: `'numeric'`
- `value`: `string` - The initial value for the OTP fields. Default: `''`
- `fieldName`: `string` - The field name for form integration. Default: `''`
- `autoFocus`: `boolean` - Whether to automatically focus the first field on mount. Default: `true`
- `autoSubmit`: `boolean` - Whether to automatically submit when all fields are filled. Default: `false`
- `required`: `boolean` - Whether the field is required for form validation. Default: `false`
- `readonly`: `boolean` - Whether the fields are read-only. Default: `false`
- `disabled`: `boolean` - Whether the fields are disabled. Default: `false`

Form Validation:
- `customValidation`: `boolean` - Enable custom validation formula. Default: `false`
- `validation`: `Formula` - Custom validation formula that returns true/false. Default: `''`

Field Styling:
- `gap`: `string` - The gap between input fields. Default: `'8px'`
- `fieldWidth`: `string` - The width of each input field. Default: `'40px'`
- `fieldHeight`: `string` - The height of each input field. Default: `'40px'`
- `borderRadius`: `string` - The border radius of input fields. Default: `'4px'`
- `borderWidth`: `string` - The border width of input fields. Default: `'1px'`
- `borderColor`: `string` - The border color of input fields. Default: `'#cccccc'`
- `borderColorFocus`: `string` - The border color when a field is focused. Default: `'#3b82f6'`
- `backgroundColor`: `string` - The background color of input fields. Default: `'#ffffff'`

Text Styling:
- `textAlign`: `'left' | 'center' | 'right'` - The text alignment in fields. Default: `'center'`
- `fontFamily`: `string` - The font family for input text. Default: `''`
- `fontSize`: `string` - The font size of input text. Default: `'18px'`
- `fontWeight`: `number | null` - The font weight of input text. Default: `500`
- `color`: `string` - The text color in input fields. Default: `'#000000'`
- `displayPlaceholder`: `boolean` - Whether to show placeholder in empty fields. Default: `true`
- `placeholderChar`: `string` - The placeholder character shown in empty fields. Default: `'·'`
- `placeholderColor`: `string` - The color of placeholder characters. Default: `'#999999'`
- `maskInput`: `boolean` - Whether to mask the input values. Default: `false`
- `maskCharacter`: `string` - The character to display when input is masked. Default: `'·'`
- `maskColor`: `string` - The color of masked characters. Default: `'#000000'`

Separator Styling:
- `separatorType`: `'none' | 'character' | 'icon'` - The type of separator between field groups. Default: `'character'`
- `separatorChar`: `string` - The character to use as separator (when type is 'character'). Default: `'-'`
- `separatorIcon`: `string` - The icon name to use as separator (when type is 'icon'). Default: `'lucide/separator-vertical'`
- `separatorColor`: `string` - The color of separators. Default: `'#000000'`
- `separatorSize`: `string` - The size of separators. Default: `'18px'`

States:
- `focus` - Applied when any field is focused
- `complete` - Applied when all fields are filled
- `error` - Applied when validation fails
- `readonly` - Applied when fields are read-only
- `disabled` - Applied when fields are disabled

Actions:
- `focus()` - Focus the first empty field or the first field
- `clear()` - Clear all fields
- `setValue(value: string)` - Set the OTP value programmatically

Triggers:
- `change` - Fired when the OTP value changes
- `complete` - Fired when all fields are filled
- `focus` - Fired when any field gains focus
- `blur` - Fired when all fields lose focus
- `clear` - Fired when fields are cleared

Component Variables:
- `value` - The raw OTP value without separators (e.g., "123456")
- `formattedValue` - The OTP value with separators included (e.g., "123-456") - read-only

Example:
<elements>
{"uid":0,"tag":"ww-input-otp","props":{"default":{"format":"xxx-xxx","type":"numeric","value":"","fieldName":"otp_code","autoFocus":true,"autoSubmit":false,"required":true,"readonly":false,"disabled":false,"customValidation":false,"validation":"","gap":"8px","fieldWidth":"40px","fieldHeight":"40px","borderRadius":"4px","borderWidth":"1px","borderColor":"#cccccc","borderColorFocus":"#3b82f6","backgroundColor":"#ffffff","textAlign":"center","fontFamily":"","fontSize":"18px","fontWeight":500,"color":"#000000","displayPlaceholder":true,"placeholderChar":"·","placeholderColor":"#999999","maskInput":false,"maskCharacter":"·","maskColor":"#000000","separatorType":"character","separatorChar":"-","separatorIcon":"lucide/separator-vertical","separatorColor":"#000000","separatorSize":"18px"}}}
</elements>