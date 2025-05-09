import * as vscode from "vscode";

export async function formatDocument(document: vscode.TextDocument) {
  try {
    await vscode.commands.executeCommand("editor.action.formatDocument");
  } catch (error) {
    console.error("Error formatting document:", error);
  }
} 