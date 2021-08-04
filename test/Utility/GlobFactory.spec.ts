import { Kore } from "@kirinnee/core";
import { should } from "chai";
import { FileFactory } from "../../src/classLibrary/Utility/FileFactory";
import { GlobFactory } from "../../src/classLibrary/Utility/GlobFactory";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import path from "path";
import { FileContent, FileSystemInstance, GlobSafe, IFileFactory, IFileSystemInstanceMetadata, IGlobFactory, Ignore, VirtualFileSystemInstance } from "../../src/classLibrary/interfaces/interfaces";

should();

let util: Utility = new Utility(new Kore());
let folderName: string = "newDir"
let to: string = path.resolve(__dirname, folderName);
let from = path.resolve(__dirname, '../target/testDir/');
let fileFactory: IFileFactory = new FileFactory(from, to);
let globFactory: IGlobFactory = new GlobFactory(fileFactory, util);

const templateIgnore: Ignore = {
    custom: {},
    guidResolver: {},
    ifElseResolver: {},
    inlineResolver: {},
    variableResolver: {},
}

describe("GlobFactory", () => {
	describe("GenerateFiles", () => {
		it("should return the filesystem instance with correct filepaths", () => {
            let glob: GlobSafe = {
                root: "./template",
                pattern: ["**/", "*.*"],
                ignore: [""],
                skip: templateIgnore
            }
            let files = globFactory.GenerateFiles(glob, "./template");
            let expectedMetadata: IFileSystemInstanceMetadata = {
                    sourceAbsolutePath: from + "/template/test.txt",
                    destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                    relativePath: "test.txt"
                };
            let file: FileSystemInstance = {
                metadata: expectedMetadata,
                content: FileContent.String(""),
                ignore: templateIgnore
            }
            let expected = [
                VirtualFileSystemInstance.File(file)
            ]
            files.should.deep.equal(expected);
        })
    });

    describe("ReadFiles", () => {
		it("should return the VFS instances with correct content and paths", async () => {
            let glob: GlobSafe = {
                root: "./template",
                pattern: ["**/*.*"],
                ignore: [""],
                skip: templateIgnore
            }
            let files = globFactory.GenerateFiles(glob, "./template");
            let expectedMetadata: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: from + "/template/test.txt",
                destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                relativePath: "test.txt"
            };
            
            let readVfsInstances = await globFactory.ReadFiles(files);
            readVfsInstances.map(readVFS => {
                VirtualFileSystemInstance.match(readVFS, {
                    File: (file: FileSystemInstance) => {
                        file.content.should.deep.equal(FileContent.String("test"));
                        file.metadata.should.deep.equal(expectedMetadata),
                        file.ignore.should.deep.equal(templateIgnore)
                    },
                    default: () => "1".should.equal("2")
                })
            })
		});
	});
});