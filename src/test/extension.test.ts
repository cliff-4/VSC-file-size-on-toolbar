import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../extension";

suite("Extension Test Suite", () => {
    vscode.window.showInformationMessage("Start all tests.");

    test("Test bytesToReadableString", () => {
        assert.strictEqual("1KB", myExtension.bytesToReadableString(1024));
        assert.strictEqual("1023B", myExtension.bytesToReadableString(1023));
    });
});
