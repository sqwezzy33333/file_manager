export const EXIT_COMMAND = '.exit';

export const ACTIONS = {
    up: 'up',
    ls: 'ls',
    cat: 'cat',
    add: 'add',
    rn: 'rn',
    cp: 'cp',
    mv: 'mv',
    rm: 'rm',
    os: 'os',
    hash: 'hash',
    compress: 'compress',
    decompress: 'decompress',
}

export const ACTIONS_REQUIRE_ARGUMENTS = {
    os: ['--EOL', '--cpus', '--homedir', '--username', '--architecture'],
}
