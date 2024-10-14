import os from 'os';
import {ACTIONS, ACTIONS_REQUIRE_ARGUMENTS} from '../constants/constants.js';

export const getUserName = () => {
    try {
        const filteredArguments = process.argv.slice(2).filter((element) => element.includes('--username='));
        const username = filteredArguments[0]?.split('=')[1];

        const nameToSplit = username.split('_');

        return nameToSplit[0] + ' ' + (nameToSplit[1] || '');
    } catch (e) {
        return null;
    }
};

export function goodBye(user) {
    console.log(`Thank you for using File Manager, ${user || 'NoName'}, goodbye!`)
}

export function helloUser(user) {
    console.log(`Welcome to the File Manager, ${user || 'NoName'}!`);
    printHomeDir();
}

export function printHomeDir() {
    console.log('You are currently in ' + os.homedir());
}

export function commandValidator(action) {

    const toArray = action.replace(/\s+/g, ' ').trim().split(' ');
    if (!toArray.length) {
        return false;
    }
    const command = toArray[0];
    const arg = toArray.find((element) => element.startsWith('--'));

    if (!Object.keys(ACTIONS).includes(command)) {
        return false;
    }

    if (!ACTIONS_REQUIRE_ARGUMENTS[command]?.length) {
        return true;
    }

    return ACTIONS_REQUIRE_ARGUMENTS[command]?.includes(arg);
}
