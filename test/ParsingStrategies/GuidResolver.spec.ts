import {
    CyanSafe,
    FileContent,
    IFileSystemInstanceMetadata,
    Ignore,
    IGuidGenerator,
    VirtualFileSystemInstance,
} from "../../src/classLibrary/interfaces/interfaces";
import { Core, Kore, SortType } from "@kirinnee/core";
import { GuidResolver } from "../../src/classLibrary/ParsingStrategies/GuidResolver";
import _ from 'lodash';
import { Utility } from '../../src/classLibrary/Utility/Utility';

let core: Core = new Kore();
core.ExtendPrimitives();


class MockGuidGenerator implements IGuidGenerator {

    GenerateGuid(): string {
        return "this-is-a-guid";
    }

}

const guidGenerator: MockGuidGenerator = new MockGuidGenerator();
const util: Utility = new Utility(core);
const guidResolver: GuidResolver = new GuidResolver(guidGenerator, util);
const guids: string[] = ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", "bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1"];

const testCyanSafe: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: {},
    globs: [],
    guid: guids,
    pluginData: {},
    plugins: {},
    syntax: [["~", "~"]],
    variable: {},
};

const templateIgnore: Ignore = {
    custom: {},
    guidResolver: {},
    ifElseResolver: {},
    inlineResolver: {},
    variableResolver: {},
}

const partialParseAll: Partial<Ignore> = {
    guidResolver: {
        content: true,
        metadata: true,
    }
}
const partialParseMetadata: Partial<Ignore> = {
    guidResolver: {
        content: false,
        metadata: true,
    }
}

const partialParseContent: Partial<Ignore> = {
    guidResolver: {
        content: true,
        metadata: false,
    }
}

const partialParseNothing: Partial<Ignore> = {
    guidResolver: {
        content: false,
        metadata: false,
    }
}

const parseAll: Ignore = _.defaultsDeep(partialParseAll, templateIgnore)
const parseMetadata: Ignore = _.defaultsDeep(partialParseMetadata, templateIgnore)
const parseContent: Ignore = _.defaultsDeep(partialParseContent, templateIgnore)
const parseNothing: Ignore = _.defaultsDeep(partialParseNothing, templateIgnore)


describe("GuidResolver", () => {
    describe("Count", () => {
        it("should count the number of occurrences of each guid correctly", () => {
            let path1: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let content1: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675";
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1),
                ignore: parseAll,
            });

            let path2: string = "root/bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let content2: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675";
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2),
                ignore: parseAll,
            });

            let path3: string = "root/bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("nothing"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", 3],
                ["bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1", 4]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = guidResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            expect(actual).toStrictEqual(expected);
        });


        it("should not count guid for files marked to be not parsed", () => {
            let content1: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675";
            let content2: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675";

            let path1: string = "root/var/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1),
                ignore: parseMetadata,
            });

            let path2: string = "root/var/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2),
                ignore: parseAll,
            });

            let path3: string = "root/var/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String(content1),
                ignore: parseContent,
            });

            let path4: string = "root/var/bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1";
            let fileMeta4: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path4,
                destinationAbsolutePath: path4,
                relativePath: path4,
            }
            let file4 = VirtualFileSystemInstance.File({
                metadata: fileMeta4,
                content: FileContent.String(content2),
                ignore: parseNothing,
            });

            let path5: string = "root/var/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let folderMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path5,
                destinationAbsolutePath: path5,
                relativePath: path5,
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata
            });

            let path6: string = "root/var/bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1";
            let folderMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path6,
                destinationAbsolutePath: path6,
                relativePath: path6,
            }
            let folder2 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta2,
                ignore: parseContent,
            });

            let testSubject = [file1, file2, file3, file4, folder1, folder2];

            let expected: [string, number][] = ([
                ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", 5],
                ["bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = guidResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            expect(actual).toStrictEqual(expected);
        });
    });

    describe("ResolveFiles", () => {
        it("should return the same file destination", () => {
            let content1: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675";
            let content2: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675";

            let path1: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1),
                ignore: parseAll,
            });

            let path2: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2),
                ignore: parseAll,
            });

            let path3: string = "root/bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String(content2),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String(content2),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = guidResolver.ResolveFiles(testCyanSafe, testSubjects);
            expect(actual).toStrictEqual(expected);
        });
    });

    describe("ResolveContents", () => {
        it("should replace the content guid to the correct value", () => {
            let content1: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675\n";
            let content2: string = "lol\n" +
                "4093F5BC-BB3D-4de7-B1D2-7220E66A0675\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n";


            let path1: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1),
                ignore: parseAll,
            });

            let path2: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2),
                ignore: parseAll,
            });

            let path3: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("nothing"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let content1Expected: string = "this-is-a-guid\n" +
                "lol\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675\n";
            let content2Expected: string = "lol\n" +
                "4093F5BC-BB3D-4de7-B1D2-7220E66A0675\n" +
                "this-is-a-guid\n";

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1Expected),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2Expected),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("nothing"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = guidResolver.ResolveContents(testCyanSafe, testSubjects);
            expect(actual).toStrictEqual(expected);
        });

        it("should not replace content guid for files that should not be parsed", () => {
            let content1: string = "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675\n";
            let content2: string = "lol\n" +
                "4093F5BC-BB3D-4de7-B1D2-7220E66A0675\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n";

            let path1: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1),
                ignore: parseAll,
            });

            let path2: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2),
                ignore: parseContent,
            });

            let path3: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String(content2),
                ignore: parseNothing,
            });

            let path5: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let folderMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path5,
                destinationAbsolutePath: path5,
                relativePath: path5,
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata,
            });

            let path6: string = "root/6de0a74e-70a9-4cfc-be14-04789ecd44fa";
            let folderMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path6,
                destinationAbsolutePath: path6,
                relativePath: path6,
            }
            let folder2 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta2,
                ignore: parseNothing,
            });

            let testSubjects = [file1, file2, file3, folder1, folder2];

            let content1Expected: string = "this-is-a-guid\n" +
                "lol\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675\n";
            let content2Expected: string = "lol\n" +
                "4093F5BC-BB3D-4de7-B1D2-7220E66A0675\n" +
                "this-is-a-guid\n";

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content1Expected),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content2Expected),
                ignore: parseContent,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String(content2),
                ignore: parseNothing,
            });

            let folder1Expected = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata,
            });

            let folder2Expected = VirtualFileSystemInstance.Folder({
                metadata: folderMeta2,
                ignore: parseNothing,
            });

            let expected = [file1Expected, file2Expected, file3Expected, folder1Expected, folder2Expected];

            let actual = guidResolver.ResolveContents(testCyanSafe, testSubjects);
            expect(actual).toStrictEqual(expected);
        });
    });

    describe("ReplaceGuid", () => {
        it("should replace both upper and lower case occurence of the guid", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel"
            }
            let file1: VirtualFileSystemInstance = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                    "lol\n" +
                    "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                    "4093f5bc-bb3d-4de7-b1d2-7220e66a0675"),
                ignore: parseAll
            });

            let guidArr: Map<string, string> = new Map([
                ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", "guid1"],
                ["bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1", "guid2"]
            ]);

            let expected: VirtualFileSystemInstance = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("guid1\n" +
                    "lol\n" +
                    "guid2\n" +
                    "4093f5bc-bb3d-4de7-b1d2-7220e66a0675"),
                ignore: parseAll
            });

            guidResolver.ReplaceGuid(guidArr, file1);
            expect(file1).toStrictEqual(expected);
        });
    });
});
