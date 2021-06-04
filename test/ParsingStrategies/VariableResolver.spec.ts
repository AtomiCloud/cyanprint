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
import { VariableResolver } from "../../src/classLibrary/ParsingStrategies/VariableResolver";
import _ from "lodash";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

const utility: Utility = new Utility(core);
const variableResolver: VariableResolver = new VariableResolver(utility);
const variables: object = {
    a: "Roses",
    b: {
        c: "Violets",
        d: {
            e: "please",
            f: "Apples"
        }
    },
    g: "Oreos"
};

const testCyanSafe: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: {},
    globs: [],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~", "~"]],
    variable: variables,
};

const testCyanSafeMultiSyntax: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: {},
    globs: [],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~", "~"], ["{", "}"], ["#", "#"]],
    variable: variables,
}

const testCyanSafeWithMultiCharacterSyntax: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: {},
    globs: [],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~~", "}}"], ["##", "}"], ["{{", "#"], ["{~", "~}"], [">{", "}<"], ["${", "}$"], ["`{", "}`"]],
    variable: variables,
}

const templateIgnore: Ignore = {
    custom: {},
    guidResolver: {},
    ifElseResolver: {},
    inlineResolver: {},
    variableResolver: {},
}

const partialParseAll: Partial<Ignore> = {
    variableResolver: {
        content: true,
        metadata: true,
    }
}
const partialParseMetadata: Partial<Ignore> = {
    variableResolver: {
        content: false,
        metadata: true,
    }
}

const partialParseContent: Partial<Ignore> = {
    variableResolver: {
        content: true,
        metadata: false,
    }
}

const partialParseNothing: Partial<Ignore> = {
    variableResolver: {
        content: false,
        metadata: false,
    }
}

const parseAll: Ignore = _.defaultsDeep(partialParseAll, templateIgnore)
const parseMetadata: Ignore = _.defaultsDeep(partialParseMetadata, templateIgnore)
const parseContent: Ignore = _.defaultsDeep(partialParseContent, templateIgnore)
const parseNothing: Ignore = _.defaultsDeep(partialParseNothing, templateIgnore)


