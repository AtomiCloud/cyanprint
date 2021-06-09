import { should } from 'chai';
import {
    CyanSafe,
    FileContent,
    IFileSystemInstanceMetadata,
    Ignore,
    VirtualFileSystemInstance
} from "../../src/classLibrary/interfaces/interfaces";
import { Core, Kore, SortType } from "@kirinnee/core";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import { IfElseResolver } from "../../src/classLibrary/ParsingStrategies/IfElseResolver";
import _ from "lodash";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

const utility: Utility = new Utility(core);
const ifElseResolver: IfElseResolver = new IfElseResolver(utility);
const flags: object = {
    a: "true",
    b: {
        c: "true",
        d: {
            e: "false",
            f: "false"
        }
    },
    g: "true"
};

const testCyanSafe: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: flags,
    globs: [],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~", "~"]],
    variable: {},
};

const testCyanSafeMultiSyntax: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: flags,
    globs: [],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~", "~"], ["{", "}"], ["#", "#"]],
    variable: {},
}

const testCyanSafeWithMultiCharacterSyntax: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: flags,
    globs: [],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~~", "}}"], ["##", "}"], ["{{", "#"], ["{~", "~}"], [">{", "}<"], ["${", "}$"], ["`{", "}`"]],
    variable: {},
}

const templateIgnore: Ignore = {
    custom: {},
    guidResolver: {},
    ifElseResolver: {},
    inlineResolver: {},
    variableResolver: {},
}

const partialParseAll: Partial<Ignore> = {
    ifElseResolver: {
        content: true,
        metadata: true,
    }
}
const partialParseMetadata: Partial<Ignore> = {
    ifElseResolver: {
        content: false,
        metadata: true,
    }
}

const partialParseContent: Partial<Ignore> = {
    ifElseResolver: {
        content: true,
        metadata: false,
    }
}

const partialParseNothing: Partial<Ignore> = {
    ifElseResolver: {
        content: false,
        metadata: false,
    }
}

const parseAll: Ignore = _.defaultsDeep(partialParseAll, templateIgnore)
const parseMetadata: Ignore = _.defaultsDeep(partialParseMetadata, templateIgnore)
const parseContent: Ignore = _.defaultsDeep(partialParseContent, templateIgnore)
const parseNothing: Ignore = _.defaultsDeep(partialParseNothing, templateIgnore)


