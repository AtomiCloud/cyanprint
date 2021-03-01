import chalk from "chalk";
import { Core, Kore } from "@kirinnee/core";

export class Utility {
    public readonly c: Core;

    constructor(core: Core) {
        if (!core.IsExtended) throw "Core needs to be extended";
        this.c = core;
    }

    static Throw(type: string, error: string, target?: object): void {
        console.log(chalk.red(type + " Exception: \n\t" + error));
        if (target) console.log(target);
        process.exit(1);
    }

    FlattenObject(obj: any, prepend: string = ''): Map<string, string> {
        let c = this.c;

        let ret: Map<string, string> = new Map<string, string>();

        for (let k in obj) {
            if (obj.hasOwnProperty(k)) {
                let data = obj[k];
                if (c.IsAnyString(data)) {
                    if (c.IsString(data)) {
                        ret.set(prepend + k, data);
                    } else {
                        Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
                    }
                } else if (typeof data === "object") {
                    ret = new Map<string, string>(ret.Arr().Union(this.FlattenObject(data, prepend + k + '.').Arr(), true));
                } else {
                    Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
                }
            }
        }
        return ret;
    }
}

export let core: Core = new Kore();
core.ExtendPrimitives();

export const utility = new Utility(core);
