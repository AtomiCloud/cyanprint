import {
    CyanSafe,
    DirectorySystemInstance,
    FileContent,
    FileSystemInstance,
    IGuidGenerator,
    IParsingStrategy,
    VirtualFileSystemInstance
} from "../interfaces/interfaces";
import { Utility } from "../Utility/Utility";

class GuidResolver implements IParsingStrategy {
    private guidGenerator: IGuidGenerator;
    private util: Utility;

    constructor(guidGenerator: IGuidGenerator, util: Utility) {
        this.guidGenerator = guidGenerator;
        this.util = util;
    }

    Count(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): Map<string, number> {
        const guids: string[] = cyan.guid;
        const result: Map<string, number> = new Map<string, number>();
        virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            guids.Each((guid: string) => {
                const count = this.CountGuidInVFS(guid, virtualFile);
                this.util.Increase(result, guid, count);
            });
        });

        return result;
    }

    private CountGuidInVFS(key: string, virtualFile: VirtualFileSystemInstance): number {
        return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                let tempCount = file.ignore.guidResolver.metadata ? file.metadata.sourceAbsolutePath.toUpperCase().Count(key.toUpperCase()) : 0;
                if (file.ignore.guidResolver.content) {
                    FileContent.if.String(file.content, (str) => {
                        tempCount += str.toUpperCase().Count(key.toUpperCase());
                    });
                }
                return tempCount;
            },
            Folder: (folder: DirectorySystemInstance) => {
                return folder.ignore.guidResolver.metadata ? 
                    folder.metadata.sourceAbsolutePath.toUpperCase().Count(key.toUpperCase()) : 0;
            },
            default: () => 0,
        });
    }

    ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        return virtualFiles;
    }

    ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const guidsMap: Map<string, string> = cyan.guid.AsKey(() => this.guidGenerator.GenerateGuid());
        return virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
            let copyVirtualFile = Object.assign({}, virtualFile);
            return VirtualFileSystemInstance.match(copyVirtualFile, {
                File: (file: FileSystemInstance) => {
                    if (!file.ignore.guidResolver.content) return copyVirtualFile;
                    FileContent.if.String(file.content, (str: string) => {
                        let content = str;
                        guidsMap
                            .Map((k: string, v: string) => {
                                content = content.ReplaceAll(k.toLowerCase(), v).ReplaceAll(k.toUpperCase(), v);
                            });
                        file.content = FileContent.String(content);
                    });
                    return copyVirtualFile;
                },
                default: (_virtualFile) => {
                    return _virtualFile;
                }
            });
        });
    }

    ReplaceGuid(guidArr: Map<string, string>, virtualFile: VirtualFileSystemInstance) {
        let upper: Map<string, string> = guidArr.MapKey((s: string) => s.toUpperCase());
        let lower: Map<string, string> = guidArr.MapKey((s: String) => s.toLowerCase());
        let copyVirtualFile = Object.assign({}, virtualFile);
        return VirtualFileSystemInstance.match(copyVirtualFile, {
            File: (file: FileSystemInstance) => {
                if (!file.ignore.guidResolver.content) return;
                
                FileContent.if.String(file.content, (str: string) => {
                    let content = str;
                    upper.Map((k: string, v: string) => content = content.ReplaceAll(k, v));
                    lower.Map((k: string, v: string) => content = content.ReplaceAll(k, v));
                    file.content = FileContent.String(content);
                });
            },
            default: () => {
                return;
            }
        });
    }

    CountPossibleUnaccountedFlags(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): string[] {
        return [];
    }
}

export { GuidResolver };
