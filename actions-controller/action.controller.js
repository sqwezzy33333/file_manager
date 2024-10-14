import {ACTIONS} from "../constants/constants.js";
import os from "os";
import {CompressAction} from "../actions/compress.action.js";
import {DecompressAction} from "../actions/decompress.action.js";
import {HashAction} from "../actions/hash.action.js";
import {OsAction} from "../actions/os.action.js";
import {MoveAction} from "../actions/move.action.js";
import {RemoveAction} from "../actions/remove.action.js";
import {CopyAction} from "../actions/copy.action.js";
import {RenameAction} from "../actions/rename.action.js";
import {CatAction} from "../actions/cat.action.js";
import {AddAction} from "../actions/add.actiion.js";
import {CdAction} from "../actions/cd.action.js";
import {LsAction} from "../actions/ls.action.js";
import {UpAction} from "../actions/up.action.js";

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

        if (command === ACTIONS.hash) return new HashAction(arg, action, this);
    }
}



