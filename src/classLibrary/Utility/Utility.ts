import chalk from "chalk";
import { Core } from "@kirinnee/core";

export class Utility {
    public readonly c: Core;

    constructor(core: Core) {
        core.AssertExtend();
        this.c = core;
    }

    static Throw(type: string, error: string, target?: object): void {
        console.log(chalk.red(type + " Exception: \n\t" + error));
        if (target) console.log(target);
        process.exit(1);
    }

    FlattenStringValueObject(obj: any, prepend: string = ''): Map<string, string> {
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
                    ret = new Map<string, string>(ret.Arr().Union(this.FlattenStringValueObject(data, prepend + k + '.').Arr(), true));
                } else {
                    Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
                }
            }
        }
        return ret;
    }

    FlattenBooleanValueObject(obj: any, prepend: string = ''): Map<string, boolean> {
        let ret: Map<string, boolean> = new Map<string, boolean>();
        for (let k in obj) {
            if (obj.hasOwnProperty(k)) {
                let data = obj[k];
                if (typeof data === "boolean" || (typeof data === 'object' && data !== null && typeof data.valueOf() === 'boolean')) {
                    ret.set(prepend + k, data);
                } else if (typeof data === "object") {
                    ret = new Map<string, any>(ret.Arr().Union(this.FlattenBooleanValueObject(data, prepend + k + '.').Arr(), true));
                } else {
                    Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
                }
            }
        }
        return ret;
    }

    FlattenNumberValueObject(obj: any, prepend: string = ''): Map<string, number> {
        let ret: Map<string, number> = new Map<string, number>();
        let c = this.c;
        for (let k in obj) {
            if (obj.hasOwnProperty(k)) {
                let data = obj[k];
                if (c.IsAnyNumber(data)) {
                    if (c.IsNumber(data)) {
                        ret.set(prepend + k, data);
                    } else {
                        Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
                    }
                } else {
                    Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
                }
            }
        }
        return ret;
    }

    Increase<T>(m: Map<T,number>, key: T, amount: number) {
        if (m.has(key)) {
          m.set(key, m.get(key)! + amount)
        } else {
          m.set(key, amount);
        }
    } 
}
