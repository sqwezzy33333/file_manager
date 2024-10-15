import {Action} from "../actions-controller/action.js";
import fs from "fs";

export class LsAction extends Action {
    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.handle();
    }

    handle() {
        try {
            fs.readdir(this.currentDir, {withFileTypes: true}, (err, files) => {

                const tableData = files.sort((element) => element.isDirectory() ? -1 : 1)
                    .map((file, index) => {
                        const fileType = file.isDirectory() ? 'directory' : 'file';
                        return {['File Name']: this.generateFileName(file.name), Type: fileType}
                    })
                console.table(tableData);
                this.printCurrentDir();
            })
        } catch (e) {
            this.displayError();
        }
    }

    generateFileName(name) {
        if (name.length < 30) {
            return (name + new Array(30).map(() => " ").join(' ')).slice(0, 30)
        }

        return name.slice(-30, name.length);
    }
}