describe("IfElseResolver", () => {
    describe("Count", () => {
        it("should count the number of occurrences of each ifend correctly", () => {
            let path1: string = "root/file1/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }

            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nthe color is:\nif~a~\nred\nend~a~\nif~b.c~\nblue\nend~b.c~"),
                ignore: parseAll,
            });

            let path2: string = "root/file2";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif~b.d.e~\n help me!\nend~b.d.e~\nif~b.c~\n are blue\nend~b.c~\nif~g~\n are black!!\nend~g~"),
                ignore: parseAll,
            });

            let path3: string = "root/file3";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif~b.d.f~\n are red\nend~b.d.f~\nif~b.c~\n are blue\nend~b.c~\nif~g~\n are black!!\nend~g~"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each inverse ifend correctly", () => {
            let path1: string = "root/file1/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }

            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nthe color is:\nif!~a~\nred\nend!~a~\nif!~b.c~\nblue\nend!~b.c~"),
                ignore: parseAll,
            });

            let path2: string = "root/file2";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!~b.d.e~\n help me!\nend!~b.d.e~\nif!~b.c~\n are blue\nend!~b.c~\nif!~g~\n are black!!\nend!~g~"),
                ignore: parseAll,
            });

            let path3: string = "root/file3";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif!~b.d.f~\n are red\nend!~b.d.f~\nif!~b.c~\n are blue\nend!~b.c~\nif!~g~\n are black!!\nend!~g~"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of a each ifend and inverse ifend correctly", () => {
            let path1: string = "root/file1/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }

            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nthe color is:\nif!~a~\nred\nend!~a~\nif~b.c~\nblue\nend~b.c~"),
                ignore: parseAll,
            });

            let path2: string = "root/file2";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!~b.d.e~\n help me!\nend!~b.d.e~\nif~b.c~\n are blue\nend~b.c~\nif~g~\n are black!!\nend~g~"),
                ignore: parseAll,
            });

            let path3: string = "root/file3";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif~b.d.f~\n are red\nend~b.d.f~\nif~b.c~\n are blue\nend~b.c~\nif!~g~\n are black!!\nend!~g~"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each ifend for all different syntaxes", () => {
            let path1: string = "root/whatever/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~a~\n are red\nend~a~\nif~b.c~ are blue\nend~b.c~"),
                ignore: parseAll,
            });

            let path2: string = "root/something";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif~b.d.e~\n help me!\nend~b.d.e~\nif#b.c# \nare blue\nend#b.c#\nif{g}\n are black!!\nend{g}"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif#b.d.f#\n are red\nend#b.d.f#\nif#b.c# are blue\nend#b.c#\nif#g#\n are black!!\nend#g#"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafeMultiSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each inverse ifend for all different syntaxes", () => {
            let path1: string = "root/whatever/if!~a~/end!~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif!~a~\n are red\nend!~a~\nif!~b.c~ are blue\nend!~b.c~"),
                ignore: parseAll,
            });

            let path2: string = "root/something";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!~b.d.e~\n help me!\nend!~b.d.e~\nif!#b.c# \nare blue\nend!#b.c#\nif!{g}\n are black!!\nend!{g}"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif!#b.d.f#\n are red\nend!#b.d.f#\nif!#b.c# are blue\nend!#b.c#\nif!#g#\n are black!!\nend!#g#"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafeMultiSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each ifend and inverse ifend for all different syntaxes", () => {
            let path1: string = "root/whatever/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~a~\n are red\nend~a~\nif!~b.c~ are blue\nend!~b.c~"),
                ignore: parseAll,
            });

            let path2: string = "root/something";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif~b.d.e~\n help me!\nend~b.d.e~\nif!#b.c# \nare blue\nend!#b.c#\nif{g}\n are black!!\nend{g}"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif!#b.d.f#\n are red\nend!#b.d.f#\nif#b.c# are blue\nend#b.c#\nif!#g#\n are black!!\nend!#g#"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafeMultiSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each ifend for multi character syntaxes", () => {
            let path1: string = "root/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif{{b.c#\n are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let path2: string = "root/";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif##b.d.e}\n help me!\nend##b.d.e}\nif{{b.c#\n are blue\nend{{b.c#\nif${g}$\n are black!!\nend${g}$"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif`{b.d.f}`n are red\nend`{b.d.f}`\nif{{b.c#\n are blue\nend{{b.c#\nif{~g~}\n are black!!\nend{~g~}"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each inverse ifend for multi character syntaxes", () => {
            let path1: string = "root/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif!~~a}}\n are red\nend!~~a}}\nif!{{b.c#\n are blue\nend!{{b.c#"),
                ignore: parseAll,
            });

            let path2: string = "root/";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!##b.d.e}\n help me!\nend!##b.d.e}\nif!{{b.c#\n are blue\nend!{{b.c#\nif!${g}$\n are black!!\nend!${g}$"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif!`{b.d.f}`n are red\nend!`{b.d.f}`\nif!{{b.c#\n are blue\nend!{{b.c#\nif!{~g~}\n are black!!\nend!{~g~}"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each ifend and inverse ifend for multi character syntaxes", () => {
            let path1: string = "root/if~a~/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif!{{b.c#\n are blue\nend!{{b.c#"),
                ignore: parseAll,
            });

            let path2: string = "root/";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!##b.d.e}\n help me!\nend!##b.d.e}\nif{{b.c#\n are blue\nend{{b.c#\nif!${g}$\n are black!!\nend!${g}$"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif`{b.d.f}`n are red\nend`{b.d.f}`\nif!{{b.c#\n are blue\nend!{{b.c#\nif{~g~}\n are black!!\nend{~g~}"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should not count flags for files marked to be not parsed, ignoring the file metadata", () => {
            let path1: string = "root/if~~a}}/a.a/end~~a}}";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif!{{b.c#\n are blue\nend!{{b.c#"),
                ignore: parseMetadata,
            });

            let path2: string = "root/";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!##b.d.e}\n help me!\nend!##b.d.e}\nif{{b.c#\n are blue\nend{{b.c#\nif${g}$\n are black!!\nend${g}$"),
                ignore: parseAll,
            });

            let path3: string = "root/var/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif~~b.d.f}}\n are red\nend~~b.d.f}}\nif{{b.c#\n are blue\nend{{b.c#\nif!{~g~}\n are black!!\nend!{~g~}"),
                ignore: parseContent,
            });

            let path4: string = "root/var/";
            let fileMeta4: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path4,
                destinationAbsolutePath: path4,
                relativePath: path4,
            }
            let file4 = VirtualFileSystemInstance.File({
                metadata: fileMeta4,
                content: FileContent.String("line2\nif!~b.d.f}\n are red\nend!~b.d.f}\nif{b.c#\n are blue\nend{b.c#\nif{~g~}\n are black!!\nend{~g~}"),
                ignore: parseNothing,
            });

            let path5: string = "root/var/folder1";
            let folderMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path5,
                destinationAbsolutePath: path5,
                relativePath: path5,
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata
            });

            let path6: string = "root/var/folder2";
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
                ["a", 0],
                ["b.c", 2],
                ["b.d.e", 1],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = ifElseResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });
    });

    describe("ResolveFiles", () => {
        it("should return the file destination exactly", () => {
            let path1: string = "root/if~a~/a.a/end~a~";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif{{b.c#\n are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let path2: string = "root/if~b.c~/end~b.c~/if~g~/file/end~g~";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif{{b.c#\n are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let path3: string = "root/if~b.d.e~/if~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif{{b.c#\n are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];
            
            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/if~a~/a.a/end~a~",
                destinationAbsolutePath: "root/if~a~/a.a/end~a~",
                relativePath: "root/if~a~/a.a/end~a~",
            }
            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1Expected,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif{{b.c#\n are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/if~b.c~/end~b.c~/if~g~/file/end~g~",
                destinationAbsolutePath: "root/if~b.c~/end~b.c~/if~g~/file/end~g~",
                relativePath: "root/if~b.c~/end~b.c~/if~g~/file/end~g~",
            }
            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2Expected,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif{{b.c#\n are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let fileMeta3Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/if~b.d.e~/if~g~",
                destinationAbsolutePath: "root/if~b.d.e~/if~g~",
                relativePath: "root/if~b.d.e~/if~g~",
            }
            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3Expected,
                content: FileContent.String("line1\nif~~a}}\n are red\nend~~a}}\nif{{b.c#\n are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = ifElseResolver.ResolveFiles(testCyanSafe, testSubjects);
            actual.should.deep.equal(expected)
        });
    });

    describe("ResolveContents", () => {
    
		it("should replace the content within ifend and inverse ifend to the correct value", () => {
			let path1: string = "root/";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~b.c~\nRoses are red\nend~b.c~\nif!~b.c~\nViolets are blue\nend!~b.c~"),
                ignore: parseAll,
            });

            let path2: string = "root/";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif~b.d.e~\nhelp me!\nend~b.d.e~\nif~b.c~\nViolets are blue\nend~b.c~\nif~g~\nOreos are black!!\nend~g~"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif!~b.d.f~\nRoses are red\nend!~b.d.f~\nif~b.c~\nViolets are blue\nend~b.c~\nif!~g~\nOreos are black!!\nend!~g~"),
                ignore: parseAll,
            });

			let testSubjects = [file1, file2, file3];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nRoses are red"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nRoses are red\nViolets are blue"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = ifElseResolver.ResolveContents(testCyanSafe, testSubjects);
            actual.should.deep.equal(expected)
        });
       
        it("should replace the content within ifend and inverse ifend with multi syntax correctly", () => {
            let path1: string = "root/";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~b.c~\nRoses are red\nend~b.c~\nif!{b.c}\nViolets are blue\nend!{b.c}"),
                ignore: parseAll,
            });

            let path2: string = "root/";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!#b.d.e#\nHelp me!\nend!#b.d.e#\nif{b.c}\nViolets are blue\nend{b.c}\nif~g~\nOreos are black!!\nend~g~"),
                ignore: parseAll,
            });

            let path3: string = "root/";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif{b.d.f}\nRoses are red\nend{b.d.f}\nif!#b.c#\nViolets are blue\nend!#b.c#\nif#g#\nOreos are black!!\nend#g#"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nRoses are red"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nHelp me!\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = ifElseResolver.ResolveContents(testCyanSafeMultiSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

         
        it("should replace the content within ifend and inverse ifend with multi character syntax correctly", () => {
            let path1: string = "root/var";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif`{b.c}`\nRoses are red\nend`{b.c}`\nif!##b.c}\nViolets are blue\nend!##b.c}"),
                ignore: parseAll,
            });

            let path2: string = "root/var";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif{{b.d.e#\nhelp me!\nend{{b.d.e#\nif!{~b.c~}\nViolets are blue\nend!{~b.c~}\nif${g}$\nOreos are black!!\nend${g}$"),
                ignore: parseAll,
            });

            let path3: string = "root/var";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif!~~b.d.f}}\nRoses are red\nend!~~b.d.f}}\nif##b.c}\nViolets are blue\nend##b.c}\nif{{g#\nOreos are black!!\nend{{g#"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nRoses are red"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nOreos are black!!"),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nRoses are red\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = ifElseResolver.ResolveContents(testCyanSafeWithMultiCharacterSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should not replace content flags for files that should not be parsed", () => {
            let path1: string = "root/if~~a}}/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nif~~a}}\nRoses are red\nend~~a}}\nif{{b.c#\nViolets are blue\nend{{b.c#"),
                ignore: parseAll,
            });

            let path2: string = "root/if{{b.c#/if{~g~}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!##b.d.e}\n help me!\nend!##b.d.e}\nif{{b.c#\nViolets are blue\nend{{b.c#\nif${g}$\nOreos are black!!\nend${g}$"),
                ignore: parseMetadata,
            });

            let path3: string = "root/if~b.d.e~/if~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif~~b.d.f}}\nRoses are red\nend~~b.d.f}}\nif!{{b.c#\nViolets are blue\nend!{{b.c#\nif{~g~}\nOreos are black!!\nend{~g~}"),
                ignore: parseMetadata,
            });

            let path5: string = "root/if{{b.d.e#/if##a}";
            let folderMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path5,
                destinationAbsolutePath: path5,
                relativePath: path5,
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata,
            });

            let path6: string = "root/if{{b.d.f#/if##a}/if{~b.d.g~}";
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

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nRoses are red\nViolets are blue"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif!##b.d.e}\n help me!\nend!##b.d.e}\nif{{b.c#\nViolets are blue\nend{{b.c#\nif${g}$\nOreos are black!!\nend${g}$"),
                ignore: parseMetadata,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nif~~b.d.f}}\nRoses are red\nend~~b.d.f}}\nif!{{b.c#\nViolets are blue\nend!{{b.c#\nif{~g~}\nOreos are black!!\nend{~g~}"),
                ignore: parseMetadata,
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

            let actual = ifElseResolver.ResolveContents(testCyanSafeWithMultiCharacterSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });
    });

    describe("ModifyFlagsWithAllIfSyntax", () => {
        it("should pad flags with all if and its inverted syntax terms", () => {
            ifElseResolver.ModifyIfWithAllSyntax("hello", testCyanSafe.syntax).should.deep.equal([
                "if~hello~"
            ]);
        });
    });

    describe("ModifyFlagsWithAllInverseIfSyntax", () => {
        it("should pad flags with all if and its inverted syntax terms", () => {
            ifElseResolver.ModifyInverseIfWithAllSyntax("hello", testCyanSafe.syntax).should.deep.equal([
                "if!~hello~"
            ]);
        });
    });

    describe("RetrieveLineIndexContainingSyntax", () => {
        it("should retrieve all the line numbers with the syntax", () => {
            ifElseResolver.RetrieveLineIndexContainingSyntax("if~~b.d.f}}\nRoses are red\nend~~b.d.f}}\nif!{{b.c#\nViolets are blue\nend!{{b.c#\nif~~b.d.f}}\nOreos are black!!\nend~~b.d.f}}", "if~~b.d.f}}").should.deep.equal([
                0, 6
            ])
        });
    });
});

