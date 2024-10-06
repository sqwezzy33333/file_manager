import {getUserName, goodBye, helloUser} from "./utils.js";
import * as readline from "node:readline";
import {EXIT_COMMAND} from "./constants.js";

const {stdin: input, stdout: output} = process;
const user = getUserName();
const rl = readline.createInterface({input, output});

init();

function init() {
    helloUser(user);
    initProcessListeners();
}


function initProcessListeners() {
    rl.on('close', () => goodBye(user))

    rl.on('line', message => {

        if (message === EXIT_COMMAND) {
            return rl.close();
        }

        console.log('Invalid command/args');
    })
}

