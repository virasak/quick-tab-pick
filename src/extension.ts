import * as vscode from 'vscode';
import * as path from 'path';

type TabPickItem = vscode.QuickPickItem & { tab?: vscode.Tab & { input: vscode.TabInputText } };

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('quick-tab-pick.action.showTabs', async () => {
		let fileUriItem: TabPickItem[] = [];
		let viewColumn: vscode.ViewColumn | undefined;

		for (let tab of listTabs()) {
			if (viewColumn !== tab.group.viewColumn) {
				viewColumn = tab.group.viewColumn;
				fileUriItem.push({ label: 'Group ' + viewColumn, kind: vscode.QuickPickItemKind.Separator });
			}

			let label = path.basename(tab.input.uri.path);
			let description = vscode.workspace.asRelativePath(tab.input.uri, false);
			fileUriItem.push({ label, description, tab });
		}

		let item = await vscode.window.showQuickPick(fileUriItem, { placeHolder: "Pick a tab", canPickMany: false, ignoreFocusOut: true });
		item && item.tab && await vscode.window.showTextDocument(item.tab.input.uri, { viewColumn: item.tab.group.viewColumn });
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

function* listTabs() {
	let groupNumber = 0;
	for (let group of vscode.window.tabGroups.all) {
		for (let tab of group.tabs) {
			if (tab.input instanceof vscode.TabInputText) {
				yield tab as vscode.Tab & { input: vscode.TabInputText };
			}
		}
	}
}
