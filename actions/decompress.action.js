import {Action} from "../actions-controller/action.js";
import path from "node:path";
import fs from "fs";
import zlib from "node:zlib";

export class DecompressAction extends Action {
    command = 'decompress';

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
            const newFilePath = path.join(this.currentDir, newName);

            fs.readFile(oldFilePath, (err) => {
                if (err) {
                    return this.displayError();
                }

                fs.createReadStream(oldFilePath)
                    .pipe(zlib.createBrotliDecompress())
                    .pipe(fs.createWriteStream(newFilePath))
                    .on('finish', () => {
                        console.log('DONE!');
                        this.printCurrentDir();
                    })
            })
        } catch (e) {
            this.displayError();
        }
    }
}
