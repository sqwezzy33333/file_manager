import os from 'os';

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
    console.log(`Thank you for using File Manager, ${user || 'Mister'}, goodbye!`)
}

export function helloUser(user) {
    if (user) {
        console.log(`Welcome to the File Manager, ${user || 'Mister'}!`);
    }
    printCurrentPath();
}

export function printCurrentPath() {
    console.log('You are currently in ' + os.homedir());
}