import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";
import {createHash} from "crypto";

export class HashAction extends Action {
    command = 'hash';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle() {
        try {
            const filePath = path.join(this.currentDir, this.fileName.replace(this.currentDir, ''));
            fs.readFile(filePath, (err, fileBuffer) => {
                if (err) {
                    return this.displayError();
                }
                const hash = createHash('sha256').update(fileBuffer).digest('hex');
                console.log(hash);
            });
        } catch (e) {
            console.log(e);
            this.displayError();
        }
    }
}
