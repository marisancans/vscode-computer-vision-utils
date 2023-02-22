// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import CvUtilsService from './CvUtilsService';

let cvUtilsService: CvUtilsService;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "computer-vision-utils" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cvi.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello from computer-vision-utils!');
	});

	context.subscriptions.push(disposable);


    cvUtilsService = new CvUtilsService();

    context.subscriptions.push(
		vscode.commands.registerTextEditorCommand("cvi.copyVariableToClipboard", async editor => {
			let path = await cvUtilsService.copyVariableToClipboard(editor.document, editor.selection);
		})
	);

    context.subscriptions.push(
		vscode.commands.registerTextEditorCommand("cvi.openWithViever", async editor => {
			let path = await cvUtilsService.openWithViever(editor.document, editor.selection);
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}



/**
 * Provides code actions for python opencv image.
 */
export class CvUtilsProvider implements vscode.CodeActionProvider {

	public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.Command[] | undefined> {

		let path = await cvUtilsService.ViewImage(document, range);
		if (path === undefined) {
			return;
		}

		return [
			{ command:"vscode.open", title: 'Copy variable to clipboard ', arguments: [ vscode.Uri.file(path), vscode.ViewColumn.Beside ] }
		];
	}
}