import {Utility} from "../Utility/Utility";
import {FileSystemInstance, 
	FileContent,
	VirtualFileSystemInstance,
	IParsingStrategy,
	Syntax,
	CyanSafe,
	} from "../interfaces/interfaces";

class IfElseResolver implements IParsingStrategy {

	private util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	Count(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): Map<string, number> {
    	const flags: string[] = this.util.FlattenBooleanValueObject(cyan.flags).Keys();
        const result: Map<string, number> = new Map<string, number>();
        const syntaxes: Syntax[] = cyan.syntax;

        virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            flags.Each((flag: string) => {
                const allPossibleIfs = this.ModifyIfWithAllSyntax(flag, syntaxes).concat(this.ModifyInverseIfWithAllSyntax(flag, syntaxes));
                allPossibleIfs.Each((key: string) => {
                    const count = this.CountKeyInVFS(key, virtualFile)
									.AtMax(this.CountKeyInVFS(this.ConvertIfToEndKeyword(key), virtualFile));
                    this.util.Increase(result, flag, count);
                });
            });
        });

        return result;
  	}

	private CountKeyInVFS(key: string, virtualFile: VirtualFileSystemInstance): number {
		return VirtualFileSystemInstance.match(virtualFile, {
			File: (file: FileSystemInstance) => {
				let tempCount = 0;
				if (file.ignore.ifElseResolver.content) {
					FileContent.if.String(file.content, (str) => {
						tempCount += str.Count(key);
					});
				}
				return tempCount;
			},
			default: () => 0,
		});
	}

	ModifyIfWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
		return syntaxes.Map( ([start, end]: Syntax) => `if${start + v + end}`);
	}

	ModifyInverseIfWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
		return syntaxes.Map( ([start, end]: Syntax) => `if!${start + v + end}`);
	}

	ConvertIfToEndKeyword(ifStatement: string): string
	{
		return ifStatement.replace('if', 'end');
	}

	
	ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		return virtualFiles;
	};

	ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		const flagsMap: Map<string, boolean> = this.util.FlattenBooleanValueObject(cyan.flags);
		const allPossibleIfSignaturesMap: Map<string[], boolean> = flagsMap.MapKey((key: string) => this.ModifyIfWithAllSyntax(key, cyan.syntax));
		const allPossibleInverseIfSignaturesMap: Map<string[], boolean> = flagsMap.MapKey((key: string) => this.ModifyInverseIfWithAllSyntax(key, cyan.syntax));
        return virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            VirtualFileSystemInstance.match(virtualFile, {
                File: (file: FileSystemInstance) => {
                    if (!file.ignore.ifElseResolver.content) return;
					
                    FileContent.if.String(file.content, (strContent: string) => {
                        allPossibleIfSignaturesMap.Each((ifSignatures: string[], v: boolean) => {
							strContent = this.ResolveContentBetweenIfSignature(ifSignatures, v, strContent, false);
						});
						allPossibleInverseIfSignaturesMap.Each((invIfSignatures: string[], v: boolean) => {
							strContent = this.ResolveContentBetweenIfSignature(invIfSignatures, v, strContent, true);
						});
						file.content = FileContent.String(strContent);
                    });
                },
                default: () => {
                    return;
                }
            });
        });
		
	};

	ResolveContentBetweenIfSignature(ifSignatures: string[], v: boolean, strContent: string, isInverse: boolean) : string
	{
		let resolvedContent = strContent;
		for (let idx = 0; idx < ifSignatures.length; idx++) {
			let ifSignature = ifSignatures[idx];
			let startIndexes: number[] = this.RetrieveLineIndexContainingSyntax(resolvedContent, ifSignature);
			let endIndexes: number[] = this.RetrieveLineIndexContainingSyntax(resolvedContent, 
				this.ConvertIfToEndKeyword(ifSignature));
			if ((!isInverse && v) || (isInverse && !v)) {
				resolvedContent = this.RemoveLineIndexes(startIndexes.concat(endIndexes), resolvedContent);
			} else {
				resolvedContent = this.RemoveContentBetweenLineIndexes(startIndexes, endIndexes, resolvedContent);
			}	
		}
		return resolvedContent;
	}

	RetrieveLineIndexContainingSyntax(strContent: string, signature: string): number[] {
		let index: number[] = strContent
								.LineBreak()
								.Map((s: string, i: number) => [s, i] as [string, number])
								.Where((n: [string, number]) => n[0].includes(signature))
								.Map((n: [string, number]) => n[1]);
		return index;
	}

	RemoveContentBetweenLineIndexes(startIndexes: number[], endIndexes: number[], strContent: string): string {
		if (startIndexes.length != endIndexes.length) return strContent;
		return strContent.LineBreak().WithoutIndex(
			startIndexes.Map((n: number, index: number) =>
				[].Fill(endIndexes[index] - n + 1, (i: number) => i + n)
			).Flatten()
		).join('\n');
	}

	RemoveLineIndexes(lineIndexes: number[], strContent: string) : string {
		return strContent.LineBreak().WithoutIndex(lineIndexes).join('\n');
	}
	
	//Untested
	ModifyIfRegExpWithAllSyntax(syntaxes: Syntax[]): string[]
	{
		const allPossibleIfs: string[] = [];
		syntaxes.Each(syntax => {
			allPossibleIfs.push(`/if${syntax[0]}[^~]*${syntax[1]}/g`);
		})
		return allPossibleIfs;
	}

	ModifyInverseIfRegExpWithAllSyntax(syntaxes: Syntax[]): string[]
	{
		const allPossibleIfs: string[] = [];
		syntaxes.Each(syntax => {
			allPossibleIfs.push(`/if!${syntax[0]}[^~]*${syntax[1]}/g`);
		})
		return allPossibleIfs;
	}

	CountPossibleUnaccountedFlags(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): string[] 
	{
		const syntaxes: Syntax[] = cyan.syntax;
		let result: string[] = [];
		virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
			const allPossibleIfRegExps: string[] = this.ModifyIfRegExpWithAllSyntax(syntaxes).concat(this.ModifyInverseIfRegExpWithAllSyntax(syntaxes));
			allPossibleIfRegExps.Each((regExpString: string) => {
				result = result.concat(this.CountUnaccountedKeyInVFS(regExpString, virtualFile));
			});	
		});
		return result;
	}

	CountUnaccountedKeyInVFS(key:string, virtualFile: VirtualFileSystemInstance): string[]
	{
		return VirtualFileSystemInstance.match(virtualFile, {
			File: (file: FileSystemInstance) => {
				if (!file.ignore.ifElseResolver.content) return [];

				FileContent.if.String(file.content, (strContent: string) => {
					return strContent
						.LineBreak()
						.Map(s => {
							let ifRegExp = new RegExp(key);
							let endRegExp = new RegExp(this.ConvertIfToEndKeyword(key));
							s.Match(ifRegExp).concat(s.Match(endRegExp))
						})
						.Flatten()
						.Map(s => `${s}:${file.metadata.relativePath}`)
						.Flatten();
				});
				return [];
			},
			default: () => { 
				return [];
			}
		});
	}
}

export { IfElseResolver };