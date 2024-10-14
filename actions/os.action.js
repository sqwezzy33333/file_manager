import {Action} from "../actions-controller/action.js";
import {getUserName} from "../utils/utils.js";
import os from "os";

export class OsAction extends Action {
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


