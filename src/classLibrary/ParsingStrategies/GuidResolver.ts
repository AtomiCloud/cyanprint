import {
    CyanSafe,
    FileContent,
    FileSystemInstance,
    IGuidGenerator,
    IParsingStrategy,
    VirtualFileSystemInstance
} from "../interfaces/interfaces";

class GuidResolver implements IParsingStrategy {
    private guidGenerator: IGuidGenerator;

    constructor(guidGenerator: IGuidGenerator) {
        this.guidGenerator = guidGenerator;
    }

    Count(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): Map<string, number> {
        const guids: string[] = cyan.guid;
        const result: Map<string, number> = new Map<string, number>();
        virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            guids.Each((guid: string) => {
                const count = this.CountKeyInVFS(guid, virtualFile);

                if (result.has(guid)) {
                    result.set(guid, result.get(guid)! + count);
                } else {
                    result.set(guid, count);
                }
            });
        });

        return result;
    }

    private CountKeyInVFS(key: string, virtualFile: VirtualFileSystemInstance): number {
        return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                let tempCount = 0;
                if (file["content"] != null && file.ignore.guidResolver.content) {
                    FileContent.if.String(file.content, (str) => {
                        tempCount += str.toUpperCase().Count(key.toUpperCase());
                    });
                }
                return tempCount;
            },
            default: () => 0,
        });
    }

    ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        return virtualFiles;
    }

    ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const guidsMap: Map<string, string> = cyan.guid.AsKey(() => this.guidGenerator.GenerateGuid());
        return virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            VirtualFileSystemInstance.match(virtualFile, {
                File: (file: FileSystemInstance) => {
                    if (!file.ignore.guidResolver.content) return;
                    if (file["content"] == null) return;
                    FileContent.if.String(file.content, (str: string) => {
                        guidsMap
                            .Each((k: string, v: string) => {
                                str = str.ReplaceAll(k.toLowerCase(), v).ReplaceAll(k.toUpperCase(), v);
                            });
                        file.content = FileContent.String(str);
                    });
                },
                default: () => {
                    return;
                }
            });
        });
    }

    ReplaceGuid(guidArr: Map<string, string>, virtualFile: VirtualFileSystemInstance) {
        let upper: Map<string, string> = guidArr.MapKey((s: string) => s.toUpperCase());
        let lower: Map<string, string> = guidArr.MapKey((s: String) => s.toLowerCase());
        return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                if (!file.ignore.guidResolver.content) return;
                if (file["content"] == null) return;
                FileContent.if.String(file.content, (str: string) => {
                    upper.Each((k: string, v: string) => str = str.ReplaceAll(k, v));
                    lower.Each((k: string, v: string) => str = str.ReplaceAll(k, v));
                    file.content = FileContent.String(str);
                });
            },
            default: () => {
                return;
            }
        });
    }
}

export { GuidResolver };
