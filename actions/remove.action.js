import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";

export class RemoveAction extends Action {
    command = 'rm';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle(callback = this.printCurrentDir) {
        try {
            const filePath = path.join(this.currentDir, this.pureFileName);

            fs.unlink(filePath, (e) => {
                if (e) {
                    return this.displayError();
                }
                console.log('Success');
                if (typeof callback === 'function') {
                    callback();
                }
            })
        } catch (e) {
            this.displayError();
        }
    }
}
