import * as cp from "child_process";
const isImage = require('is-image');
import * as vscode from 'vscode';

const execShell = (cmd: string) =>
    new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
            if (err) {
                vscode.window.showErrorMessage(err.message);
                return reject(err);
            }
            return resolve(out);
    });
});


export default class PathViewer {
    private path :string;
    

	public constructor(path: string)
	{
		this.path = path;
	}


    // Tries to determina the type of path 
    // depending on the type it will run shell commands to view the path    
    // It can be image, directory
    
    public async showPath() {
        let config = vscode.workspace.getConfiguration(); 
        let fileManagerExecutable = config.get<string>('cvi.fileManagerExecutable');
        let imageViewerExecutable = config.get<string>('cvi.imageViewerExecutable');

        let out = null;

        if (isImage(this.path)) {
            // Image type
            out = await execShell(
                `${imageViewerExecutable} ${this.path}`
            );
        } else {
            // Directory - opens file manager
            out = await execShell(`${fileManagerExecutable} ${this.path}`);
        }
        
        console.log(out);
    }
}