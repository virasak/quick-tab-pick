import * as vscode from 'vscode';
import * as path from 'path';

type FileUriItem = vscode.QuickPickItem & { uri: vscode.Uri; };

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('quick-tab-pick.action.showTabs', async () => {
		let fileUriItem: FileUriItem[] = [];

		for (let uri of listOpenFiles()) {
			let label = path.basename(uri.path);
			let description = vscode.workspace.asRelativePath(uri, false);

			fileUriItem.push({ label, description, uri });
		}

		let item = await vscode.window.showQuickPick(fileUriItem, { placeHolder: "Pick a tab", canPickMany: false, ignoreFocusOut: true });
		item && await vscode.window.showTextDocument(item.uri);

	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

function* listOpenFiles() {
	for (let group of vscode.window.tabGroups.all) {
		for (let tab of group.tabs) {
			if (tab.input instanceof vscode.TabInputText) {
				yield tab.input.uri;
			}
		}
	}
}
