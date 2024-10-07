import {ACTIONS} from "./constants.js";
import fs from "fs";
import os from "os";

export class ActionController {

    currentDir = os.homedir();

    makeAction(action) {
        const toArray = action.replace(/\s+/g, ' ').trim().split(' ');
        const command = toArray[0];
        const arg = toArray.find((element) => element.startsWith('--'));

        if (command === ACTIONS.up) {
            return new UpAction(arg, action, this).handle()
        }

        if (command === ACTIONS.ls) {
            return new LsAction(arg, action, this).handle()
        }
    }

}

class Action {

    constructor(arg, action, actionController) {
        this.action = action;
        this.arg = arg;
        this.actionController = actionController;
    }


    handle() {
    }

    validatePath(path) {
        return fs.existsSync(path);
    }
}


class UpAction extends Action {
    constructor(arg, action, actionController) {
        super(arg, action, actionController);
    }

    handle() {
        console.log(this);
    }
}


class LsAction extends Action {
    constructor(arg, action, actionController) {
        super(arg, action, actionController);
    }

    handle() {
        fs.readdir(this.actionController.currentDir, {withFileTypes: true}, (err, files) => {
            if (err) {
                console.log('Ошибка, не удалось прочитать папку')
            }
            console.log('___________________________________________________________________________');
            files.sort((element) => element.isDirectory() ? -1 : 1)
                .forEach((file, index) => {
                    const changeIndex = index < 10 ? ' ' + index : index;
                    const fileType = file.isDirectory() ? 'directory' : 'file';
                console.log(
                    `${changeIndex} ${this.generateFileName(file.name)} ${fileType}`);
            })
            console.log('___________________________________________________________________________');
        })
    }

    generateFileName(name) {
        if (name.length < 30) {
            return (name + new Array(30).map(() => " ").join(' ')).slice(0, 30)
        }

        return name.slice(-30, name.length);
    }
}
