import * as vscode from "vscode";
import * as packageJson from "../package.json";

function debug(msg: any) {
    console.debug(`[file-size-on-toolbar] ${msg.toString()}`);
}

async function getFileSizeBytes(uri: vscode.Uri): Promise<number> {
    return (await vscode.workspace.fs.readFile(uri)).length;
}

function bytesToReadableString(s: number): string {
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

async function getSize(uri: vscode.Uri): Promise<string> {
    return await getFileSizeBytes(uri).then(bytesToReadableString, (reason) => {
        debug(`Can not parse file size due to: ${reason}`);
        return "-1";
    });
}

function handleOnFocusText(sizeView: vscode.StatusBarItem) {
    return async () => {
        let editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            sizeView.text = "";
            return;
        }
        let notebook = vscode.window.activeNotebookEditor?.notebook;
        if (notebook !== undefined) {
            return;
        }
        if (
            !vscode.workspace.getConfiguration(ExtSet.Name).get(ExtSet.Text) ||
            editor === undefined
        ) {
            sizeView.text = "";
            return;
        }
        if (editor.document.isUntitled) {
            return;
        }
        let sizeStr = await getSize(editor.document.uri);
        debug(
            `[Text] Size of ${editor.document.fileName
                .split("\\")
                .at(-1)}: ${sizeStr}`
        );
        sizeView.text = sizeStr;
    };
}

function handleOnFocusNotebook(sizeView: vscode.StatusBarItem) {
    return async () => {
        let editor = vscode.window.activeNotebookEditor;
        if (editor === undefined) {
            return;
        }
        let v = vscode.workspace.getConfiguration(ExtSet.Name);
        if (
            vscode.workspace
                .getConfiguration(ExtSet.Name)
                .get(ExtSet.Notebook) === false ||
            editor.notebook.isUntitled
        ) {
            sizeView.text = "";
            return;
        }

        let sizeStr = await getSize(editor.notebook.uri);
        debug(
            `Size of ${editor.notebook.uri
                .toString()
                .split("/")
                .at(-1)}: ${sizeStr}`
        );
        sizeView.text = sizeStr;
    };
}

function handleOnFocusUntitled(sizeView: vscode.StatusBarItem) {
    return async () => {
        let editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            sizeView.text = "";
            return;
        }
        let notebook = vscode.window.activeNotebookEditor?.notebook.uri;
        if (
            notebook !== undefined ||
            (editor !== undefined && !editor.document.isUntitled)
        ) {
            return;
        }
        if (
            vscode.workspace
                .getConfiguration(ExtSet.Name)
                .get(ExtSet.Untitled) === false ||
            editor === undefined
        ) {
            sizeView.text = "";
            return;
        }

        let sizeStr = bytesToReadableString(editor.document.getText().length);
        debug(
            `[Untitled] Size of ${editor.document.fileName
                .split("\\")
                .at(-1)}: ${sizeStr}`
        );
        sizeView.text = sizeStr;
    };
}

enum ExtSet {
    Name = "file-size-on-toolbar",
    Text = "applyOnText",
    Notebook = "applyOnNotebooks",
    Untitled = "applyOnUntitled",
    None = "",
}

export async function activate(context: vscode.ExtensionContext) {
    debug(`${packageJson.name}v${packageJson.version} is Active`);

    let sizeView = vscode.window.createStatusBarItem(2, 4);
    sizeView.tooltip = "File Size Information";
    sizeView.show();

    // await handleOnFocusText(sizeView)();

    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(handleOnFocusText(sizeView)),
        vscode.window.onDidChangeActiveTextEditor(handleOnFocusText(sizeView)),

        vscode.workspace.onDidSaveNotebookDocument(
            handleOnFocusNotebook(sizeView)
        ),
        vscode.window.onDidChangeActiveNotebookEditor(
            handleOnFocusNotebook(sizeView)
        ),

        vscode.workspace.onDidChangeTextDocument(
            handleOnFocusUntitled(sizeView)
        ),
        vscode.window.onDidChangeActiveTextEditor(
            handleOnFocusUntitled(sizeView)
        ),
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(ExtSet.Name + "." + ExtSet.Notebook)) {
                debug("Notebook conf changed");
            }
            if (e.affectsConfiguration(ExtSet.Name + "." + ExtSet.Text)) {
                debug("Text conf changed");
            }
            if (e.affectsConfiguration(ExtSet.Name + "." + ExtSet.Untitled)) {
                debug("Untitled conf changed");
            }
        })
    );
}

export function deactivate() {}
