import {ACTIONS} from "./constants.js";
import fs from "fs";
import os from "os";
import * as path from "node:path";
import {Action} from "./action.js";
import {getUserName} from "./utils.js";

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

        if (command === ACTIONS.os) {
            return new OsAction(arg, action, this).handle();
        }
    }
}


class OsAction extends Action {
    command = 'os';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
    }

    handle() {
        if (this.arg === '--EOL') {
            this.eol();
        }

        if (this.arg === '--cpus') {
            this.cpus();
        }

        if (this.arg === '--homedir') {
            this.homeDir();
        }

        if (this.arg === '--username') {
            console.log(getUserName() || 'No username')
        }

        if(this.arg === '--architecture') {
            this.architecture();
        }

        this.printCurrentDir();
    }

    architecture() {
        console.log("Processor Architecture:", process.arch);
    }

    homeDir() {
        console.log(os.homedir())
    }

    cpus() {
        const numCPUs = os.cpus().length;
        console.log(`Number of logical processors: ${numCPUs}`);

        os.cpus().forEach(cpu => {
            const model = cpu.model;
            const speed = cpu.speed / 1000;

            console.log(`Model: ${model}, Clock frequency: ${speed} GHz`);
        });
    }

    eol() {
        process.stdout.write(`Default system End-Of-Line: ${os.EOL}`);
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
            return this.displayError();
        }
        const oldFilePath = path.join(this.currentDir, oldName);
        const newFilePath = path.join(this.currentDir, newName, oldName);
        try {
            if (!fs.existsSync(oldFilePath)) {
                return this.displayError();
            }

            fs.copyFileSync(oldFilePath, newFilePath);

            fs.unlinkSync(oldFilePath);

            console.log('Successfully moved file!');
            this.printCurrentDir();
        } catch (error) {
            return this.displayError();
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
            return this.displayError();
        }
        const oldFilePath = path.join(this.currentDir, oldName);
        const newFilePath = path.join(this.currentDir, newName);
        fs.rename(oldFilePath, newFilePath, (err) => {
            if (err) {
                return this.displayError();
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
            return this.displayError();
        }

        fs.unlink(filePath, (e) => {
            if (e) {
                return this.displayError();
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

        stream.on('error', this.displayError);
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
            return this.displayError();
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
                    return this.displayError();
                }
                console.log(`Success, file ${this.pureFileName} created`);
                this.printCurrentDir();
                stream.end();
            });

        } catch (e) {
            this.displayError();
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
            this.displayError();
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
                return this.displayError();
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
            this.displayError();

        }
        let newDir = path.join(this.currentDir, clearFileName);

        try {
            fs.readdirSync(newDir);
            this.actionController.currentDir = newDir;
            this.printCurrentDir();

        } catch (e) {
            this.displayError();
        }
    }
}
