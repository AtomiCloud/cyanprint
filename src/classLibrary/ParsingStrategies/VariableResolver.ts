import {
    CyanSafe,
    FileContent,
    FileSystemInstance,
    IFileSystemInstanceMetadata,
    IParsingStrategy,
    Syntax
} from "../interfaces/interfaces";
import { Core, Kore } from "@kirinnee/core";
import { utility, Utility } from "../Utility/Utility";

let core: Core = new Kore();
core.ExtendPrimitives();

class VariableResolver implements IParsingStrategy {
    private util: Utility;

    constructor(util: Utility) {
        this.util = util;
    }

    ResolveContents(cyan: CyanSafe, files: FileSystemInstance[]): FileSystemInstance[] {
        throw new Error("Method not implemented.");
    }

    Count(cyan: CyanSafe, files: FileSystemInstance[]): Map<string, number> {
        const variables: string[] = this.util.FlattenObject(cyan.variable).Keys();
        const result: Map<string, number> = new Map<string, number>();
        const syntaxes: Syntax[] = cyan.syntax;

        files.map((f: FileSystemInstance) => {
            variables.map((v: string) => {
                const allPossibleVariables = this.ModifyVariablesWithAllSyntax(v, syntaxes);
                allPossibleVariables.map((key: string) => {
                    let count: number = f.parse ? f.metadata.destinationAbsolutePath.Count(key) : 0;

                    if (f["content"] != null) {
                        FileContent.if.String(f.content, (str) => {
                            count += str.Count(key);
                        });
                    }

                    if (result.has(v)) {
                        result.set(v, result.get(v)! + count);
                    } else {
                        result.set(v, count);
                    }
                });
            });
        });

        return result;
    }

    ResolveFiles(cyan: CyanSafe, files: IFileSystemInstanceMetadata[]): IFileSystemInstanceMetadata[] {
        throw new Error("Method not implemented.");
    }

    private ModifyVariablesWithAllSyntax(v: string, syntaxes: Syntax[]): string[] {
        const allPossibleVariables: string[] = [];
        syntaxes.map(syntax => {
            allPossibleVariables.push(`${syntax[0] + v + syntax[1]}`);
        })
        return allPossibleVariables;
    }
}

const variableResolver = new VariableResolver(utility);
export { variableResolver, VariableResolver };
