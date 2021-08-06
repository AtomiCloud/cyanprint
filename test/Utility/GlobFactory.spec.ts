import { Core, Kore } from "@kirinnee/core";
import { FileFactory } from "../../src/classLibrary/Utility/FileFactory";
import { GlobFactory } from "../../src/classLibrary/Utility/GlobFactory";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import path from "path";
import {
    FileContent,
    FileSystemInstance,
    GlobSafe,
    IFileFactory,
    IFileSystemInstanceMetadata,
    IGlobFactory,
    Ignore,
    VirtualFileSystemInstance
} from "../../src/classLibrary/interfaces/interfaces";

let core: Core = new Kore();
core.ExtendPrimitives();
let util: Utility = new Utility(core);
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
                sourceAbsolutePath: path.resolve(from, "template", "test.txt"),
                destinationAbsolutePath: path.resolve(__dirname, folderName, "template", "test.txt"),
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
            expect(files).toStrictEqual(expected);
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
                sourceAbsolutePath: path.resolve(from, "template", "test.txt"),
                destinationAbsolutePath: path.resolve(__dirname, folderName, "template", "test.txt"),
                relativePath: "test.txt"
            };
            
            let readVfsInstances = await globFactory.ReadFiles(files);
            readVfsInstances.map(readVFS => {
                VirtualFileSystemInstance.match(readVFS, {
                    File: (file: FileSystemInstance) => {
                        expect(file.content).toStrictEqual(FileContent.String("test"));
                        expect(file.metadata).toStrictEqual(expectedMetadata);
                        expect(file.ignore).toStrictEqual(templateIgnore);
                    },
                    default: () => expect("1").toStrictEqual("2")
                })
            })
		});
	});
});
