import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";

export class AddAction extends Action {
    command = 'add';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle() {
        try {
            const newPath = path.join(this.currentDir, this.pureFileName);

            const stream = fs.createWriteStream(newPath, {
                flags: 'a',
                encoding: 'utf8'
            });
            stream.write('  ', (error) => {
                if (error) {
                    return;
                }
                console.log(`Success, file ${this.pureFileName} created`);
                this.printCurrentDir();
                stream.end();
            });
            stream.on('error', this.displayError);

        } catch (e) {
            this.displayError();
        }
    }
}
