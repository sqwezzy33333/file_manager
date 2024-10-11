import {ACTIONS} from "./constants.js";
import fs from "fs";
import os from "os";
import * as path from "node:path";
import {Action} from "./action.js";
import {getUserName} from "./utils.js";
import * as zlib from "node:zlib";

export class ActionController {
    currentDir = os.homedir();

    makeAction(action) {
        const toArray = action.replace(/\s+/g, ' ').trim().split(' ');
        const command = toArray[0];
        const arg = toArray.find((element) => element.startsWith('--'));

        if (command === ACTIONS.up) return new UpAction(arg, action, this);

        if (command === ACTIONS.ls) return new LsAction(arg, action, this);

        if (command === ACTIONS.cd) return new CdAction(arg, action, this);

        if (command === ACTIONS.add) return new AddAction(arg, action, this);

        if (command === ACTIONS.cat) return new CatAction(arg, action, this);

        if (command === ACTIONS.rn) return new RenameAction(arg, action, this);

        if (command === ACTIONS.cp) return new CopyAction(arg, action, this);

        if (command === ACTIONS.rm) return new RemoveAction(arg, action, this);

        if (command === ACTIONS.mv) return new MoveAction(arg, action, this);

        if (command === ACTIONS.os) return new OsAction(arg, action, this);

        if (command === ACTIONS.compress) return new CompressAction(arg, action, this);

        if (command === ACTIONS.decompress) return new DecompressAction(arg, action, this);
    }
}

class CompressAction extends Action {
    command = 'compress';

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

            fs.createReadStream(oldFilePath)
                .pipe(zlib.createBrotliCompress())
                .pipe(fs.createWriteStream(newFilePath))
                .on('finish', () => {
                    console.log('Done!');
                    this.printCurrentDir();
                })
        } catch (e) {
            this.displayError(e);
        }
    }
}

class DecompressAction extends Action {
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

            fs.createReadStream(oldFilePath)
                .pipe(zlib.createBrotliDecompress())
                .pipe(fs.createWriteStream(newFilePath))
                .on('finish', () => {
                    console.log('DONE!');
                    this.printCurrentDir();
                })
        } catch (e) {
            this.displayError();
        }
    }
}

class OsAction extends Action {
    command = 'os';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.handle();
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

        if (this.arg === '--architecture') {
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
        this.handle();
    }

    handle() {
        try {
            const oldName = this.splitFileNames[0]?.replace(this.currentDir, '');
            const newName = this.splitFileNames[1]?.replace(this.currentDir, '');

            const oldFilePath = path.join(this.currentDir, oldName);
            const newFilePath = path.join(this.currentDir, newName, oldName);

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
        this.handle();
    }

    handle() {
        try {
            const oldFilePath = path.join(this.currentDir, this.splitFileNames[0]);
            const newFilePath = path.join(this.currentDir, this.splitFileNames[1]);

            fs.rename(oldFilePath, newFilePath, (err) => {
                if (err) {
                    return this.displayError();
                }
                console.log('Successfully renamed');
                this.printCurrentDir();
            })
        } catch (e) {
            this.displayError();
        }
    }
}

class RemoveAction extends Action {
    command = 'rm';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle(callback = this.printCurrentDir) {
        try {
            const filePath = path.join(this.currentDir, this.pureFileName);

            fs.unlink(filePath, (e) => {
                if (e) {
                    return this.displayError();
                }
                console.log('Success');
                if (typeof callback === 'function') {
                    callback();
                }
            })
        } catch (e) {
            this.displayError();
        }
    }
}

class CopyAction extends Action {
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
            const stream = fs.createReadStream(filePath, {encoding: 'utf8'}).pipe(fs.createWriteStream(newFilePath));

            stream.on('finish', () => {
                console.log('Successfully copy')
                if (typeof callback === 'function') {
                    callback();
                }
            });
        } catch (e) {
            this.displayError();
        }
    }
}

class CatAction extends Action {
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

            stream.on('data', data =>  process.stdout.write(data.toString() + os.EOL))
                .on('error', this.displayError)
                .on('end', this.printCurrentDir);
        } catch (e) {
            this.displayError();
        }
    }
}

class AddAction extends Action {
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

class UpAction extends Action {
    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.handle();
    }

    handle() {
        if (this.currentDir === os.homedir()) {
            return this.printCurrentDir();
        }
        try {
            const currentPath = this.currentDir.split(path.sep);
            currentPath.splice(currentPath.length - 1, 1);
            const joinNewPath = currentPath.join(path.sep);

            fs.readdirSync(joinNewPath);
            this.actionController.currentDir = joinNewPath;
            this.printCurrentDir();
        } catch (e) {
            this.displayError()
        }
    }
}


class LsAction extends Action {
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

class CdAction extends Action {
    command = 'cd';

    constructor(arg, action, actionController) {
        super(arg, action, actionController);
        this.findFile();
        this.handle();
    }

    handle() {
        try {
            if (this.fileName === this.currentDir) {
                return this.printCurrentDir();
            }
            const clearFileName = this.fileName.replace(this.homeDir, '');
            let newDir = path.join(this.currentDir, clearFileName);

            fs.readdirSync(newDir);
            this.actionController.currentDir = newDir;
            this.printCurrentDir();
        } catch (e) {
            this.displayError();
        }
    }
}
