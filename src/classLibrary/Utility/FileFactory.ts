import fs from "fs";
import path from "path";
import { isBinaryFile } from 'isbinaryfile';
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
        let absFrom = path.resolve(this.FromRoot);
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

    ReadFile(virtualFile: VirtualFileSystemInstance, callback?: Function): Promise<VirtualFileSystemInstance> {
        //why do we need to restrict the resolve
        return new Promise<VirtualFileSystemInstance>(async function (resolve: (f: VirtualFileSystemInstance) => void) {
            VirtualFileSystemInstance.match(virtualFile, {
                File: async (file: FileSystemInstance) => {
                    const isBinary = await isBinaryFile(file.metadata.sourceAbsolutePath);
                    if (isBinary) {
                        fs.readFile(file.metadata.sourceAbsolutePath, function (err, content: Buffer) {
                            if (err) console.log(err);
                            this.TryCallback(callback);
                            file.content = FileContent.Buffer(content);
                            resolve(VirtualFileSystemInstance.File(file));
                        });
                    } else {
                        fs.readFile(file.metadata.sourceAbsolutePath, 'utf8', function (err, content: string) {
                            if (err) console.log(err);
                            this.TryCallback(callback);
                            file.content = FileContent.String(content);
                            resolve(VirtualFileSystemInstance.File(file));
                        });
                    }
                },
                Folder: async (folder: DirectorySystemInstance) => {
                    resolve(VirtualFileSystemInstance.Folder(folder)); 
                },
                default: async () => resolve(virtualFile)
            })
            
        });
    }

    TryCallback(callback?: Function): void {
        if (typeof callback === "function") {
            callback();
        }
    }

    CreateEmptyFiles(filesMeta: IFileSystemInstanceMetadata[], ignore?: Ignore): VirtualFileSystemInstance[] {
        return filesMeta.Map((metadata: IFileSystemInstanceMetadata) => {
            let ignoreConfig: Ignore = {
                variableResolver:  {},
                inlineResolver: {},
                ifElseResolver: {},
                guidResolver: {},
                custom: {}
            }
            if (ignore !== undefined) {
                ignoreConfig = ignore;
            }
            if (fs.lstatSync(metadata.sourceAbsolutePath).isFile()) {
                let file: FileSystemInstance = {
                    metadata: metadata,
                    content: FileContent.String(""),
                    ignore: ignoreConfig
                };
                return VirtualFileSystemInstance.File(file);
             } else {
                 let directory: DirectorySystemInstance =
                 {
                    metadata: metadata,
                    ignore: ignoreConfig
                } 
                return VirtualFileSystemInstance.Folder(directory);
            }
        });
    }

}