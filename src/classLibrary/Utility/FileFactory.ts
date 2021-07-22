import { IFileFactory, 
    IFileSystemInstanceMetadata, 
    VirtualFileSystemInstance } from "../interfaces/interfaces";

export class FileFactory implements IFileFactory {
    CreateFileSystemInstance(relativePath: string, from?: string, to?: string): VirtualFileSystemInstance {
        throw new Error("Method not implemented.");
    }
    ReadFile(file: IFileSystemInstanceMetadata, callback?: Function): Promise<VirtualFileSystemInstance> {
        throw new Error("Method not implemented.");
    }

}