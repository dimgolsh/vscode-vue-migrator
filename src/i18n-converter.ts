import * as vscode from "vscode";
import {
  convertFolder as convertI18nFolder,
  convertSingleFile,
} from "vue-i18n-migrator";

function getLegacyFromConfig(): boolean {
  const config = vscode.workspace.getConfiguration("vueMigrator");
  return config.get<boolean>("legacy", false);
}

async function convertI18nFile(uri: vscode.Uri): Promise<void> {
  try {
    await convertSingleFile(uri.fsPath, {
      legacy: getLegacyFromConfig(),
      view: false,
    });

    vscode.window.showInformationMessage(
      "Successfully converted to i18n syntax"
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error converting file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function registerI18nCommands(context: vscode.ExtensionContext) {
  let convertI18nFileDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertI18n",
    async (uri?: vscode.Uri) => {
      try {
        // If URI is provided (context menu case), use it
        if (uri) {
          await convertI18nFile(uri);
          return;
        }

        // Otherwise use active editor (command palette or editor context menu case)
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

        await convertI18nFile(document.uri);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error converting file: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  let convertI18nFolderDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertI18nFolder",
    async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showErrorMessage("No folder selected");
        return;
      }

      try {
        const folderPath = uri.fsPath;

        await convertI18nFolder(folderPath, {
          legacy: getLegacyFromConfig(),
          view: false,
        });
        vscode.window.showInformationMessage(
          "Successfully converted folder i18n"
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(
          `Error converting folder i18n: ${errorMessage}`
        );
        console.error("Full error details:", error);
      }
    }
  );

  context.subscriptions.push(
    convertI18nFileDisposable,
    convertI18nFolderDisposable
  );
}
