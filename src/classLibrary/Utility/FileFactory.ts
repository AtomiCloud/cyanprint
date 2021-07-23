import fs from "fs";
import path from "path";
import { DirectorySystemInstance, FileContent, FileSystemInstance, IFileFactory, 
    IFileSystemInstanceMetadata, 
    Ignore, 
    VirtualFileSystemInstance } from "../interfaces/interfaces";

export class FileFactory implements IFileFactory {
    readonly FromRoot: string;
    readonly ToRoot: string;

    constructor(fromRoot: string, toRoot: string) {
        this.FromRoot = fromRoot;
        this.ToRoot = toRoot;
    }

    CreateFileSystemInstanceMetadata(relativePath: string, from?: string, to?: string): IFileSystemInstanceMetadata {
        let absFrom = path.resolve(this.FromRoot, relativePath);
        let absTo = path.resolve(this.ToRoot, relativePath);
        if (from != undefined) {
            absFrom = path.resolve(this.FromRoot, from, relativePath);
        }
        if (to != undefined) {
            absTo = path.resolve(this.ToRoot, to, relativePath);
        } 
        return {
            relativePath: relativePath,
            sourceAbsolutePath: absFrom,
            destinationAbsolutePath: absTo,
        };
    }

    ReadFile(file: IFileSystemInstanceMetadata, callback?: Function): Promise<VirtualFileSystemInstance> {
        throw new Error("Method not implemented.");
    }

    ConvertToEmptyFiles(filesMeta: IFileSystemInstanceMetadata[]): VirtualFileSystemInstance[] {
        return filesMeta.Map((metadata: IFileSystemInstanceMetadata) => {
            let ignore: Ignore = {
                variableResolver:  {},
                inlineResolver: {},
                ifElseResolver: {},
                guidResolver: {},
                custom: {}
            }
            if (fs.lstatSync(metadata.sourceAbsolutePath).isFile()) {
                let file: FileSystemInstance = {
                    metadata: metadata,
                    content: FileContent.String(""),
                    ignore: ignore
                };
                return VirtualFileSystemInstance.File(file);
             } else {
                 let directory: DirectorySystemInstance =
                 {
                    metadata: metadata,
                    ignore: ignore
                } 
                return VirtualFileSystemInstance.Folder(directory);
            }
        });
       
    }

}