import { Glob, 
    IFileSystemInstanceMetadata, 
    IGlobFactory, 
    VirtualFileSystemInstance} from "../interfaces/interfaces";

export class GlobFactory implements IGlobFactory {
    GenerateFiles(glob: Glob, target: string): VirtualFileSystemInstance[] {
        throw new Error("Method not implemented.");
    }
    ReadFiles(files: IFileSystemInstanceMetadata[], callback?: Function): Promise<VirtualFileSystemInstance[]> {
        throw new Error("Method not implemented.");
    }
}