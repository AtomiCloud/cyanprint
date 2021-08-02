import fs from "fs";
import path from "path";
import { isBinaryFile } from 'isbinaryfile';
import { DirectorySystemInstance, 
    FileContent, 
    FileSystemInstance, 
    GlobSyncOptions, 
    IFileFactory, 
    IFileSystemInstanceMetadata, 
    Ignore, 
    VirtualFileSystemInstance } from "../interfaces/interfaces";
import _glob from "glob";

export class FileFactory implements IFileFactory {
    readonly FromRoot: string;
    readonly ToRoot: string;

    constructor(fromRoot: string, toRoot: string) {
        this.FromRoot = fromRoot;
        this.ToRoot = toRoot;
    }

     /**
	 * Generates the file metadata according to the relative path to the file/directory, directory from the source root path, destination root path
	 * returns the file metadatas
	 * @param relativePath relative path from the source root path including the optional filepaths
     * @param from Optional filepath of the file/directory from the source root filepath
     * @param to Optional filepath of the file/directory from the destination root filepath
	 */
    CreateFileSystemInstanceMetadata(relativePath:string, from: string = "./", to: string = './'): IFileSystemInstanceMetadata {
        let absFrom = path.resolve(this.FromRoot, from, relativePath);
        let absTo = path.resolve(this.ToRoot, to, relativePath);
        return {
            relativePath: relativePath,
            sourceAbsolutePath: absFrom,
            destinationAbsolutePath: absTo,
        };
    }

    GetAbsoluteFilePathsOfFileInDestinationPath(fileName: string, fromRoot: string = "./", pattern: string = "**/*.*", ignore?: string | string[]): string[] {
        let pathPattern = path.resolve(this.ToRoot, fromRoot, pattern);
		let opts: GlobSyncOptions = {dot: true}
        if (ignore != null) {
			opts.ignore = ignore;
		}
        //returns all absolute path according to the glob pattern 
        let files: string[] = _glob.sync(pathPattern, opts);
        return files.filter((path: string) => path.includes(fileName));
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
                            if (callback !== undefined) {
                                callback();
                            }
                            file.content = FileContent.Buffer(content);
                            resolve(VirtualFileSystemInstance.File(file));
                        });
                    } else {
                        fs.readFile(file.metadata.sourceAbsolutePath, 'utf8', function (err, content: string) {
                            if (err) console.log(err);
                            if (callback !== undefined) {
                                callback();
                            }
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

    CreateEmptyFiles(filesMeta: IFileSystemInstanceMetadata[], ignore?: Ignore): VirtualFileSystemInstance[] {
        return filesMeta.map((metadata: IFileSystemInstanceMetadata) => {
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