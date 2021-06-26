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
        const variables: string[] = this.util.FlattenStringValueObject(cyan.variable).Keys();
        const result: Map<string, number> = new Map<string, number>();
        const syntaxes: Syntax[] = cyan.syntax;

        virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
            variables.Map((variable: string) => {
                const allPossibleVariables = this.ModifyVariablesWithAllSyntax(variable, syntaxes);
                allPossibleVariables.Map((key: string) => {
                    const count = this.CountKeyInVFS(key, virtualFile);
                    this.util.Increase(result, variable, count);
                });
            });
        });

        return result;
    }

    private CountKeyInVFS(key: string, virtualFile: VirtualFileSystemInstance): number {
        return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                let tempCount = file.ignore.variableResolver.metadata ? file.metadata.destinationAbsolutePath.Count(key) : 0;
                if (file.ignore.variableResolver.content) {
                    FileContent.if.String(file.content, (str) => {
                        tempCount += str.Count(key);
                    });
                }
                return tempCount;
            },
            Folder: (folder: DirectorySystemInstance) => {
                return folder.ignore.variableResolver.metadata ? folder.metadata.destinationAbsolutePath.Count(key) : 0
            },
            default: () => 0,
        });
    }

    ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const variables: Map<string, string> = this.util.FlattenStringValueObject(cyan.variable);

        return virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
            let copyVirtualFile = Object.assign({}, virtualFile);
            variables
                .MapKey((key: string) => this.ModifyVariablesWithAllSyntax(key, cyan.syntax))
                .Map((allSyntaxes: string[], val: string) => {
                    allSyntaxes.Map((syntax: string) => {
                        VirtualFileSystemInstance.match(copyVirtualFile, {
                            File: (file: FileSystemInstance) => {
                                file.metadata.destinationAbsolutePath =
                                    file.ignore.variableResolver.metadata
                                        ? file.metadata.destinationAbsolutePath.ReplaceAll(syntax, val)
                                        : file.metadata.destinationAbsolutePath;

                            },
                            Folder: (folder: DirectorySystemInstance) => {
                                folder.metadata.destinationAbsolutePath =
                                    folder.ignore.variableResolver.metadata
                                        ? folder.metadata.destinationAbsolutePath.ReplaceAll(syntax, val)
                                        : folder.metadata.destinationAbsolutePath;
                            }
                        });
                        return copyVirtualFile;
                    });
                });
                return copyVirtualFile;
        });
    }

    ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const variablesMap: Map<string, string> = this.util.FlattenStringValueObject(cyan.variable);
        const allPossibleVariablesMap: Map<string[], string> = variablesMap.MapKey((key: string) => this.ModifyVariablesWithAllSyntax(key, cyan.syntax));

        return virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
            let copyVirtualFile = Object.assign({}, virtualFile);
            return VirtualFileSystemInstance.match(copyVirtualFile, {
                File: (file: FileSystemInstance) => {
                    if (!file.ignore.variableResolver.content) return virtualFile;
                    FileContent.if.String(file.content, (str: string) => {
                        let content = str;
                        allPossibleVariablesMap
                            .Map((allSyntaxes: string[], val: string) => {
                                allSyntaxes.Map((syntax: string) => {
                                    content = content.ReplaceAll(syntax, val);
                                });
                            });
                        file.content = FileContent.String(content);
                    });
                    return virtualFile;
                },
                default: (_virtualFile) => {
                    return _virtualFile;
                }
            });
        });
    }

    ModifyVariablesWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
        return syntaxes.Map( ([start, end]: Syntax) => `var${start + v + end}`);
    }
}

export { VariableResolver };
