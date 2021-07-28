import * as path from 'path';
import {should} from 'chai';
import { FileFactory } from "../../src/classLibrary/Utility/FileFactory";
import { IFileFactory } from '../../src/classLibrary/interfaces/interfaces';
import _glob from "glob";

should();

let folderName: string = "newDir"
let to: string = path.resolve(__dirname, folderName);
let from = path.resolve(__dirname, '../target/testDir');
let fileFactory: IFileFactory = new FileFactory(from, to);

describe("FileFactory", () => {
	describe("CreateFileSystemInstanceMetadata", () => {
		//it("should return the filesystem instance metadata with correct filepaths", () => {
          //  console.log(to);
            //console.log(from);
            //let pattern = path.resolve(fileFactory.FromRoot, "./template", "**/*.*" as string);
            //let relPath = path.resolve(fileFactory.FromRoot, "./template");
            //let relativePaths: string[] = _glob.sync(pattern, {dot:true}).map((s: string) => path.relative(relPath, s));
            //console.log(relativePaths.length);
            //console.log(relativePaths[0]);
            //console.log(fileFactory.CreateFileSystemInstanceMetadata(relativePaths[0], "./template", "./"));
		//});
	});
});