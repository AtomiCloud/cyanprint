import * as path from 'path';
import { FileFactory } from "../../src/classLibrary/Utility/FileFactory";
import {
    FileContent,
    FileSystemInstance,
    IFileFactory,
    IFileSystemInstanceMetadata,
    Ignore,
    VirtualFileSystemInstance
} from '../../src/classLibrary/interfaces/interfaces';
import _glob from "glob";
import { Utility } from '../../src/classLibrary/Utility/Utility';
import { Core, Kore } from '@kirinnee/core';

let core: Core = new Kore();
core.ExtendPrimitives();
let util: Utility = new Utility(core);
let folderName: string = "newDir"
let to: string = path.resolve(__dirname, folderName);
let from = path.resolve(__dirname, '../target/testDir/');
let fileFactory: IFileFactory = new FileFactory(from, to);

const templateIgnore: Ignore = {
    custom: {},
    guidResolver: {},
    ifElseResolver: {},
    inlineResolver: {},
    variableResolver: {},
}

describe("FileFactory", () => {
	describe("CreateFileSystemInstance", () => {
		it("should return the filesystem instance with correct filepaths 1", () => {
            let globRoot = "./template";
            let pattern = path.resolve(fileFactory.FromRoot, globRoot, "**/*.*");
            let relPath = path.resolve(fileFactory.FromRoot, globRoot);
            let relativePaths: string[] = _glob.sync(pattern, {dot:true}).map((s: string) => path.relative(relPath, s));
            let files = relativePaths.map((path: string) => fileFactory.CreateFileSystemInstance(path, globRoot, globRoot));
            let metadata: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: from + "/template/test.txt",
                destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                relativePath: "test.txt"
            }
            let file: FileSystemInstance = {
                metadata: metadata,
                content: FileContent.String(""),
                ignore: templateIgnore
            }
            
            let expected = [
                VirtualFileSystemInstance.File(file)
            ];
            expect(files).toStrictEqual(expected);
		});
        it ("should return the filesystem instance metadata with correct filepaths 2", () => {
            let file = fileFactory.CreateFileSystemInstance("./template/test.txt");
            let expectedMetadata: IFileSystemInstanceMetadata = {
                    sourceAbsolutePath: from + "/template/test.txt",
                    destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                    relativePath: "./template/test.txt"
                };
            let expectedFile: FileSystemInstance = {
                metadata: expectedMetadata,
                content: FileContent.String(""),
                ignore: templateIgnore
            }
            expect(file).toStrictEqual(VirtualFileSystemInstance.File(expectedFile));
        })
	});

    describe("ReadFile", () => {
		it("should return the VFS instance with correct content and paths", async () => {
            let globRoot = "./template";
            let pattern = path.resolve(fileFactory.FromRoot, globRoot, "**/*.*");
            let relPath = path.resolve(fileFactory.FromRoot, globRoot);
            let relativePaths: string[] = _glob.sync(pattern, {dot:true}).map((s: string) => path.relative(relPath, s));
            let files = relativePaths.map((path: string) => fileFactory.CreateFileSystemInstance(path, globRoot, globRoot));
            let expectedMetadata: IFileSystemInstanceMetadata = {
                    sourceAbsolutePath: from + "/template/test.txt",
                    destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                    relativePath: "test.txt"
                }
            let readVFS = await fileFactory.ReadFile(files[0]);
            VirtualFileSystemInstance.match(readVFS, {
                File: (file: FileSystemInstance) => {
                    expect(file.content).toStrictEqual(FileContent.String("test"));
                    expect(file.metadata).toStrictEqual(expectedMetadata);
                    expect(file.ignore).toStrictEqual(templateIgnore);
                },
                default: () => expect("1").toBe("2")
            })
		});
	});

    describe("GetAbsoluteFilepathOfFileInDestinationFilepath", () => {
        it("should return the filepath in the destination directory", () => {
            util.ASafeWriteFile(path.resolve(to, "./template/test.txt"), FileContent.String("hello"), false);
            let filepaths = fileFactory.GetAbsoluteFilePathsOfFileInDestinationPath("test.txt", "./template");
            let expected = path.resolve(__dirname, folderName) + "/template/test.txt";
            expect(filepaths[0]).toStrictEqual(expected);
        })
    })
});
