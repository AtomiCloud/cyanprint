import {Utility} from "../Utility/Utility";
import {FileSystemInstance, 
	FileContent,
    DirectorySystemInstance,
	VirtualFileSystemInstance,
	IParsingStrategy,
	Syntax,
	CyanSafe
	} from "../interfaces/interfaces";

class InlineFlagResolver implements IParsingStrategy {

	private util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	Count(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): Map<string, number> {
    	const flags: string[] = this.util.FlattenObject(cyan.flags).Keys();
        const result: Map<string, number> = new Map<string, number>();
        const syntaxes: Syntax[] = cyan.syntax;

        virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            flags.Each((flag: string) => {
                const allPossibleIfs = this.ModifyFlagWithAllSyntax(flag, syntaxes).concat(this.ModifyInverseFlagWithAllSyntax(flag, syntaxes));
                allPossibleIfs.Each((key: string) => {
                    const count = this.CountKeyInVFS(key, virtualFile);
                    if (result.has(flag)) {
                        result.set(flag, result.get(flag)! + count);
                    } else {
                        result.set(flag, count);
                    }
                });
            });
        });

        return result;
  	}

	private CountKeyInVFS(key: string, virtualFile: VirtualFileSystemInstance): number {
		return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                let tempCount = file.ignore.inlineResolver.metadata ? file.metadata.sourceAbsolutePath.Count(key) : 0;
                if (file["content"] != null && file.ignore.inlineResolver.content) {
                    FileContent.if.String(file.content, (str) => {
                        tempCount += str.Count(key);
                    });
                }
                return tempCount;
            },
            Folder: (folder: DirectorySystemInstance) => {
                return folder.ignore.inlineResolver.metadata ? folder.metadata.sourceAbsolutePath.Count(key) : 0
            },
            default: () => 0,
        });
	}

	ModifyFlagWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
		const allPossibleInlineFlags: string[] = [];
		syntaxes.Each(syntax => {
			allPossibleInlineFlags.push(`flag${syntax[0] + v + syntax[1]}`);
		})
		return allPossibleInlineFlags;
	}

    ModifyInverseFlagWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
		const allPossibleInverseInlineFlags: string[] = [];
		syntaxes.Each(syntax => {
			allPossibleInverseInlineFlags.push(`flag!${syntax[0] + v + syntax[1]}`);
		})
		return allPossibleInverseInlineFlags;
	}
	
    //have not settled for inverse
	ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		const flagsMap: Map<string, boolean> = this.util.FlattenObject(cyan.flags).MapValue((boolString: string) => boolString == "true");
		const allPossibleFlagsMap: Map<string[], boolean> = flagsMap.MapKey((flag: string) => this.ModifyFlagWithAllSyntax(flag, cyan.syntax));
		return virtualFiles.Where((virtualFile: VirtualFileSystemInstance) => {
            let shouldStay: boolean = true;
            allPossibleFlagsMap
                .forEach((flagVal: boolean, flagWithAllSyntaxes: string[]) => {
                    shouldStay = shouldStay && this.ShouldKeepFileWithInlineFlag(flagWithAllSyntaxes, flagVal, virtualFile);
                })
            return shouldStay;
        }).Each((virtualFile: VirtualFileSystemInstance) => {
            allPossibleFlagsMap
                .forEach((val: boolean, key: string[]) => {
                    this.RemoveFlagFromMetadataDestinationPath(key, virtualFile)
                });    
        });
	};

    ShouldKeepFileWithInlineFlag(flagSignatures: string[], flagValue: boolean, virtualFile: VirtualFileSystemInstance): boolean {
        return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                const checkTarget: string = file.metadata.relativePath;
                return this.ShouldKeepStringWithInlineFlag(flagSignatures, flagValue, checkTarget);
            },
            Folder: (folder: DirectorySystemInstance) => {
                const checkTarget: string = folder.metadata.relativePath;
                return this.ShouldKeepStringWithInlineFlag(flagSignatures, flagValue, checkTarget);     
            },
            default: () => false,
        });
	}

    ShouldKeepStringWithInlineFlag(flagSignatures: string[], flagValue: boolean, checkTarget: string): boolean {
        return flagSignatures.Where((signature: string) => !checkTarget.includes(signature) || flagValue).length === flagSignatures.length;   
    }

    RemoveFlagFromMetadataDestinationPath(signatures: string[], virtualFile: VirtualFileSystemInstance) {
        VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                file.metadata.destinationAbsolutePath = file.metadata.destinationAbsolutePath.Without(signatures.Map((s: string) => s));
            },
            Folder: (folder: DirectorySystemInstance) => {
                folder.metadata.destinationAbsolutePath = folder.metadata.destinationAbsolutePath.Without(signatures.Map((s: string) => s));
            },
        });
	};

	ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const flagsMap: Map<string, boolean> = this.util.FlattenObject(cyan.flags).MapValue((boolString: string) => boolString == "true");
        const allPossibleFlagsMap: Map<string[], boolean> = flagsMap.MapKey((key: string) => this.ModifyFlagWithAllSyntax(key, cyan.syntax));
        return virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            VirtualFileSystemInstance.match(virtualFile, {
                File: (file: FileSystemInstance) => {
                    if (!file.ignore.inlineResolver.content) return;
                    if (file["content"] == null) return;
                    FileContent.if.String(file.content, (str: string) => {
                        str = this.ConstructContentWithCommentsRemoved(str, allPossibleFlagsMap, cyan.comments);
                        file.content = FileContent.String(str);
                    });
                },
                default: () => {
                    return;
                }
            });
        });
	};

    ConstructContentWithCommentsRemoved(content: string, allPossibleSignatureMap: Map<string[], boolean>, comments: string[]): string {
        allPossibleSignatureMap
            .Each((allSignatures: string[], val: boolean) => {
                content = content
                    .LineBreak()
                    .Where((s: string) => this.ShouldKeepStringWithInlineFlag(allSignatures, val, s))
                    .Map((s: string) => s.Without(this.GenerateCommentAndSignatureStrings(allSignatures, comments)))
                    .join("\n");
            });
        return content;
    }

    GenerateCommentAndSignatureStrings(signatures: string[], comments: string[]): string[] {
		return comments
			.Map((c: string) =>
				signatures.Map((k: string) => c + k)
			)
			.Flatten();
	}
}

export { InlineFlagResolver };