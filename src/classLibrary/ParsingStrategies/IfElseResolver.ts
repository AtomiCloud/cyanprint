import {Utility} from "../Utility/Utility";
import {FileSystemInstance, 
	FileContent,
	VirtualFileSystemInstance,
	IParsingStrategy,
	Syntax,
	CyanSafe
	} from "../interfaces/interfaces";

class IfElseResolver implements IParsingStrategy {

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
                const allPossibleIfs = this.ModifyIfWithAllSyntax(flag, syntaxes).concat(this.ModifyInverseIfWithAllSyntax(flag, syntaxes));
                allPossibleIfs.Each((key: string) => {
                    const count = this.CountKeyInVFS(key, virtualFile)
									.AtMax(this.CountKeyInVFS(this.ConvertIfToEndKeyword(key), virtualFile));
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
				let tempCount = 0;
				if (file["content"] != null && file.ignore.ifElseResolver.content) {
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
		const allPossibleIfs: string[] = [];
		syntaxes.Each(syntax => {
			allPossibleIfs.push(`if${syntax[0] + v + syntax[1]}`);
		})
		return allPossibleIfs;
	}

	ModifyInverseIfWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
		const allPossibleInverseIfs: string[] = [];
		syntaxes.Each(syntax => {
			allPossibleInverseIfs.push(`if!${syntax[0] + v + syntax[1]}`);
		})
		return allPossibleInverseIfs;
	}

	ConvertIfToEndKeyword(ifStatement: string): string
	{
		return ifStatement.replace('if', 'end');
	}

	
	ResolveFiles(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		return virtualFiles;
	};

	ResolveContents(cyan: CyanSafe, virtualFiles: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		const flagsMap: Map<string, boolean> = this.util.FlattenObject(cyan.flags).MapValue((boolString: string) => boolString == "true");
        const allPossibleIfSignaturesMap: Map<string[], boolean> = flagsMap.MapKey((key: string) => this.ModifyIfWithAllSyntax(key, cyan.syntax));
		const allPossibleInverseIfSignaturesMap: Map<string[], boolean> = flagsMap.MapKey((key: string) => this.ModifyInverseIfWithAllSyntax(key, cyan.syntax));
        return virtualFiles.Each((virtualFile: VirtualFileSystemInstance) => {
            VirtualFileSystemInstance.match(virtualFile, {
                File: (file: FileSystemInstance) => {
                    if (!file.ignore.ifElseResolver.content) return;
                    if (file["content"] == null) return;
					
                    FileContent.if.String(file.content, (strContent: string) => {
                        allPossibleIfSignaturesMap.Each((ifSignatures: string[], v: boolean) => {
							ifSignatures.Each((ifSignature: string) => {
								let startIndexes: number[] = this.RetrieveLineIndexContainingSyntax(strContent, ifSignature);
								let endIndexes: number[] = this.RetrieveLineIndexContainingSyntax(strContent, 
									this.ConvertIfToEndKeyword(ifSignature));
								if (v) {
									strContent = this.RemoveLineIndexes(startIndexes.concat(endIndexes), strContent);
								} else {
									strContent = this.RemoveContentBetweenLineIndexes(startIndexes, endIndexes, strContent);
								}	
							})
						});
						allPossibleInverseIfSignaturesMap.Each((invIfSignatures: string[], v: boolean) => {
							invIfSignatures.Each((invIfSignature: string) => {
								let startIndexes: number[] = this.RetrieveLineIndexContainingSyntax(strContent, invIfSignature);
								let endIndexes: number[] = this.RetrieveLineIndexContainingSyntax(strContent, 
									this.ConvertIfToEndKeyword(invIfSignature));
								if (!v) {
									strContent = this.RemoveLineIndexes(startIndexes.concat(endIndexes), strContent);
								} else {
									strContent = this.RemoveContentBetweenLineIndexes(startIndexes, endIndexes, strContent);
								}	
							})
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
	
}

export { IfElseResolver };