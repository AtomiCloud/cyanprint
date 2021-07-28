import chalk from "chalk";
import { Core } from "@kirinnee/core";
import { FileContent } from "../interfaces/interfaces";
import fs from "fs";
import path from "path";

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
                    Utility.Throw('Type', 'Every field cannot be empty or is not an object/string value: field ' + k, obj);
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
                    Utility.Throw('Type', 'Every field cannot be empty or is not an object/boolean value: field ' + k, obj);
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
                    Utility.Throw('Type', 'Every field cannot be empty or is not an object/number value: field ' + k, obj);
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

    IncreaseInMap<T>(m: Map<T, number>, n:Map<T, number>) : Map<T, number>
    {
        let mCopy = new Map(m);
        mCopy.forEach((value:number, key: T) => {
            this.Increase(n, key, value);
        })
        return mCopy;
    }

    ASafeWriteFile(filePath: string, content: FileContent, binary: boolean, callback?: Function): Promise<void> {
        if (fs.existsSync(filePath)) return new Promise<void>(resolve => {
            if (typeof callback === "function") callback();
            resolve()
        });
        this.EnsureDirectory(filePath);
        return new Promise<void>(function (resolve) {
            if (binary) {
                FileContent.match(content, {
                    String: (str: string) => {
                        fs.writeFile(filePath, str, function (err) {
                            if (err) console.log(err);
                            if (typeof callback === "function") callback();
                            resolve();
                        });
                    },
                    Buffer: (buffer: Buffer) => {
                        fs.writeFile(filePath, buffer, function (err) {
                            if (err) console.log(err);
                            if (typeof callback === "function") callback();
                            resolve();
                        });
                    }
                })
            } else {
                FileContent.match(content, {
                    String: (str: string) => {
                        fs.writeFile(filePath, str, 'utf8', function (err) {
                            if (err) console.log(err);
                            if (typeof callback === "function") callback();
                            resolve();
                        });
                    },
                    Buffer: (buffer: Buffer) => {
                        fs.writeFile(filePath, buffer, 'utf8', function (err) {
                            if (err) console.log(err);
                            if (typeof callback === "function") callback();
                            resolve();
                        });
                    }
                })
            }
        });
    }

    ASafeCreateDirectory(filePath: string, callback?: Function): Promise<void> {
        if (fs.existsSync(filePath)) return new Promise<void>(r => {
            if (typeof callback === "function") callback();
            r();
        });
        this.EnsureDirectory(filePath);
        return new Promise<void>(function (resolve) {
            fs.mkdir(filePath, function (err) {
                if (err) console.log(err);
                if (typeof callback === "function") callback();
                resolve();
            });
        });
    }

    private EnsureDirectory(filePath: string): void {
        let dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            this.EnsureDirectory(dir);
            fs.mkdirSync(dir);
        }
    }
}
