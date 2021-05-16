import {
    CyanSafe,
    FileContent,
    FileSystemInstance,
    IFileSystemInstanceMetadata,
    IParsingStrategy,
    Syntax
} from "../interfaces/interfaces";
import { Utility } from "../Utility/Utility";

class VariableResolver implements IParsingStrategy {
    private util: Utility;

    constructor(util: Utility) {
        this.util = util;
    }

    Count(cyan: CyanSafe, files: FileSystemInstance[]): Map<string, number> {
        const variables: string[] = this.util.FlattenObject(cyan.variable).Keys();
        const result: Map<string, number> = new Map<string, number>();
        const syntaxes: Syntax[] = cyan.syntax;

        files.Each((file: FileSystemInstance) => {
            variables.Each((variable: string) => {
                const allPossibleVariables = this.ModifyVariablesWithAllSyntax(variable, syntaxes);
                allPossibleVariables.Each((key: string) => {
                    let count: number = file.parse ? file.metadata.destinationAbsolutePath.Count(key) : 0;

                    if (file["content"] != null) {
                        FileContent.if.String(file.content, (str) => {
                            count += str.Count(key);
                        });
                    }

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

    ResolveFiles(cyan: CyanSafe, files: IFileSystemInstanceMetadata[]): IFileSystemInstanceMetadata[] {
        const variables: Map<string, string> = this.util.FlattenObject(cyan.variable);

        return files.Each((file: IFileSystemInstanceMetadata) => {
            variables
                .MapKey((key: string) => this.ModifyVariablesWithAllSyntax(key, cyan.syntax))
                .Each((allSyntaxes: string[], val: string) => {
                    allSyntaxes.Map((syntax: string) => file.destinationAbsolutePath = file.destinationAbsolutePath.ReplaceAll(syntax, val));
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
