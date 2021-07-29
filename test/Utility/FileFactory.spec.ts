import * as path from 'path';
import { should } from 'chai';
import { FileFactory } from "../../src/classLibrary/Utility/FileFactory";
import { FileContent, FileSystemInstance, IFileFactory, IFileSystemInstanceMetadata, Ignore, VirtualFileSystemInstance } from '../../src/classLibrary/interfaces/interfaces';
import _glob from "glob";

should();

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
	describe("CreateFileSystemInstanceMetadata", () => {
		it("should return the filesystem instance metadata with correct filepaths 1", () => {
            let globRoot = "./template";
            let pattern = path.resolve(fileFactory.FromRoot, globRoot, "**/*.*");
            let relPath = path.resolve(fileFactory.FromRoot, globRoot);
            let relativePaths: string[] = _glob.sync(pattern, {dot:true}).map((s: string) => path.relative(relPath, s));
            let metadatas = relativePaths.map((path: string) => fileFactory.CreateFileSystemInstanceMetadata(path, globRoot, globRoot));
            let expected = [
                {
                    sourceAbsolutePath: from + "/template/test.txt",
                    destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                    relativePath: "test.txt"
                }
            ];
            metadatas.should.deep.equal(expected);
		});
        it ("should return the filesystem instance metadata with correct filepaths 2", () => {
            let metadata = fileFactory.CreateFileSystemInstanceMetadata("./template/test.txt");
            let expected: IFileSystemInstanceMetadata = {
                    sourceAbsolutePath: from + "/template/test.txt",
                    destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                    relativePath: "./template/test.txt"
                };
            metadata.should.deep.equal(expected);
        })
	});

    describe("CreateEmptyFiles", () => {
        it("should return VFS instance with empty content", () => {
            let metadata = fileFactory.CreateFileSystemInstanceMetadata("./template/test.txt");
            let metadatas = [metadata];
            let emptyFiles = fileFactory.CreateEmptyFiles(metadatas, templateIgnore);
            let file: FileSystemInstance = {
                metadata: metadata,
                content: FileContent.String(""),
                ignore: templateIgnore
            }
            let expectedFiles = [VirtualFileSystemInstance.File(file)];
            emptyFiles.should.deep.equal(expectedFiles);
        })
    });

    describe("ReadFile", () => {
		it("should return the VFS instance with correct content and paths", async () => {
            let globRoot = "./template";
            let pattern = path.resolve(fileFactory.FromRoot, globRoot, "**/*.*");
            let relPath = path.resolve(fileFactory.FromRoot, globRoot);
            let relativePaths: string[] = _glob.sync(pattern, {dot:true}).map((s: string) => path.relative(relPath, s));
            let metadatas = relativePaths.map((path: string) => fileFactory.CreateFileSystemInstanceMetadata(path, globRoot, globRoot));
            let expectedMetadata: IFileSystemInstanceMetadata = {
                    sourceAbsolutePath: from + "/template/test.txt",
                    destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                    relativePath: "test.txt"
                }
            
            let file: FileSystemInstance = {
                metadata: metadatas[0],
                content: FileContent.String(""),
                ignore: templateIgnore
            } 
            let readVFS = await fileFactory.ReadFile(VirtualFileSystemInstance.File(file));
            VirtualFileSystemInstance.match(readVFS, {
                File: (file: FileSystemInstance) => {
                    file.content.should.deep.equal(FileContent.String("test"));
                    file.metadata.should.deep.equal(expectedMetadata),
                    file.ignore.should.deep.equal(templateIgnore)
                },
                default: () => "1".should.equal("2")
            })
		});
	});
});