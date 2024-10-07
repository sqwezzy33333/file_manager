import {commandValidator, getUserName, goodBye, helloUser} from "./utils.js";
import * as readline from "node:readline";
import {EXIT_COMMAND} from "./constants.js";
import {ActionController} from "./action.controller.js";

const {stdin: input, stdout: output} = process;
const user = getUserName();
const rl = readline.createInterface({input, output});

const actionController = new ActionController();

init();

function init() {
    helloUser(user);
    initProcessListeners();
}


function initProcessListeners() {
    rl.on('close', () => goodBye(user))
    rl.on('line', writeActionListener)
}


function writeActionListener(action) {
    if (action === EXIT_COMMAND) {
        return rl.close();
    }

    const isValidAction = commandValidator(action);

    if (isValidAction) {
        return actionController.makeAction(action);
    }

    console.log('Invalid command/args');
}
