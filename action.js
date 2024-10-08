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

    get currentDir() {
        return this.actionController.currentDir;
    }

    get homeDir() {
        return os.homedir();
    }

    get pureFileName() {
        return this.fileName.trim().replace(this.currentDir, '');
    }
}
