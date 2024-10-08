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

        if (command === ACTIONS.cp) {
            return new CopyAction(arg, action, this).handle();
        }

        if (command === ACTIONS.rm) {
            return new RemoveAction(arg, action, this).handle();
        }

        if (command === ACTIONS.mv) {
            return new MoveAction(arg, action, this).handle();
        }
    }
}

class MoveAction extends Action {
    command = 'mv';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle() {
        const splitFileNames = this.pureFileName.split(' ').filter(Boolean);
        const oldName = splitFileNames[0]?.replace(this.currentDir, '');
        const newName = splitFileNames[1]?.replace(this.currentDir, '');
        if (!oldName || !newName) {
            console.log('File dont exist!');
            return this.printCurrentDir();
        }
        const oldFilePath = path.join(this.currentDir, oldName);
        const newFilePath = path.join(this.currentDir, newName, oldName);
        console.log(oldFilePath, newFilePath);
        try {
            if (!fs.existsSync(oldFilePath)) {
                console.log('Fail! File dont exist');
                return this.printCurrentDir();
            }

            fs.copyFileSync(oldFilePath, newFilePath);

            fs.unlinkSync(oldFilePath);

            console.log('Successfully moved file!');
            this.printCurrentDir();
        } catch (error) {

            console.error('Fail! File dont exist!');
            this.printCurrentDir();
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
            console.log('File dont exist!');
            return this.printCurrentDir();
        }
        const oldFilePath = path.join(this.currentDir, oldName);
        const newFilePath = path.join(this.currentDir, newName);
        fs.rename(oldFilePath, newFilePath, (err) => {
            if (err) {
                console.log('Error! Failed to rename');
                return this.printCurrentDir();
            }
            console.log('Successfully renamed');
            this.printCurrentDir();
        })
    }
}

class RemoveAction extends Action {
    command = 'rm';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle(callback = this.printCurrentDir) {
        const filePath = path.join(this.currentDir, this.pureFileName);
        if (!fs.existsSync(filePath)) {
            console.log('File dont exist!');
            return this.printCurrentDir();
        }

        fs.unlink(filePath, (e) => {
            if (e) {
                console.log('Error! Failed to remove');
                return this.printCurrentDir();
            }
            console.log('Success');
            if (typeof callback === 'function') {
                callback();
            }
        })
    }
}

class CopyAction extends Action {
    command = 'cp';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
    }

    handle(callback = this.printCurrentDir) {
        const filePath = path.join(this.currentDir, this.pureFileName);
        if (!fs.existsSync(filePath)) {
            console.log('File dont exist!');
            return this.printCurrentDir();
        }
        const fileName = this.pureFileName.split('.')[0];
        const ext = this.pureFileName.split('.')[1];
        const POSTFIX = '_copy';
        const newFilePath = path.join(this.currentDir, fileName + POSTFIX + '.' + ext);
        const stream = fs.createReadStream(filePath, {encoding: 'utf8'}).pipe(fs.createWriteStream(newFilePath));

        stream.on('error', (e) => {
            console.log('Error, Cant to copy')
            return this.printCurrentDir();
        });
        stream.on('finish', () => {
            console.log('Successfully copy')
            if (typeof callback === 'function') {
                callback();
            }
        });
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
            console.log('No file');
            return this.printCurrentDir();
        }

        const stream = fs.createReadStream(filePath, {encoding: 'utf8'});

        stream.on('data', data => {
            process.stdout.write(data.toString());
        })

        stream.on('end', this.printCurrentDir);
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
                    console.log('Error! Failed to add');
                    return this.printCurrentDir();
                }
                console.log(`Success, file ${this.pureFileName} created`);
                this.printCurrentDir();
                stream.end();
            });

        } catch (e) {
            console.log('Cant create file');
            this.printCurrentDir();
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
            return this.printCurrentDir();
        }
        try {
            fs.readdirSync(joinNewPath);
            this.actionController.currentDir = joinNewPath;

            this.printCurrentDir();
        } catch (e) {
            console.log('Failed to get current directory');
            this.printCurrentDir();
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
                return this.printCurrentDir();
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
            this.printCurrentDir();
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
            console.log('Путь не существует/не выбран');
            return this.printCurrentDir();

        }
        let newDir = path.join(this.currentDir, clearFileName);

        try {
            fs.readdirSync(newDir);
            this.actionController.currentDir = newDir;
            this.printCurrentDir();

        } catch (e) {
            console.log('Путь не существует/ выбран файл');
            this.printCurrentDir();
        }
    }
}
