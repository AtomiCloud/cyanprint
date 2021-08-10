import chalk from "chalk";
import { Core } from "@kirinnee/core";
import { FileContent } from "../interfaces/interfaces";
import fs from "fs";
import path from "path";

declare global {
    interface String {
        FileName(): string;

        StandardizePath(): string;
    }
}

export class Utility {
    public readonly core: Core;

    constructor(core: Core) {
        core.AssertExtend();
        this.core = core;
        String.prototype.FileName = function (): string {
            return this.ReplaceAll("\\\\", "/", true).split('.').Omit(1).join('.').split('/').Last();
        };
        String.prototype.StandardizePath = function (): string {
            return this.ReplaceAll("\\\\", "/", true);
        }
    }

    static Throw(type: string, error: string, target?: object): void {
        console.log(chalk.red(type + " Exception: \n\t" + error));
        if (target) console.log(target);
        process.exit(1);
    }

    FlattenStringValueObject(obj: any, prepend: string = ''): Map<string, string> {
        let result: Map<string, string> = new Map<string, string>();

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const data = obj[key];
                if (this.core.IsAnyString(data)) {
                    if (this.core.IsString(data)) {
                        result.set(prepend + key, data);
                    } else {
                        Utility.Throw('Type', 'Every field cannot be empty: field ' + key, obj);
                    }
                } else if (typeof data === "object") {
                    result = new Map<string, string>(result.Arr().Union(this.FlattenStringValueObject(data, prepend + key + '.').Arr(), true));
                } else {
                    Utility.Throw('Type', 'Every field cannot be empty or is not an object/string value: field ' + key, obj);
                }
            }
        }
        return result;
    }

    FlattenBooleanValueObject(obj: any, prepend: string = ''): Map<string, boolean> {
        let result: Map<string, boolean> = new Map<string, boolean>();
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const data = obj[key];
                if (typeof data === "boolean" || (typeof data === 'object' && data !== null && typeof data.valueOf() === 'boolean')) {
                    result.set(prepend + key, data);
                } else if (typeof data === "object") {
                    result = new Map<string, any>(result.Arr().Union(this.FlattenBooleanValueObject(data, prepend + key + '.').Arr(), true));
                } else {
                    Utility.Throw('Type', 'Every field cannot be empty or is not an object/boolean value: field ' + key, obj);
                }
            }
        }
        return result;
    }

    FlattenNumberValueObject(obj: any, prepend: string = ''): Map<string, number> {
        let ret: Map<string, number> = new Map<string, number>();
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const data = obj[key];
                if (this.core.IsAnyNumber(data)) {
                    if (this.core.IsNumber(data)) {
                        ret.set(prepend + key, data);
                    } else {
                        Utility.Throw('Type', 'Every field cannot be empty: field ' + key, obj);
                    }
                } else {
                    Utility.Throw('Type', 'Every field cannot be empty or is not an object/number value: field ' + key, obj);
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
        let nCopy = new Map(n);
        m.forEach((value:number, key: T) => {
            this.Increase(nCopy, key, value);
        })
        return nCopy;
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