describe("VariableResolver", () => {
    describe("Count", () => {
        it("should count the number of occurrences of each variable correctly", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c~ are red\nvar~b.c~ are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var~b.c~/var~g~";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"),
                ignore: parseAll,
            });

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 5],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 4]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = variableResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each variable for all different syntaxes", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c~ are red\nvar~b.c~ are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var{b.c}/var#g#";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar~b.d.e~ help me!\nvar#b.c# are blue\nvar{g} are black!!"),
                ignore: parseAll,
            });

            let path3: string = "root/var{b.d.e}/var{g}";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar#b.d.f# are red\nvar#b.c# are blue\nvar#g# are black!!"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 5],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 4]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = variableResolver.Count(testCyanSafeMultiSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each variable for multi character syntaxes", () => {
            let path1: string = "root/var~~a}}/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~~b.c}} are red\nvar{{b.c# are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var{~b.c~}/var##g}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar##b.d.e} help me!\nvar{{b.c# are blue\nvar${g}$ are black!!"),
                ignore: parseAll,
            });

            let path3: string = "root/var{{b.d.e#/var>{g}<";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar`{b.d.f}` are red\nvar{{b.c# are blue\nvar{~g~} are black!!"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 5],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 4]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = variableResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should not count variables for files marked to be not parsed", () => {
            let path1: string = "root/var~~a}}/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~~b.c}} are red\nvar{{b.c# are blue"),
                ignore: parseMetadata,
            });

            let path2: string = "root/var{~b.c~}/var##g}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar##b.d.e} help me!\nvar{{b.c# are blue\nvar${g}$ are black!!"),
                ignore: parseAll,
            });

            let path3: string = "root/var{{b.d.e#/var##g}";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~~b.d.f}} are red\nvar{{b.c# are blue\nvar{~g~} are black!!"),
                ignore: parseContent,
            });

            let path4: string = "root/var{{b.d.e#/var##a}";
            let fileMeta4: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path4,
                destinationAbsolutePath: path4,
                relativePath: path4,
            }
            let file4 = VirtualFileSystemInstance.File({
                metadata: fileMeta4,
                content: FileContent.String("line2\nvar~b.d.f} are red\nvar{b.c# are blue\nvar{~g~} are black!!"),
                ignore: parseNothing,
            });

            let path5: string = "root/var{{b.d.e#/var##a}";
            let folderMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path5,
                destinationAbsolutePath: path5,
                relativePath: path5,
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata
            });

            let path6: string = "root/var{{b.d.f#/var##a}/var{~b.d.g~}";
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
                ["a", 2],
                ["b.c", 3],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 3]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = variableResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });
    });

    describe("ResolveFiles", () => {
        it("should rename the file destination to the correct name", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var~b.c~/var~g~";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~a~/a.a",
                destinationAbsolutePath: "root/Roses/a.a",
                relativePath: "root/var~a~/a.a",
            }
            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~b.c~/var~g~",
                destinationAbsolutePath: "root/Violets/Oreos",
                relativePath: "root/var~b.c~/var~g~",
            }
            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let fileMeta3Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~b.d.e~/var~g~",
                destinationAbsolutePath: "root/please/Oreos",
                relativePath: "root/var~b.d.e~/var~g~",
            }
            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = variableResolver.ResolveFiles(testCyanSafe, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should rename the file destinations with multi-syntax correctly", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var{b.c}/var{g}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let path3: string = "root/var#b.d.e#/var#g#";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~a~/a.a",
                destinationAbsolutePath: "root/Roses/a.a",
                relativePath: "root/var~a~/a.a",
            }
            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var{b.c}/var{g}",
                destinationAbsolutePath: "root/Violets/Oreos",
                relativePath: "root/var{b.c}/var{g}",
            }
            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let fileMeta3Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var#b.d.e#/var#g#",
                destinationAbsolutePath: "root/please/Oreos",
                relativePath: "root/var#b.d.e#/var#g#",
            }
            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = variableResolver.ResolveFiles(testCyanSafeMultiSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should rename the file destinations with multi-character syntax correctly", () => {
            let path1: string = "root/var~~a}}/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var##b.c}/var${g}$";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let path3: string = "root/var{{b.d.e#/var{~g~}";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~~a}}/a.a",
                destinationAbsolutePath: "root/Roses/a.a",
                relativePath: "root/var~~a}}/a.a",
            }
            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var##b.c}/var${g}$",
                destinationAbsolutePath: "root/Violets/Oreos",
                relativePath: "root/var##b.c}/var${g}$",
            }
            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let fileMeta3Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var{{b.d.e#/var{~g~}",
                destinationAbsolutePath: "root/please/Oreos",
                relativePath: "root/var{{b.d.e#/var{~g~}",
            }
            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = variableResolver.ResolveFiles(testCyanSafeWithMultiCharacterSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should not rename file destinations for files indicated as false parse", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseContent,
            });

            let path2: string = "root/var{b.c}/var{g}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let path3: string = "root/var#b.d.e#/var#g#";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseContent,
            });

            let path5: string = "root/var{b.d.e}/var#a#";
            let folderMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path5,
                destinationAbsolutePath: path5,
                relativePath: path5,
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseAll,
            });

            let path6: string = "root/var{b.d.f}/var~a/~var{b.d.g}";
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

            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~a~/a.a",
                destinationAbsolutePath: "root/var~a~/a.a",
                relativePath: "root/var~a~/a.a",
            }
            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseContent,
            });

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var{b.c}/var{g}",
                destinationAbsolutePath: "root/Violets/Oreos",
                relativePath: "root/var{b.c}/var{g}",
            }
            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseAll,
            });

            let fileMeta3Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var#b.d.e#/var#g#",
                destinationAbsolutePath: "root/var#b.d.e#/var#g#",
                relativePath: "root/var#b.d.e#/var#g#",
            }
            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3Expected,
                content: FileContent.String("line1\nvar~b.c} are red\nvar{b.c# are blue"),
                ignore: parseContent,
            });

            let folderMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var{b.d.e}/var#a#",
                destinationAbsolutePath: "root/please/Roses",
                relativePath: "root/var{b.d.e}/var#a#",
            }
            let folder1Expected = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1Expected,
                ignore: parseAll,
            });

            let folderMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var{b.d.f}/var~a/~var{b.d.g}",
                destinationAbsolutePath: "root/var{b.d.f}/var~a/~var{b.d.g}",
                relativePath: "root/var{b.d.f}/var~a/~var{b.d.g}",
            }
            let folder2Expected = VirtualFileSystemInstance.Folder({
                metadata: folderMeta2Expected,
                ignore: parseNothing,
            });

            let expected = [file1Expected, file2Expected, file3Expected, folder1Expected, folder2Expected];

            let actual = variableResolver.ResolveFiles(testCyanSafeMultiSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });
    });

    describe("ResolveContents", () => {
		it("should replace the content variable to the correct value", () => {
			let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c~ are red\nvar~b.c~ are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var~b.c~/var~g~";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"),
                ignore: parseAll,
            });

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"),
                ignore: parseAll,
            });

			let testSubjects = [file1, file2, file3];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nViolets are red\nViolets are blue"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nplease help me!\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nApples are red\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = variableResolver.ResolveContents(testCyanSafe, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should replace the content variable with muilti syntax correctly", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c~ are red\nvar{b.c} are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var{b.c}/var#g#";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar#b.d.e# help me!\nvar{b.c} are blue\nvar~g~ are black!!"),
                ignore: parseAll,
            });

            let path3: string = "root/var~b.d.e~/var{g}";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar{b.d.f} are red\nvar#b.c# are blue\nvar#g# are black!!"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nViolets are red\nViolets are blue"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nplease help me!\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nApples are red\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = variableResolver.ResolveContents(testCyanSafeMultiSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should replace the content variable with multi character syntax correctly", () => {
            let path1: string = "root/var~~a}}/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar`{b.c}` are red\nvar##b.c} are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var{{b.c#/var{~g~}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar{{b.d.e# help me!\nvar{~b.c~} are blue\nvar${g}$ are black!!"),
                ignore: parseAll,
            });

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~~b.d.f}} are red\nvar##b.c} are blue\nvar{{g# are black!!"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nViolets are red\nViolets are blue"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nplease help me!\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nApples are red\nViolets are blue\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected, file3Expected];

            let actual = variableResolver.ResolveContents(testCyanSafeWithMultiCharacterSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should not replace content variables for files that should not be parsed", () => {
            let path1: string = "root/var~~a}}/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~~b.c}} are red\nvar##b.c} are blue"),
                ignore: parseAll,
            });

            let path2: string = "root/var{{b.c#/var{~g~}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar{{b.d.e# help me!\nvar{~b.c~} are blue\nvar${g}$ are black!!"),
                ignore: parseMetadata,
            });

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~~b.d.f}} are red\nvar##b.c} are blue\nvar{{g# are black!!"),
                ignore: parseMetadata,
            });

            let path5: string = "root/var{{b.d.e#/var##a}";
            let folderMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path5,
                destinationAbsolutePath: path5,
                relativePath: path5,
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata,
            });

            let path6: string = "root/var{{b.d.f#/var##a}/var{~b.d.g~}";
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
                content: FileContent.String("line1\nViolets are red\nViolets are blue"),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar{{b.d.e# help me!\nvar{~b.c~} are blue\nvar${g}$ are black!!"),
                ignore: parseMetadata,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~~b.d.f}} are red\nvar##b.c} are blue\nvar{{g# are black!!"),
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

            let actual = variableResolver.ResolveContents(testCyanSafeWithMultiCharacterSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });
    });

    describe("ModifyVariablesWithAllSyntax", () => {
        it("should pad variables with all open and close syntax terms", () => {
            variableResolver.ModifyVariablesWithAllSyntax("package.name", testCyanSafe.syntax).should.deep.equal(["var~package.name~"]);
        });
    });
});
