import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";
import os from "os";

export class CatAction extends Action {
    command = 'cat';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle() {
        try {
            const filePath = path.join(this.currentDir, this.pureFileName);

            const stream = fs.createReadStream(filePath, {encoding: 'utf8'});

            stream.on('data', data => process.stdout.write(data.toString() + os.EOL))
                .on('error', this.displayError)
                .on('end', this.printCurrentDir);
        } catch (e) {
            this.displayError();
        }
    }
}
