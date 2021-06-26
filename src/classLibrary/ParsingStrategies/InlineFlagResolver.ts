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
    	const flags: string[] = this.util.FlattenBooleanValueObject(cyan.flags).Keys();
        const result: Map<string, number> = new Map<string, number>();
        const syntaxes: Syntax[] = cyan.syntax;

        virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
            flags.Map((flag: string) => {
                const allPossibleIfs = this.ModifyFlagWithAllSyntax(flag, syntaxes).concat(this.ModifyInverseFlagWithAllSyntax(flag, syntaxes));
                allPossibleIfs.Map((key: string) => {
                    const count = this.CountKeyInVFS(key, virtualFile);
                    this.util.Increase(result, flag, count);
                });
            });
        });

        return result;
  	}

	private CountKeyInVFS(key: string, virtualFile: VirtualFileSystemInstance): number {
		return VirtualFileSystemInstance.match(virtualFile, {
            File: (file: FileSystemInstance) => {
                let tempCount = file.ignore.inlineResolver.metadata ? file.metadata.sourceAbsolutePath.Count(key) : 0;
                if (file.ignore.inlineResolver.content) {
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
        return syntaxes.Map( ([start, end]: Syntax) => `flag${start + v + end}`);
	}

    ModifyInverseFlagWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
        return syntaxes.Map( ([start, end]: Syntax) => `flag!${start + v + end}`);
	}
	
	ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		const flagsMap: Map<string, boolean> = this.util.FlattenBooleanValueObject(cyan.flags);
		const allPossibleFlagsMap: Map<string[], boolean> = flagsMap.MapKey((flag: string) => this.ModifyFlagWithAllSyntax(flag, cyan.syntax));
        const allPossibleInverseFlagsMap: Map<string[], boolean> = flagsMap.MapKey((flag: string) => this.ModifyInverseFlagWithAllSyntax(flag, cyan.syntax));

		return virtualFiles.Where((virtualFile: VirtualFileSystemInstance) => {
            let shouldStay: boolean = true;
            allPossibleFlagsMap
                .forEach((flagVal: boolean, flagWithAllSyntaxes: string[]) => {
                    shouldStay = shouldStay && this.ShouldKeepFileWithInlineFlag(flagWithAllSyntaxes, flagVal, virtualFile);
                })
            allPossibleInverseFlagsMap
                .forEach((flagVal: boolean, flagWithAllSyntaxes: string[]) => {
                    shouldStay = shouldStay && this.ShouldKeepFileWithInlineFlag(flagWithAllSyntaxes, !flagVal, virtualFile);
                })
            return shouldStay;
        }).Map((virtualFile: VirtualFileSystemInstance) => {
            let copyVirtualFile = Object.assign({}, virtualFile);
            allPossibleFlagsMap.Keys().concat(allPossibleInverseFlagsMap.Keys())
                .forEach((key: string[]) => {
                    this.RemoveFlagFromMetadataDestinationPath(key, copyVirtualFile)
                });    
            return copyVirtualFile;
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
                file.metadata.destinationAbsolutePath = file.metadata.destinationAbsolutePath.Without(signatures);
            },
            Folder: (folder: DirectorySystemInstance) => {
                folder.metadata.destinationAbsolutePath = folder.metadata.destinationAbsolutePath.Without(signatures);
            },
        });
	};

	ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
        const flagsMap: Map<string, boolean> = this.util.FlattenBooleanValueObject(cyan.flags);
        const allPossibleFlagsMap: Map<string[], boolean> = flagsMap.MapKey((key: string) => this.ModifyFlagWithAllSyntax(key, cyan.syntax));
        const allPossibleInverseFlagsMap: Map<string[], boolean> = flagsMap.MapKey((key: string) => this.ModifyInverseFlagWithAllSyntax(key, cyan.syntax));

        return virtualFiles.Map((virtualFile: VirtualFileSystemInstance) => {
            let copyVirtualFile = Object.assign({}, virtualFile);
            return VirtualFileSystemInstance.match(copyVirtualFile, {
                File: (file: FileSystemInstance) => {
                    if (!file.ignore.inlineResolver.content) return copyVirtualFile;
                    FileContent.if.String(file.content, (str: string) => {
                        let content = str;
                        content = this.ConstructContentForInlineFlags(content, allPossibleFlagsMap, cyan.comments, false);
                        content = this.ConstructContentForInlineFlags(content, allPossibleInverseFlagsMap, cyan.comments, true);
                        file.content = FileContent.String(content);
                    });
                    return copyVirtualFile;
                },
                default: (_virtualFile) => {
                    return _virtualFile;
                }
            });
        });
	};

    ConstructContentForInlineFlags(content: string, allPossibleSignatureMap: Map<string[], boolean>, comments: string[], isInverse: boolean): string {
        let constructedContent = content;
        allPossibleSignatureMap
            .Map((allSignatures: string[], val: boolean) => {
                if (isInverse) val = !val;
                constructedContent = constructedContent
                    .LineBreak()
                    .Where((s: string) => this.ShouldKeepStringWithInlineFlag(allSignatures, val, s))
                    .Map((s: string) => s.Without(this.GenerateCommentsWithSignatureStrings(allSignatures, comments))) //why should it care about comments?
                    .Map((s: string) => s.Without(allSignatures))
                    .join("\n");
            });
        return constructedContent;
    }

    GenerateCommentsWithSignatureStrings(signatures: string[], comments: string[]): string[] {
		return comments
			.Map((c: string) =>
				signatures.Map((k: string) => c + k)
			)
			.Flatten();
	}
}

export { InlineFlagResolver };