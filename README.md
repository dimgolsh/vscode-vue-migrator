# Vue Migrator VS Code Extension

VS Code extension for migrating Vue components to the script setup syntax and converting Vue i18n.

## Features

### Vue Component Migration
- Convert Vue components to script setup syntax
- Convert props to reactivity syntax
- Batch convert entire folders
- Automatic code formatting after conversion

### Vue i18n Migration
- Convert Vue files to use i18n syntax
- Convert entire folders to i18n
- Automatic code formatting after conversion

## Usage

### Context Menu
Right-click on a Vue file or folder in the explorer to access:
- "Convert to Script Setup" - Converts a single file to script setup syntax
- "Convert Props to Reactivity" - Converts props to reactivity syntax
- "Convert Folder to Script Setup" - Converts all Vue files in a folder
- "Convert Vue i18n" - Converts a single file to i18n syntax
- "Convert i18n Folder" - Converts all Vue files in a folder to i18n syntax

### Editor Context Menu
Right-click in the editor to access:
- "Convert to Script Setup" - Converts current file
- "Convert Props to Reactivity" - Converts selected code or entire file
- "Convert Vue i18n" - Converts current file to i18n syntax

## Development

### Prerequisites
- Node.js
- npm/yarn
- VS Code

### Setup
1. Clone the repository
```bash
git clone https://github.com/dimgolsh/vscode-vue-migrator.git
cd vscode-vue-migrator
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

### Building VSIX Package
To create a VSIX package for distribution:

1. Install vsce globally (if not already installed)
```bash
npm install -g @vscode/vsce
```

2. Package the extension
```bash
vsce package
```

This will create a `.vsix` file in your project directory.

### Installing the VSIX
1. In VS Code, go to the Extensions view
2. Click on the "..." menu (More Actions)
3. Select "Install from VSIX..."
4. Choose the generated `.vsix` file

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT 