import {
    CyanSafe,
    DirectorySystemInstance,
    FileContent,
    FileSystemInstance,
    IParsingStrategy,
    Syntax,
    VirtualFileSystemInstance
} from "../interfaces/interfaces";
import { Utility } from "../Utility/Utility";

class VariableResolver implements IParsingStrategy {
    private util: Utility;

    constructor(util: Utility) {
        this.util = util;
    }

    Count(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): Map<string, number> {
        const variables: string[] = this.util.FlattenObject(cyan.variable).Keys();
        const result: Map<string, number> = new Map<string, number>();
        const syntaxes: Syntax[] = cyan.syntax;

        virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            variables.Each((variable: string) => {
                const allPossibleVariables = this.ModifyVariablesWithAllSyntax(variable, syntaxes);
                allPossibleVariables.Each((key: string) => {
                    const count = VirtualFileSystemInstance.match(virtualFile, {
                        File: (file: FileSystemInstance) => {
                            if (!file.parse) return 0;
                            let tempCount = file.metadata.destinationAbsolutePath.Count(key);
                            if (file["content"] != null) {
                                FileContent.if.String(file.content, (str) => {
                                    tempCount += str.Count(key);
                                });
                            }
                            return tempCount;
                        },
                        Folder: (folder: DirectorySystemInstance) => {
                            return folder.parse ? folder.metadata.destinationAbsolutePath.Count(key) : 0
                        },
                        default: () => 0,
                    });

                    if (result.has(variable)) {
                        result.set(variable, result.get(variable)! + count);
                    } else {
                        result.set(variable, count);
                    }
                });
            });
        });

        return result;
    }

    ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const variables: Map<string, string> = this.util.FlattenObject(cyan.variable);

        return virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            variables
                .MapKey((key: string) => this.ModifyVariablesWithAllSyntax(key, cyan.syntax))
                .Each((allSyntaxes: string[], val: string) => {
                    allSyntaxes.Map((syntax: string) => {
                        VirtualFileSystemInstance.match(virtualFile, {
                            File: (file: FileSystemInstance) => {
                                file.metadata.destinationAbsolutePath =
                                    file.parse
                                        ? file.metadata.destinationAbsolutePath.ReplaceAll(syntax, val)
                                        : file.metadata.destinationAbsolutePath;

                            },
                            Folder: (folder: DirectorySystemInstance) => {
                                folder.metadata.destinationAbsolutePath =
                                    folder.parse
                                        ? folder.metadata.destinationAbsolutePath.ReplaceAll(syntax, val)
                                        : folder.metadata.destinationAbsolutePath;
                            }
                        });
                    });
                });
        });
    }

    ResolveContents(cyan: CyanSafe, files: FileSystemInstance[]): FileSystemInstance[] {
        const variablesMap: Map<string, string> = this.util.FlattenObject(cyan.variable);
        const allPossibleVariablesMap: Map<string[], string> = variablesMap.MapKey((key: string) => this.ModifyVariablesWithAllSyntax(key, cyan.syntax));

        return files.Each((file: FileSystemInstance) => {
            if (!file.parse) return;
            if (file["content"] == null) return;

            FileContent.if.String(file.content, (str: string) => {
                allPossibleVariablesMap
                    .Each((allSyntaxes: string[], val: string) => {
                        allSyntaxes.Map((syntax: string) => {
                            str = str.ReplaceAll(syntax, val);
                        });
                    });
                file.content = FileContent.String(str);
            });
        });
    }

    ModifyVariablesWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
        const allPossibleVariables: string[] = [];
        syntaxes.Each(syntax => {
            allPossibleVariables.push(`var${syntax[0] + v + syntax[1]}`);
        })
        return allPossibleVariables;
    }
}

export { VariableResolver };
