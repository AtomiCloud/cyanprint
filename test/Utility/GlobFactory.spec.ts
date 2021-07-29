import { Kore } from "@kirinnee/core";
import { should } from "chai";
import { FileFactory } from "../../src/classLibrary/Utility/FileFactory";
import { GlobFactory } from "../../src/classLibrary/Utility/GlobFactory";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import path from "path";
import { FileContent, FileSystemInstance, Glob, IFileFactory, IGlobFactory, Ignore, VirtualFileSystemInstance } from "../../src/classLibrary/interfaces/interfaces";

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
	describe("GenerateFilesMetadata", () => {
		it("should return the filesystem instance metadata with correct filepaths", () => {
            let glob: Glob = {
                root: "./template",
                pattern: "**/*.*",
                ignore: "",
                skip: templateIgnore
            }
            let metadatas = globFactory.GenerateFilesMetadata(glob, "./template");
            let expected = [
                {
                    sourceAbsolutePath: from + "/template/test.txt",
                    destinationAbsolutePath: path.resolve(__dirname, folderName) + "/template/test.txt",
                    relativePath: "test.txt"
                }
            ];
            metadatas.should.deep.equal(expected);
        })
    });

    describe("ReadFiles", () => {
		it("should return the VFS instances with correct content and paths", async () => {
            let glob: Glob = {
                root: "./template",
                pattern: "**/*.*",
                ignore: "",
                skip: templateIgnore
            }
            let metadatas = globFactory.GenerateFilesMetadata(glob, "./template");
            let vfsInstances = metadatas.map(metadata => {
                let file: FileSystemInstance = {
                    metadata: metadata,
                    content: FileContent.String(""),
                    ignore: templateIgnore
                } 
                return VirtualFileSystemInstance.File(file);
            });
            
            let readVfsInstances = await globFactory.ReadFiles(vfsInstances);
            readVfsInstances.map(readVFS => {
                VirtualFileSystemInstance.match(readVFS, {
                    File: (file: FileSystemInstance) => {
                        file.content.should.deep.equal(FileContent.String("test"));
                        file.metadata.should.deep.equal(metadatas[0]),
                        file.ignore.should.deep.equal(templateIgnore)
                    },
                    default: () => "1".should.equal("2")
                })
            })
		});
	});
});