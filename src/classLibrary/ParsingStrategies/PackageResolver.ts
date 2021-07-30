import { CyanFlag, CyanSafe, FileContent, FileSystemInstance, IParsingStrategy, VirtualFileSystemInstance } from "../interfaces/interfaces";
import { Utility } from "../Utility/Utility";
import path from "path";
import RJSON from "relaxed-json";

class PackageResolver implements IParsingStrategy {
    private readonly util: Utility;

    constructor(util: Utility) {
        this.util = util;
    }

    ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const flags: CyanFlag = cyan.flags; 
        if (flags["packages"] != null) {
			let variables = this.util.FlattenBooleanValueObject(flags["packages"]!);
			return virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
                return VirtualFileSystemInstance.match(virtualFile, {
                    File: (file: FileSystemInstance) => {
                        let resolvedFile = this.ResolveJsonFile(variables, file);
                        return VirtualFileSystemInstance.File(resolvedFile);
                    },
                    default: () => virtualFile
                })
            });
		}
		return virtualFiles;
    }

    //decide if to keep in package file or not
	ResolveJsonFile(map: Map<string, boolean>, file: FileSystemInstance): FileSystemInstance {
        let fileCopy = Object.assign({}, file);
        FileContent.if.String(file.content, (str) => {
			if (this.IsPackageDotJson(file)) {
				//jsonObject is the package.json object
				let jsonObject = RJSON.parse(str);
				map.Each((k: string, v: boolean) => {
					if ("devDependencies" in jsonObject) {
						//if devDepedencies.k is not null and v is false
						if (k in jsonObject["devDependencies"] && !v) {
							delete jsonObject["devDependencies"][k];
						}
					}
					if ("dependencies" in jsonObject) {
						if (jsonObject["dependencies"][k] != null && !v) {
							delete jsonObject["dependencies"][k];
						}
					}
				});
				fileCopy.content = FileContent.String(JSON.stringify(jsonObject, null, 2));
				return fileCopy;
			}
			return fileCopy;
		});
		return fileCopy;
	}

    Count(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): Map<string, number> {
        const result: Map<string, number> = new Map<string, number>();
        const flags: CyanFlag = cyan.flags; 
        if (flags["packages"] != null) {
            let flagsMap: Map<string, boolean> = this.util.FlattenBooleanValueObject(flags["packages"]);
            virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
                flagsMap.Map((variable: string) => {
                    let count = this.CountKeyInVFS(variable, virtualFile);
                    this.util.Increase(result, "packages." + variable, count);
                })
            });
        }
        return result;
    }

    private CountKeyInVFS(key: string, virtualFile: VirtualFileSystemInstance): number {
        return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                let tempCount = 0;
                if (this.IsPackageDotJson(file)) {
                    FileContent.if.String(file.content, (str) => {
                        let jsonObject = RJSON.parse(str);
                        if ("devDependencies" in jsonObject) {
                            if (jsonObject["devDependencies"][key] != null) {
                                tempCount++;
                            }
                        }
                        if ("dependencies" in jsonObject) {
                            if (jsonObject["dependencies"][key] != null) {
                                tempCount++;
                            }
                        }
                    });
                }
                return tempCount;
            },
            default: () => 0
        });
    }

    ResolveFiles(cyan: CyanSafe, files: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        return files;
    }
    CountPossibleUnaccountedFlags(cyan: CyanSafe, files: VirtualFileSystemInstance[]): string[] {
        return [];
    }

    IsPackageDotJson(file: FileSystemInstance): boolean {
		return file.metadata.destinationAbsolutePath.FileName() === "package" && path.extname(file.metadata.destinationAbsolutePath) === ".json";
	}
}

export { PackageResolver };