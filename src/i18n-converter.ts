import * as vscode from "vscode";
import {
  convertSingleFile,
  convert,
  convertFolder as convertI18nFolder,
} from "vue-i18n-migrator";
import { formatDocument } from "./utils";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function getLegacyFromConfig(): boolean {
  const config = vscode.workspace.getConfiguration("vueMigrator");
  return config.get<boolean>("legacy", false);
}

async function convertI18nFolderSafe(folderPath: string): Promise<void> {
  try {
    // Конвертируем папку с базовыми опциями
    await convertI18nFolder(folderPath, {
      view: false,
      legacy: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Detailed error:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        folderPath,
      });
    }
    throw error;
  }
}

async function findVueFiles(folderPath: string): Promise<string[]> {
  const vueFiles: string[] = [];

  const scanDirectory = async (dirPath: string): Promise<void> => {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".vue")) {
          vueFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
      throw error;
    }
  };

  await scanDirectory(folderPath);
  return vueFiles;
}

export function registerI18nCommands(context: vscode.ExtensionContext) {
  let convertI18nFileDisposable = vscode.commands.registerCommand(
    "vscode-vue-migrator.convertI18n",
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
          legacy: getLegacyFromConfig(),
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
          "Successfully converted to i18n syntax"
        );
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

      const folderPath = uri.fsPath;

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Converting i18n in folder",
            cancellable: false,
          },
          async (progress) => {
            try {
              progress.report({ message: "Finding Vue files..." });
              const vueFiles = await findVueFiles(folderPath);
              const total = vueFiles.length;

              if (total === 0) {
                vscode.window.showInformationMessage(
                  "No Vue files found in the selected folder"
                );
                return;
              }

              for (let i = 0; i < vueFiles.length; i++) {
                const file = vueFiles[i];
                progress.report({
                  message: `Converting file ${i + 1}/${total}: ${path.basename(file)}`,
                  increment: 100 / total,
                });

                try {
                  const content = await readFile(file, "utf-8");
                  const converted = await convert(content, {
                    legacy: getLegacyFromConfig(),
                  });
                  await writeFile(file, converted.content, "utf-8");

                  // Форматируем файл после конвертации
                  const document =
                    await vscode.workspace.openTextDocument(file);
                  await formatDocument(document);
                } catch (fileError) {
                  console.error(`Error converting file ${file}:`, fileError);
                  // Продолжаем с следующим файлом
                }
              }
            } catch (error) {
              console.error("Error converting folder:", error);
              throw error; // Пробрасываем ошибку для показа пользователю
            }
          }
        );

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
