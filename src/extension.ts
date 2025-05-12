import * as vscode from "vscode";
import {
  convert,
  definePropsToReactivityProps,
  convertFolder,
  type ConvertFileOptions,
  PropsStyle,
} from "vue-comp-to-setup";
import { registerI18nCommands } from "./i18n-converter";
import { formatDocument } from "./utils";

function getPropsStyleFromConfig(): PropsStyle {
  const config = vscode.workspace.getConfiguration("vueMigrator");
  const propsStyle = config.get<string>("propsStyle", "reactivity");
  
  switch (propsStyle) {
    case "reactivity":
      return PropsStyle.ReactivityProps;
    case "defineProps":
      return PropsStyle.DefinePropsOptions;
    case "withDefaults":
      return PropsStyle.WithDefaults;
    default:
      return PropsStyle.ReactivityProps;
  }
}

export function activate(context: vscode.ExtensionContext) {
  let convertToSetupDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertToSetup",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
      }

      const document = editor.document;

      if (document.languageId !== "vue") {
        vscode.window.showErrorMessage(
          "This command only works with Vue files"
        );
        return;
      }

      try {
        const text = document.getText();
        const converted = await convert(text, {
          propsStyle: getPropsStyleFromConfig(),
          propsOptionsLike: false,
        });

        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );

        edit.replace(document.uri, fullRange, converted.content);
        await vscode.workspace.applyEdit(edit);

        // Format the document after conversion
        await formatDocument(document);

        vscode.window.showInformationMessage(
          "Successfully converted to script setup syntax"
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error converting file: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  let convertPropsDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertPropsToReactivity",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
      }

      const document = editor.document;

      if (document.languageId !== "vue") {
        vscode.window.showErrorMessage(
          "This command only works with Vue files"
        );
        return;
      }

      try {
        const selection = editor.selection;
        const text = selection.isEmpty
          ? document.getText()
          : document.getText(selection);

        const converted = await definePropsToReactivityProps(text);

        const edit = new vscode.WorkspaceEdit();
        const range = selection.isEmpty
          ? new vscode.Range(
              document.positionAt(0),
              document.positionAt(document.getText().length)
            )
          : selection;

        edit.replace(document.uri, range, converted.content);
        await vscode.workspace.applyEdit(edit);

        // Format the document after conversion
        await formatDocument(document);

        vscode.window.showInformationMessage(
          "Successfully converted props to reactivity"
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error converting props: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  let convertFolderDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertFolderToSetup",
    async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showErrorMessage("No folder selected");
        return;
      }

      try {
        const folderPath = uri.fsPath;

        const options: ConvertFileOptions = {
          view: false,
          propsOptionsLike: false,
          propsStyle: getPropsStyleFromConfig(),
        };
        const result = await convertFolder(folderPath, options);

        vscode.window.showInformationMessage(
          "Successfully converted folder to setup"
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error converting folder: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  // Register i18n commands
  registerI18nCommands(context);

  context.subscriptions.push(
    convertToSetupDisposable,
    convertPropsDisposable,
    convertFolderDisposable
  );
}

export function deactivate() {}
