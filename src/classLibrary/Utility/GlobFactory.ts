import path from 'path';
import _glob from 'glob';
import { Glob, 
    IFileSystemInstanceMetadata, 
    IGlobFactory, 
    VirtualFileSystemInstance} from "../interfaces/interfaces";
import { FileFactory } from "./FileFactory";
import { Utility } from "./Utility";

interface options {
    dot?: boolean,
    ignore?: string | string[]
}

export class GlobFactory implements IGlobFactory {
    private readonly fileFactory;
    private readonly util;
    
    constructor(util: Utility, fileFactory: FileFactory) {
        this.util = util;
        this.fileFactory = fileFactory
    }
    
    GenerateFilesMetadata(glob: Glob, target: string): IFileSystemInstanceMetadata[] {
        let paths = path.resolve(this.fileFactory.FromRoot, glob.root, glob.pattern as string);
		let relPath = path.resolve(this.fileFactory.FromRoot, glob.root);
		let opts: options = {dot: true}
        if (glob.ignore != null) {
			opts.ignore = glob.ignore;
		}

        //returns relative path from the glob root to the found file according to the glob pattern 
        let files: string[] = _glob.sync(paths, opts).Map((s: string) => path.relative(relPath, s));
		return files.Map(s => this.fileFactory.CreateFileSystemInstanceMetadata(s, glob.root, target));
    }

    ReadFiles(files: VirtualFileSystemInstance[], callback?: Function): Promise<VirtualFileSystemInstance[]> {
        throw new Error("Method not implemented.");
    }
}