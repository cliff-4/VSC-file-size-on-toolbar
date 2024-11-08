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

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage(
        '"file-size-on-toolbar" is now active'
    );

    let subObj = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (editor === undefined) {
            return;
        }
export async function activate(context: vscode.ExtensionContext) {
    debug("Active");
    debug(
        `Currently subscribed to ${
            subscribedEvents.length
        } events\n- ${subscribedEvents.map((func) => func.name).join("\n- ")}`
    );

    context.subscriptions.push(disposable, subObj);
}

// This method is called when your extension is deactivated
export function deactivate() {}
