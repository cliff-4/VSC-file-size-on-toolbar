import * as vscode from "vscode";
import fs from "fs/promises";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

async function getFileSize(path: string): Promise<number> {
    try {
        const stats = await fs.stat(path);
        return stats.size;
    } catch (e) {
        console.log("Error getting file size:", e);
    }
    return 0;
}

async function getSize(path: string): Promise<string> {
    let s: number = await getFileSize(path);
    let x = 1024;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + " B";
    }
    s /= x;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + " KB";
    }
    s /= x;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + " MB";
    }
    s /= x;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + " GB";
    }
    s /= x;
    return "N/A B";
}

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage(
        '"file-size-on-toolbar" is now active'
    );

    let subObj = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor === undefined) {
            return;
        }
        // vscode.window.showInformationMessage(
        //     `Focused file: ${editor.document.fileName}`
        // );
        let activeDoc = editor.document;
        let sizeStr = await getSize(activeDoc.fileName);
        vscode.window.showInformationMessage(sizeStr);
    });

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand(
        "file-size-on-toolbar.helloWorld",
        () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            vscode.window.showInformationMessage("Hello World!");
        }
    );

    context.subscriptions.push(disposable, subObj);
}

// This method is called when your extension is deactivated
export function deactivate() {}
