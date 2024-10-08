import {ACTIONS} from "./constants.js";
import fs from "fs";
import os from "os";
import * as path from "node:path";
import {Action} from "./action.js";

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

        if (command === ACTIONS.add) {
            return new AddAction(arg, action, this).handle();
        }

        if (command === ACTIONS.cat) {
            return new CatAction(arg, action, this).handle();
        }

        if (command === ACTIONS.rn) {
            return new RenameAction(arg, action, this).handle();
        }

        if(command === ACTIONS.cp) {
            return new CopyAction(arg, action, this).handle();
        }
    }

}

class RenameAction extends Action {
    command = 'rn';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle() {
        const splitFileNames = this.pureFileName.split(' ').filter(Boolean);
        const oldName = splitFileNames[0];
        const newName = splitFileNames[1];
        if (!oldName || !newName) {
            return console.log('File dont exist!');
        }
        const oldFilePath = path.join(this.currentDir, oldName);
        const newFilePath = path.join(this.currentDir, newName);
        fs.rename(oldFilePath, newFilePath, (err) => {
            if (err) {
                return console.log('Error! Failed to rename');
            }
            console.log('Successfully renamed');
        })
    }
}

class CopyAction extends Action {
    command = 'cp';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle() {
        const filePath = path.join(this.currentDir, this.pureFileName);
        if(!fs.existsSync(filePath)) {
            return console.log('File dont exist!');
        }
        const fileName = this.pureFileName.split('.')[0];
        const ext = this.pureFileName.split('.')[1];
        const POSTFIX = '_copy';
        const newFilePath = path.join(this.currentDir, fileName + POSTFIX + '.' + ext);
        const stream = fs.createReadStream(filePath, { encoding: 'utf8' }).pipe(fs.createWriteStream(newFilePath));

        stream.on('error', (e) => console.log('Error, Cant to copy'));
        stream.on('finish', () => console.log('Successfully copy'));
    }
}

class CatAction extends Action {
    command = 'cat';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle() {
        const filePath = path.join(this.currentDir, this.pureFileName);

        if (!fs.existsSync(filePath)) {
            return console.log('No file')
        }

        const stream = fs.createReadStream(filePath, {encoding: 'utf8'});

        stream.on('data', data => {
            process.stdout.write(data.toString());
        })
    }
}

class AddAction extends Action {
    command = 'add';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle() {
        try {
            const stream = fs.createWriteStream(path.join(this.currentDir, this.pureFileName), {
                flags: 'a',
                encoding: 'utf8'
            });
            stream.write('  ', (error) => {
                if (error) {
                    console.log(error);
                }
                console.log(`Success, file ${this.pureFileName} created`);
                stream.end();
            });

        } catch (e) {
            console.log('Не удалось создать файл')
        }
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

        if (this.currentDir === this.homeDir) {
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
            const LINE = '______________________________________________';
            if (err) {
                console.log('Ошибка, не удалось прочитать папку')
            }
            console.log(LINE);
            files.sort((element) => element.isDirectory() ? -1 : 1)
                .forEach((file, index) => {
                    const changeIndex = index < 10 ? ' ' + index : index;
                    const fileType = file.isDirectory() ? 'directory' : 'file';
                    const fileInline = `| ${changeIndex} | ${this.generateFileName(file.name)} | ${fileType} |`
                    console.log(fileInline);
                })
            console.log(LINE);
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
        const clearFileName = this.fileName.replace(this.homeDir, '');
        if (!clearFileName) {
            return console.log('Путь не существует/ выбран файл');
        }
        let newDir = path.join(this.currentDir, clearFileName);

        try {
            fs.readdirSync(newDir);
            this.actionController.currentDir = newDir;
            console.log(newDir);

        } catch (e) {
            console.log('Путь не существует/ выбран файл');
        }
    }
}
