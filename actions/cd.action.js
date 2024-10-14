import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";

export class CdAction extends Action {
    command = 'cd';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle() {
        try {
            if (this.fileName === this.currentDir) {
                return this.printCurrentDir();
            }
            const clearFileName = this.fileName.replace(this.homeDir, '');
            let newDir = path.join(this.currentDir, clearFileName);

            fs.readdir(newDir, err => {
                if (err) {
                    return this.displayError();
                }
                this.actionController.currentDir = newDir;
                this.printCurrentDir();
            });
        } catch (e) {
            this.displayError();
        }
    }
}
