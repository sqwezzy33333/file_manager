import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";

export class MoveAction extends Action {
    command = 'mv';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle() {
        try {
            const oldName = this.splitFileNames[0]?.replace(this.currentDir, '');
            const newName = this.splitFileNames[1]?.replace(this.currentDir, '');

            const oldFilePath = path.join(this.currentDir, oldName);
            const newFilePath = path.join(this.currentDir, newName, oldName);

            fs.copyFile(oldFilePath, newFilePath, (err) => {
                if (err) {
                    return this.displayError();
                }
                fs.unlink(oldFilePath, (e) => {
                    if (e) {
                        return this.displayError();
                    }
                    console.log('Successfully moved file!');
                    this.printCurrentDir();
                })
            })
        } catch (error) {
            return this.displayError();
        }
    }
}


