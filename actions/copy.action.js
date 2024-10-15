import path from "node:path";
import fs from "fs";
import {Action} from "../actions-controller/action.js";

export class CopyAction extends Action {
    command = 'cp';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle(callback = this.printCurrentDir) {
        try {
            const filePath = path.join(this.currentDir, this.pureFileName);
            const fileName = this.pureFileName.split('.')[0];
            const ext = this.pureFileName.split('.')[1];
            const POSTFIX = '_copy';
            const newFilePath = path.join(this.currentDir, fileName + POSTFIX + '.' + ext);
            fs.readFile(filePath, (err) => {
                if (err) {
                    return this.displayError();
                }
                const stream = fs.createReadStream(filePath, {encoding: 'utf8'}).pipe(fs.createWriteStream(newFilePath));

                stream
                    .on('error', this.displayError)
                    .on('finish', () => {
                        console.log('Successfully copy')
                        if (typeof callback === 'function') {
                            callback();
                        }
                    });
            })
        } catch (e) {
            this.displayError();
        }
    }
}
