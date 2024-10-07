import {ACTIONS} from "./constants.js";
import fs from "fs";
import os from "os";
import * as path from "node:path";

export class ActionController {

    currentDir = os.homedir();

    makeAction(action) {
        const toArray = action.replace(/\s+/g, ' ').trim().split(' ');
        const command = toArray[0];
        const arg = toArray.find((element) => element.startsWith('--'));

        if (command === ACTIONS.up) {
            return new UpAction(arg, action, this).handle();
        }

        if (command === ACTIONS.ls) {
            return new LsAction(arg, action, this).handle();
        }

        if (command === ACTIONS.cd) {
            return new CdAction(arg, action, this).handle();
        }
    }

}

class Action {
    command = undefined;
    fileName = undefined

    constructor(arg, action, actionController) {
        this.action = action;
        this.arg = arg;
        this.actionController = actionController;
    }

    findFile() {
        this.fileName = this.action.replace(this.command, '').trim();
    }

    handle() {
    }

    validatePath(path) {
        return fs.existsSync(path);
    }

    get currentDir() {
        return this.actionController.currentDir;
    }
}


class UpAction extends Action {
    constructor(arg, action, actionController) {
        super(arg, action, actionController);
    }

    handle() {
        const currentPath = this.currentDir.split(path.sep);
        currentPath.splice(currentPath.length - 1, 1);
        const joinNewPath = currentPath.join(path.sep);

        if (this.currentDir === os.homedir()) {
            return console.log(this.currentDir);
        }
        try {
            fs.readdirSync(joinNewPath);
            this.actionController.currentDir = joinNewPath;

            console.log(this.currentDir);
        } catch (e) {
            console.log('Failed to get current directory', e);
        }
    }
}


class LsAction extends Action {
    constructor(arg, action, actionController) {
        super(arg, action, actionController);
    }

    handle() {
        fs.readdir(this.currentDir, {withFileTypes: true}, (err, files) => {
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

class CdAction extends Action {
    command = 'cd';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle() {
        const newDir = path.join(this.currentDir, this.fileName.replace(os.homedir(), ''));

        try {
            fs.readdirSync(newDir);
            this.actionController.currentDir = newDir;
            console.log(newDir);

        } catch (e) {
            console.log('Путь не существует/ выбран файл');
        }
    }
}
