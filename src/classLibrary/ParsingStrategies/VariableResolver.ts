import { CyanSafe, FileSystemInstance, IFileSystemInstanceMetadata, IParsingStrategy } from "../interfaces/cyan";

class VariableResolver implements IParsingStrategy {

    ResolveContents(cyan: CyanSafe, files: FileSystemInstance[]): FileSystemInstance[] {
        throw new Error("Method not implemented.");
    }

    Count(cyan: CyanSafe, files: FileSystemInstance[]): Map<string, number> {
        throw new Error("Method not implemented.");
    }

    ResolveFiles(cyan: CyanSafe, files: IFileSystemInstanceMetadata[]): IFileSystemInstanceMetadata[] {
        throw new Error("Method not implemented.");
    }

}

const variableResolver = new VariableResolver();
export { variableResolver, VariableResolver };
