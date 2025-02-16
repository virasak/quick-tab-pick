import { commands, window, workspace } from 'vscode';
import { ExtensionContext, QuickPickItem, QuickPickItemKind, Tab, TabGroup, TabInputText, ViewColumn, } from 'vscode';

type EditorTab = Tab & { input: TabInputText };

type TabPickItem = QuickPickItem & { tab?: EditorTab };

export function activate(context: ExtensionContext) {
	let disposable = commands.registerCommand('quick-tab-pick.action.showTabs', async () => {
		let quickPickItems: TabPickItem[] = [];
		let viewColumn: ViewColumn = window.tabGroups.all[0].viewColumn;

		if (window.tabGroups.all.length > 1) {
			quickPickItems.push({ label: 'Group ' + viewColumn, kind: QuickPickItemKind.Separator });
		}

		for (let tab of listEditorTabs(window.tabGroups.all)) {
			if (viewColumn !== tab.group.viewColumn) {
				viewColumn = tab.group.viewColumn;
				quickPickItems.push({ label: 'Group ' + viewColumn, kind: QuickPickItemKind.Separator });
			}

			let description = workspace.asRelativePath(tab.input.uri, false);
			quickPickItems.push({ label: tab.label, description, tab });
		}

		let item = await window.showQuickPick(quickPickItems, { placeHolder: "Pick a tab", canPickMany: false });
		item && item.tab && await window.showTextDocument(item.tab.input.uri, { viewColumn: item.tab.group.viewColumn });
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

function* listEditorTabs(groups: readonly TabGroup[]) {
	for (let group of groups) {
		for (let tab of group.tabs) {
			if (tab.input instanceof TabInputText) {
				yield tab as EditorTab;
			}
		}
	}
}
