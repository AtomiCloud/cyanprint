import path from 'path';
import _glob from 'glob';
import { DirectorySystemInstance, FileSystemInstance, Glob, 
    IFileFactory, 
    IFileSystemInstanceMetadata, 
    IGlobFactory, 
    Ignore, 
    VirtualFileSystemInstance} from "../interfaces/interfaces";
import { FileFactory } from "./FileFactory";
import { Bar, Presets } from 'cli-progress';
import { Utility } from './Utility';
import { isBinaryFile } from 'isbinaryfile';

interface options {
    dot?: boolean,
    ignore?: string | string[]
}

export class GlobFactory implements IGlobFactory {
    private readonly fileFactory: IFileFactory;
    private readonly util: Utility;
    
    constructor(fileFactory: FileFactory, util: Utility) {
        this.fileFactory = fileFactory
        this.util = util;
    }
    
    GenerateFilesMetadata(glob: Glob, target: string = './'): IFileSystemInstanceMetadata[] {
        let pattern = path.resolve(this.fileFactory.FromRoot, glob.root, glob.pattern as string);
		let relPath = path.resolve(this.fileFactory.FromRoot, glob.root);
		let opts: options = {dot: true}
        if (glob.ignore != null) {
			opts.ignore = glob.ignore;
		}

        //returns all relative path from the glob root to the found file according to the glob pattern 
        //glob.sync returns all filenames matching the pattern
        let files: string[] = _glob.sync(pattern, opts).Map((s: string) => path.relative(relPath, s));
		return files.Map(s => this.fileFactory.CreateFileSystemInstanceMetadata(s, glob.root, target));
    }

    async ReadFiles(files: VirtualFileSystemInstance[], callback?: Function): Promise<VirtualFileSystemInstance[]> {
        let readBar: Bar = new Bar({}, Presets.shades_classic);
		let readCounter: number = 0;
		readBar.start(files.length, readCounter);
		
		let promises: Promise<VirtualFileSystemInstance>[] = [];
		
		files.Each((f: VirtualFileSystemInstance) => promises.push(this.fileFactory.ReadFile(f, function () {
			readCounter++;
			readBar.update(readCounter);
			if (readCounter >= readBar.getTotal()) {
				readBar.stop();
			}
		})));
		return await Promise.all(promises);
    }

    async AWriteFile(files: VirtualFileSystemInstance[]) {
        let bar: Bar = new Bar({}, Presets.shades_grey);
        let counter: number = 0;
        bar.start(files.length, 0);
        let promises: Promise<void>[] = [];
        files.Each((f: VirtualFileSystemInstance) => {
            return VirtualFileSystemInstance.match(f, {
                File: async (file: FileSystemInstance) => {
                    let content = file.content;
                    const isBinary = await isBinaryFile(file.metadata.sourceAbsolutePath);
                    promises.push(this.util.ASafeWriteFile(file.metadata.destinationAbsolutePath, content, isBinary, function () {
                        counter++;
                        bar.update(counter);
                        if (counter >= bar.getTotal()) {
                            bar.stop();
                        }
                    }));
                    return await Promise.all(promises);
                },
                Folder: async (folder: DirectorySystemInstance) => {
                    promises.push(this.util.ASafeCreateDirectory(folder.metadata.destinationAbsolutePath, function () {
                        counter++;
                        bar.update(counter);
                        if (counter >= bar.getTotal()) {
                            bar.stop();
                        }
                    }));
                    return await Promise.all(promises);
                }
            })
        });
    }

    CreateEmptyFiles(filesMeta: IFileSystemInstanceMetadata[], ignore?: Ignore): VirtualFileSystemInstance[] {
        return this.fileFactory.CreateEmptyFiles(filesMeta, ignore);
    }
}