import os from "os";

export class Action {
    command = null;
    fileName = null;
    arg = null;

    constructor(arg, action, actionController) {
        this.action = action;
        this.arg = arg;
        this.actionController = actionController;
    }

    findFile() {
        this.fileName = this.action.replace(this.command, '').trim();
    }

    handle() {
    }

    displayError = () => {
        console.log('Operation failed');
        this.printCurrentDir();
    }

    printCurrentDir = () => {
        console.log('You are currently in ' + this.actionController.currentDir);
    }

    get currentDir() {
        return this.actionController.currentDir;
    }

    get homeDir() {
        return os.homedir();
    }

    get pureFileName() {
        return this.fileName.trim().replace(this.currentDir, '');
    }

    get splitFileNames() {
        return this.pureFileName.split(' ').filter(Boolean);
    }
}
