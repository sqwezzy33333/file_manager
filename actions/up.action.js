import {Action} from "../actions-controller/action.js";
import os from "os";
import path from "node:path";
import fs from "fs";

export class UpAction extends Action {
    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.handle();
    }

    handle() {
        if (this.currentDir === os.homedir()) {
            return this.printCurrentDir();
        }
        try {
            const currentPath = this.currentDir.split(path.sep);
            currentPath.splice(currentPath.length - 1, 1);
            const joinNewPath = currentPath.join(path.sep);

            fs.readdir(joinNewPath, (e) => {
                if (e) {
                    return this.displayError();
                }
                this.actionController.currentDir = joinNewPath;
                this.printCurrentDir();
            });
        } catch (e) {
            this.displayError()
        }
    }
}
