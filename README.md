# WeWeb OTP Input Component

A customizable One-Time Password (OTP) input component for WeWeb NoCode platform with flexible format patterns and full form integration.

## Features

- **Flexible Format Patterns**: Define custom patterns like "xx-xx-xx", "xxx-xxx", "xxxxxx"
- **Auto-focus Navigation**: Automatically moves focus between fields
- **Paste Support**: Paste entire codes and auto-distribute across fields
- **Keyboard Navigation**: Navigate with arrow keys and backspace
- **Customizable Separators**: Use characters or icons as separators
- **Form Container Integration**: Full support for ww-form-container
- **Validation Support**: Built-in required validation and custom validation
- **Auto-submit**: Option to submit when all fields are filled
- **Masking**: Option to hide input values
- **States**: Focus, error, and complete states

## Usage

This component can be used for:
- SMS verification codes
- Email verification codes
- Two-factor authentication
- Secure PIN entry
- Any pattern-based code input

## Format String

The format string defines the input pattern:
- `x` represents an input field
- Any other character is treated as a separator
- Examples:
  - "xxxxxx" - 6 digits, no separators
  - "xxx-xxx" - 6 digits with dash separator
  - "xx xx xx" - 6 digits with space separators
  - "xxxx xxxx" - 8 digits with space separator

## Development

```bash
npm install
npm run build
npm run serve
```

## License

MIT