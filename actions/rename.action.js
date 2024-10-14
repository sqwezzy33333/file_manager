import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";

export class RenameAction extends Action {
    command = 'rn';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle() {
        try {
            const oldFilePath = path.join(this.currentDir, this.splitFileNames[0].replace(this.currentDir, ''));
            const newFilePath = path.join(this.currentDir, this.splitFileNames[1].replace(this.currentDir, ''));

            fs.rename(oldFilePath, newFilePath, (err) => {
                if (err) {
                    return this.displayError();
                }
                console.log('Successfully renamed');
                this.printCurrentDir();
            })
        } catch (e) {
            this.displayError();
        }
    }
}
