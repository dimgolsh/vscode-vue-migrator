import * as vscode from "vscode";
import { convertSingleFile, convertFolder } from "vue-class-to-composition";

function getLegacyFromConfig(): boolean {
  const config = vscode.workspace.getConfiguration("vueMigrator");
  return config.get<boolean>("legacy", false);
}

async function convertClassToCompositionFile(uri: vscode.Uri): Promise<void> {
  try {
    await convertSingleFile(uri.fsPath);

    vscode.window.showInformationMessage(
      "Successfully converted class component to composition API"
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error converting file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function registerClassToCompositionCommands(context: vscode.ExtensionContext) {
  let convertClassToCompositionFileDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertClassToComposition",
    async (uri?: vscode.Uri) => {
      try {
        // If URI is provided (context menu case), use it
        if (uri) {
          await convertClassToCompositionFile(uri);
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

        await convertClassToCompositionFile(document.uri);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Error converting file: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  let convertClassToCompositionFolderDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertClassToCompositionFolder",
    async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showErrorMessage("No folder selected");
        return;
      }

      try {
        const folderPath = uri.fsPath;

        await convertFolder(folderPath);
        vscode.window.showInformationMessage(
          "Successfully converted folder class components to composition API"
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(
          `Error converting folder class components: ${errorMessage}`
        );
        console.error("Full error details:", error);
      }
    }
  );

  context.subscriptions.push(
    convertClassToCompositionFileDisposable,
    convertClassToCompositionFolderDisposable
  );
} 