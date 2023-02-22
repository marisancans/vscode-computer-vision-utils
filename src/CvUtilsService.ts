import * as vscode from 'vscode';
import { join } from 'path';

import PathViewer from './pathViewer';

export default class CvUtilsService {

	public async getPath(document: vscode.TextDocument, range: vscode.Range): Promise<string|undefined> {
		const session = vscode.debug.activeDebugSession;
		if (session === undefined) {
			return;
		}

		let res = await session.customRequest('threads', {});
		let threads = res.threads;
		let variables : any[] = [];
		let callStack = 0;

		for (const thread of threads) {
			let threadid = thread.id;

			res = await session.customRequest('stackTrace', { threadId: threadid });
			let stacks = res.stackFrames;
			callStack = stacks[0].id;
	
			res = await session.customRequest('scopes', {frameId: callStack});
			let scopes = res.scopes;
			let local = scopes[0];
			
			try 
			{
				res = await session.customRequest('variables', { variablesReference: local.variablesReference });
				variables = res.variables;
				break;
			}
			catch (e)
			{
				console.log(e);
			}
		}

		const selectedVariable = document.getText(document.getWordRangeAtPosition(range.start));

		let targetVariable = variables.find( v => v.name === selectedVariable);
		if (targetVariable === undefined)
		{
			return;
		}


		const vn = targetVariable.evaluateName; // var name
		const expression = `str(${vn})`;
		res = await session.customRequest("evaluate", { expression: expression, frameId: callStack, context:'hover' });
		console.log(`evaluate ${expression} result: ${res.result}`);
        let variablePath = res.result;
        variablePath = variablePath.replace(/['"]+/g, '');
        return variablePath;
    }

    public async copyVariableToClipboard(document: vscode.TextDocument, range: vscode.Range) {
        const path = await this.getPath(document, range);

        if (path === undefined) {
            return;
        }

        await vscode.env.clipboard.writeText(path); 
    }

    public async openWithViever(document: vscode.TextDocument, range: vscode.Range) {
        const path = await this.getPath(document, range);

        if (path === undefined) {
            return;
        }

        let pw = new PathViewer(path);
        pw.showPath();
    }
}