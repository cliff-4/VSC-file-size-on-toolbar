import * as vscode from "vscode";
import fs from "fs/promises";

function debug(msg: string) {
    // console.debug(`[file-size-on-toolbar] ${msg}`);
}

async function getFileSizeBytes(path: string): Promise<number> {
    try {
        const stats = await fs.stat(path);
        return stats.size;
    } catch (e) {
        console.log("Error getting file size:", e);
    }
    return 0;
}

function getSize(s: number): string {
    let x = 1024;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + "B";
    }
    s /= x;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + "KB";
    }
    s /= x;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + "MB";
    }
    s /= x;
    if (s < x) {
        return (Math.round(100 * s) / 100).toString() + "GB";
    }
    s /= x;
    return "TooManyB";
}

function handleOnFocusTitled(sizeView: vscode.StatusBarItem) {
    return async () => {
        debug(`handleOnFocus triggered`);
        let editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            sizeView.text = "";
            return;
        }
        if (editor.document.isUntitled) {
            sizeView.text = getSize(editor?.document.getText().length);
            return;
        }
        debug(`Editor defined`);
        let sizeStr = getSize(await getFileSizeBytes(editor.document.fileName));
        debug(`Size of ${editor.document.fileName}: ${sizeStr}`);
        sizeView.text = sizeStr;
    };
}

function handleOnFocusUntitled(sizeView: vscode.StatusBarItem) {
    return async () => {
        debug(`handleOnFocus triggered`);
        let editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            sizeView.text = "";
            return;
        }
        if (!editor.document.isUntitled) {
            return;
        }
        debug(`Editor defined`);
        let sizeStr = getSize(editor.document.getText().length);
        debug(`Size of ${editor.document.fileName}: ${sizeStr}`);
        sizeView.text = sizeStr;
    };
}

const subscribedEvents = [
    vscode.workspace.onDidSaveTextDocument,
    vscode.workspace.onDidSaveNotebookDocument,
    vscode.window.onDidChangeActiveTextEditor,
    vscode.window.onDidChangeActiveNotebookEditor,
];

export async function activate(context: vscode.ExtensionContext) {
    debug("Active");
    debug(
        `Currently subscribed to ${
            subscribedEvents.length
        } events\n- ${subscribedEvents.map((func) => func.name).join("\n- ")}`
    );

    let sizeView = vscode.window.createStatusBarItem(2, 4);
    sizeView.tooltip = "File Size Information";
    sizeView.show();
    await handleOnFocusTitled(sizeView)();

    context.subscriptions.push(
        ...subscribedEvents.map((func) => func(handleOnFocusTitled(sizeView)))
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(
            handleOnFocusUntitled(sizeView)
        )
    );
}

export function deactivate() {}
