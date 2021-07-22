import { should } from 'chai';
import {
    CyanFlag,
    CyanSafe,
    FileContent,
    IFileSystemInstanceMetadata,
    Ignore,
    VirtualFileSystemInstance
} from "../../src/classLibrary/interfaces/interfaces";
import { Core, Kore, SortType } from "@kirinnee/core";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import { InlineFlagResolver } from "../../src/classLibrary/ParsingStrategies/InlineFlagResolver";
import _ from "lodash";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

const utility: Utility = new Utility(core);
const inlineFlagResolver: InlineFlagResolver = new InlineFlagResolver(utility);
const flags: CyanFlag = {
    a: true,
    b: {
        c: true,
        d: {
            e: false,
            f: false
        }
    },
    g: true
};

const testCyanSafe: CyanSafe = {
    comments: ["//"],
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
    comments: ["//"],
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
    comments: ["//"],
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
    inlineResolver: {
        content: true,
        metadata: true,
    }
}
const partialParseMetadata: Partial<Ignore> = {
    inlineResolver: {
        content: false,
        metadata: true,
    }
}

const partialParseContent: Partial<Ignore> = {
    inlineResolver: {
        content: true,
        metadata: false,
    }
}

const partialParseNothing: Partial<Ignore> = {
    inlineResolver: {
        content: false,
        metadata: false,
    }
}

const parseAll: Ignore = _.defaultsDeep(partialParseAll, templateIgnore)
const parseMetadata: Ignore = _.defaultsDeep(partialParseMetadata, templateIgnore)
const parseContent: Ignore = _.defaultsDeep(partialParseContent, templateIgnore)
const parseNothing: Ignore = _.defaultsDeep(partialParseNothing, templateIgnore)


describe("InlineFlagResolver", () => {
    describe("Count", () => {
        it("should count the number of occurrences of each flag correctly", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~a~one/one",
                relativePath: "flag~a~one/one",
                sourceAbsolutePath: "root/source/flag~a~one/one"
            }

            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag~b.c~\nblue"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.c~two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nhelp me! flag~b.d.e~\n are blue flag~b.c~\nare black!! flag~g~"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.d.e~one/31",
				relativePath: "flag~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag~b.d.e~one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nare red flag~b.d.f~\nare blue flag~b.c~\nare black!! flag~g~"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each inverse flag correctly", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~a~one/one",
                relativePath: "flag!~a~one/one",
                sourceAbsolutePath: "root/source/flag!~a~one/one"
            }

            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nthe color is: flag!~a~\nred flag!~b.c~\nblue"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~b.c~two/two",
                relativePath: "flag!~b.c~two/two",
                sourceAbsolutePath: "root/source/flag!~b.c~two/two"
            }
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nhelp me! flag!~b.d.e~\n are blue flag!~b.c~\nare black!! flag!~g~"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~b.d.e~one/31",
				relativePath: "flag!~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag!~b.d.e~one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nare red flag!~b.d.f~\nare blue flag!~b.c~\nare black!! flag!~g~"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each flag and inverse flag correctly", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~a~one/one",
                relativePath: "flag!~a~one/one",
                sourceAbsolutePath: "root/source/flag!~a~one/one"
            }

            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag!~b.c~\nblue"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.c~two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nhelp me! flag!~b.d.e~\n are blue flag~b.c~\nare black!! flag~g~"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.d.e~one/31",
				relativePath: "flag~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag~b.d.e~one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\nare red flag!~b.d.f~\nare blue flag~b.c~\nare black!! flag!~g~"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafe, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });
        
        it("should count the number of occurrences of each flag for all different syntaxes", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag{a}one/one",
                relativePath: "flag{a}one/one",
                sourceAbsolutePath: "root/source/flag{a}one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nare red flag~a~\nare blue flag~b.c~"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.c~two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nhelp me! flag~b.d.e~\nare blue flag#b.c# \nare black!! flag{g}"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.d.e~one/31",
				relativePath: "flag~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag~b.d.e~one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\n are red flag#b.d.f#\n are blue flag#b.c#\n are black!! flag#g#"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafeMultiSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each inverse flag for all different syntaxes", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!{a}one/one",
                relativePath: "flag!{a}one/one",
                sourceAbsolutePath: "root/source/flag!{a}one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nare red flag!~a~\nare blue flag!~b.c~"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~b.c~two/two",
                relativePath: "flag!~b.c~two/two",
                sourceAbsolutePath: "root/source/flag!~b.c~two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nhelp me! flag!~b.d.e~\nare blue flag!#b.c# \nare black!! flag!{g}"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~b.d.e~one/31",
				relativePath: "flag!~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag!~b.d.e~one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\n are red flag!#b.d.f#\n are blue flag!#b.c#\n are black!! flag!#g#"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafeMultiSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each flag and inverse flag for all different syntaxes", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag{a}one/one",
                relativePath: "flag{a}one/one",
                sourceAbsolutePath: "root/source/flag{a}one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nare red flag!~a~\nare blue flag~b.c~"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~b.c~two/two",
                relativePath: "flag!~b.c~two/two",
                sourceAbsolutePath: "root/source/flag!~b.c~two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nhelp me! flag~b.d.e~\nare blue flag#b.c# \nare black!! flag!{g}"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.d.e~one/31",
				relativePath: "flag~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag~b.d.e~one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\n are red flag!#b.d.f#\n are blue flag#b.c#\n are black!! flag!#g#"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafeMultiSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });
        
        it("should count the number of occurrences of each flag for multi character syntaxes", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag{{a#one/one",
                relativePath: "flag{{a#one/one",
                sourceAbsolutePath: "root/source/flag{{a#one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\n are redflag~~a}}\n are blue flag{{b.c#\nwhatever"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag${b.c}$two/two",
                relativePath: "flag${b.c}$two/two",
                sourceAbsolutePath: "root/source/flag${b.c}$two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif\n help me! flag##b.d.e}\n are blue flag{{b.c#\n are black!! flag${g}$"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag{~b.d.e~}one/31",
				relativePath: "flag{~b.d.e~}one/31",
				sourceAbsolutePath: "root/source/flag{~b.d.e~}one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\n are red flag`{b.d.f}`\n are blue flag{{b.c#\n are black!! flag{~g~}"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each inverse flag for multi character syntaxes", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!{{a#one/one",
                relativePath: "flag!{{a#one/one",
                sourceAbsolutePath: "root/source/flag!{{a#one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\n are redflag!~~a}}\n are blue flag!{{b.c#\nwhatever"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!${b.c}$two/two",
                relativePath: "flag!${b.c}$two/two",
                sourceAbsolutePath: "root/source/flag!${b.c}$two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif\n help me! flag!##b.d.e}\n are blue flag!{{b.c#\n are black!! flag!${g}$"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!{~b.d.e~}one/31",
				relativePath: "flag!{~b.d.e~}one/31",
				sourceAbsolutePath: "root/source/flag!{~b.d.e~}one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\n are red flag!`{b.d.f}`\n are blue flag!{{b.c#\n are black!! flag!{~g~}"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should count the number of occurrences of each flag and inverse flag for multi character syntaxes", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag{{a#one/one",
                relativePath: "flag{{a#one/one",
                sourceAbsolutePath: "root/source/flag{{a#one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\n are redflag~~a}}\n are blue flag!{{b.c#\nwhatever"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!${b.c}$two/two",
                relativePath: "flag!${b.c}$two/two",
                sourceAbsolutePath: "root/source/flag!${b.c}$two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nif\n help me! flag##b.d.e}\n are blue flag!{{b.c#\n are black!! flag${g}$"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag{~b.d.e~}one/31",
				relativePath: "flag{~b.d.e~}one/31",
				sourceAbsolutePath: "root/source/flag{~b.d.e~}one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\n are red flag!`{b.d.f}`\n are blue flag{{b.c#\n are black!! flag!{~g~}"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];

            let expected: [string, number][] = ([
                ["a", 2],
                ["b.c", 4],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });

        it("should not count flags for files marked to be not parsed, ignoring the file metadata", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!{~a~}one/one",
                relativePath: "flag!{~a~}one/one",
                sourceAbsolutePath: "root/source/flag!{~a~}one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nare red flag!~~a}}\n are blue flag{{b.c#"),
                ignore: parseMetadata,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag##b.c}two/two",
                relativePath: "flag##b.c}two/two",
                sourceAbsolutePath: "root/source/flag##b.c}two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\n help me! flag!##b.d.e}\n are blue flag{{b.c#\n are black!! flag${g}$"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~~b.d.e}}one/31",
				relativePath: "flag!~~b.d.e}}one/31",
				sourceAbsolutePath: "root/source/flag!~~b.d.e}}one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line2\n are red flag!~~b.d.f}}\n are blue flag{{b.c#\n are black!! flag{~g~}"),
                ignore: parseContent,
            });

            let fileMeta4: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~~b.d.e}}one/31",
				relativePath: "flag~~b.d.e}}one/31",
				sourceAbsolutePath: "root/source/flag~~b.d.e}}one/31",
            }
            let file4 = VirtualFileSystemInstance.File({
                metadata: fileMeta4,
                content: FileContent.String("line2\n are red flag~~b.d.f}}\n are blue flag{{b.c##\n are black!! flag{~g~}"),
                ignore: parseNothing,
            });

            let folderMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag{~b.d.e~}one/31",
				relativePath: "flag{~b.d.e~}one/31",
				sourceAbsolutePath: "root/source/flag{~b.d.e~}one/31",
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata
            });

            let folderMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!{{b.d.e##one/31",
				relativePath: "flag!{{b.d.e##one/31",
				sourceAbsolutePath: "root/source/flag!{{b.d.e##one/31",
            }
            let folder2 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta2,
                ignore: parseContent,
            });

            let testSubject = [file1, file2, file3, file4, folder1, folder2];

            let expected: [string, number][] = ([
                ["a", 1],
                ["b.c", 3],
                ["b.d.e", 2],
                ["b.d.f", 1],
                ["g", 2]
            ] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);

            let actual: [string, number][] = inlineFlagResolver.Count(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .SortByKey(SortType.AtoZ)
                .Arr();

            actual.should.deep.equal(expected);
        });
    });

    describe("ResolveFiles", () => {
        it("should return the files with relative path that has flag true condition and removed flags", () => {
            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~a~one/one",
                relativePath: "flag~a~one/one",
                sourceAbsolutePath: "root/source/flag~a~one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag~b.c~\nblue"),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.c~two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag~b.c~\nblue"),
                ignore: parseAll,
            });

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.d.e~one/31",
				relativePath: "flag~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag~b.d.e~one/31",
            }
            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag~b.c~\nblue"),
                ignore: parseAll,
            });

            let fileMeta4: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag!~b.c~two/two",
                relativePath: "flag!~b.c~two/two",
                sourceAbsolutePath: "root/source/flag!~b.c~two/two"
            }
            let file4 = VirtualFileSystemInstance.File({
                metadata: fileMeta4,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag~b.c~\nblue"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2, file3, file4];
            
            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/one/one",
				relativePath: "flag~a~one/one",
				sourceAbsolutePath: "root/source/flag~a~one/one"
            }
            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1Expected,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag~b.c~\nblue"),
                ignore: parseAll,
            });

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }
            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2Expected,
                content: FileContent.String("line1\nthe color is: flag~a~\nred flag~b.c~\nblue"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected];

            let actual = inlineFlagResolver.ResolveFiles(testCyanSafe, testSubjects);
            actual.should.deep.equal(expected)
        });
    });

    describe("ResolveContents", () => {
    
		it("should remove lines with false flags and keep lines with true flags with flags removed", () => {

            let content: string =
				`Lorem ipsum dolor sit amet, //flag~a~ consectetur adipiscing elit.
Integer quis est vulputate, interdum neque sed, pulvinar lacus.flag~b.d.e~ 
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.flag~b.c~
flag~b.d.f~Orci varius natoque penatibus et magnis dis parturient montes, nascetur 
flag~g~ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, 
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
eleifend. Donec maximus urna eros. Nunc gravida sollicitudin dignissim. flag!~b.d.e~
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. 
flag!~b.d.f~Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
			let expectedContent: string =
				`Lorem ipsum dolor sit amet,  consectetur adipiscing elit.
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.
ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, 
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
eleifend. Donec maximus urna eros. Nunc gravida sollicitudin dignissim. 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. 
Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;

            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~a~one/one",
                relativePath: "flag~a~one/one",
                sourceAbsolutePath: "root/source/flag~a~one/one"
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content),
                ignore: parseAll,
            });

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.c~two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nflag~b.d.e~help me!\nViolets are blueflag!~b.c~\nflag~g~Oreos are black!!"),
                ignore: parseAll,
            });

			let testSubjects = [file1, file2];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(expectedContent),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected];

            let actual = inlineFlagResolver.ResolveContents(testCyanSafe, testSubjects);
            actual.should.deep.equal(expected)
        });
       
        it("should resolve multi syntax flags content correctly", () => {
            
            let content: string =
				`Lorem ipsum dolor sit amet, //flag~a~ consectetur adipiscing elit.
Integer quis est vulputate, interdum neque sed, pulvinar lacus.flag#b.d.e# 
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.flag~b.c~
flag~b.d.f~Orci varius natoque penatibus et magnis dis parturient montes, nascetur 
flag#g#ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, flag{b.c}
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
flag{b.d.f}eleifend. Donec maximus urna eros. Nunc gravida sollicitudin dignissim. 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. flag!{b.d.e}
flag!#b.d.e#Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
			let expectedContent: string =
				`Lorem ipsum dolor sit amet,  consectetur adipiscing elit.
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.
ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, 
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. 
Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
            
            let path1: string = "root/";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content),
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
                content: FileContent.String("line2\nHelp me!flag#b.d.e#\nflag!{b.c}Violets are blue\nOreos are black!!flag~g~"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(expectedContent),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected];

            let actual = inlineFlagResolver.ResolveContents(testCyanSafeMultiSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

         
        it("should resolve multi character flags content correctly", () => {
            let content: string =
				`Lorem ipsum dolor sit amet, //flag{{a# consectetur adipiscing elit.
Integer quis est vulputate, interdum neque sed, pulvinar lacus.flag{~b.d.e~} 
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.flag{{b.c#
flag\${b.d.f}\$Orci varius natoque penatibus et magnis dis parturient montes, nascetur 
flag##g}ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, flag\`{b.c}\`
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
flag~~b.d.f}}eleifend. Donec maximus urna eros. Nunc gravida sollicitudin dignissim. 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. flag!##b.d.e}
flag!{~b.d.f~}Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
			let expectedContent: string =
				`Lorem ipsum dolor sit amet,  consectetur adipiscing elit.
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.
ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, 
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. 
Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
            
            let path1: string = "root/var";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content),
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
                content: FileContent.String("line2\nflag{{b.d.e#help me!\nViolets are blueflag!{~b.c~}\nflag${g}$Oreos are black!!"),
                ignore: parseAll,
            });

            let testSubjects = [file1, file2];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(expectedContent),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String("line2\nOreos are black!!"),
                ignore: parseAll,
            });

            let expected = [file1Expected, file2Expected];

            let actual = inlineFlagResolver.ResolveContents(testCyanSafeWithMultiCharacterSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });

        it("should not alter content for files that should not be parsed", () => {

            let fileMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~a~one/one",
                relativePath: "flag~a~one/one",
                sourceAbsolutePath: "root/source/flag~a~one/one"
            }

            let fileMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.c~two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }

            let fileMeta3: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.d.e~one/31",
				relativePath: "flag~b.d.e~one/31",
				sourceAbsolutePath: "root/source/flag~b.d.e~one/31",
            }
            
            let content: string =
				`Lorem ipsum dolor sit amet, //flag{{a# consectetur adipiscing elit.
Integer quis est vulputate, interdum neque sed, pulvinar lacus.flag{~b.d.e~} 
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.flag{{b.c#
flag\${b.d.f}\$Orci varius natoque penatibus et magnis dis parturient montes, nascetur 
flag##g}ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, flag\`{b.c}\`
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
flag~~b.d.f}}eleifend. Donec maximus urna eros. Nunc gravida sollicitudin dignissim. 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. flag!{{b.d.e#
flag!\${b.d.f}\$Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
			let expectedContent: string =
				`Lorem ipsum dolor sit amet,  consectetur adipiscing elit.
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.
ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, 
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. 
Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;

            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(content),
                ignore: parseAll,
            });
            
            let file2 = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content),
                ignore: parseMetadata,
            });

            let file3 = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String(content),
                ignore: parseMetadata,
            });

            let folderMeta1: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~a~one/one",
                relativePath: "flag~a~one/one",
                sourceAbsolutePath: "root/source/flag~a~one/one"
            }
            let folder1 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta1,
                ignore: parseMetadata,
            });

            let folderMeta2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/flag~b.c~two/two",
                relativePath: "flag~b.c~two/two",
                sourceAbsolutePath: "root/source/flag~b.c~two/two"
            }
            let folder2 = VirtualFileSystemInstance.Folder({
                metadata: folderMeta2,
                ignore: parseNothing,
            });

            let testSubjects = [file1, file2, file3, folder1, folder2];

            let file1Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String(expectedContent),
                ignore: parseAll,
            });

            let file2Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta2,
                content: FileContent.String(content),
                ignore: parseMetadata,
            });

            let file3Expected = VirtualFileSystemInstance.File({
                metadata: fileMeta3,
                content: FileContent.String(content),
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

            let actual = inlineFlagResolver.ResolveContents(testCyanSafeWithMultiCharacterSyntax, testSubjects);
            actual.should.deep.equal(expected)
        });
    });

    describe("ModifyFlagsWithAllIfSyntax", () => {
        it("should pad flags with all if and its inverted syntax terms", () => {
            inlineFlagResolver.ModifyFlagWithAllSyntax("hello", testCyanSafe.syntax).should.deep.equal([
                "flag~hello~"
            ]);
        });
    });

    describe("ModifyFlagsWithAllInverseIfSyntax", () => {
        it("should pad flags with all if and its inverted syntax terms", () => {
            inlineFlagResolver.ModifyInverseFlagWithAllSyntax("hello", testCyanSafe.syntax).should.deep.equal([
                "flag!~hello~"
            ]);
        });
    });

    describe("ShouldKeepStringWithInlineFlag", () => {
        it("should keep string with the true inline flag", () => {
            let syntaxes: string[] = ["~~a}}", "~a~"];
            inlineFlagResolver.ShouldKeepStringWithInlineFlag(syntaxes, true, "Roses are redflag~~a}}").should.deep.equal(true)
        });
    });

    describe("ConstructContentForInlineFlags", () => {
        it("should construct content for inline flags", () => {
            let content: string = "line2\nflag{{a#help me!\nViolets are blueflag{~a~}\nflag!${a}$Oreos are black!!";
            let allSyntaxes: string[] = inlineFlagResolver.ModifyFlagWithAllSyntax("a", testCyanSafeWithMultiCharacterSyntax.syntax);
            let allPossibleSyntaxMap: Map<string[], boolean> = new Map<string[], boolean>();
            allPossibleSyntaxMap.set(allSyntaxes, true);
            
            inlineFlagResolver.ConstructContentForInlineFlags(content, allPossibleSyntaxMap, [], false).should.deep.equal("line2\nhelp me!\nViolets are blue\nflag!${a}$Oreos are black!!");
        });
    });

    describe("GenerateCommentAndSignatureStrings", () => {
        it("should generate the comments with the flags behind", () => {
            const signatures = ["flag~a~", "flag#a#"]
            const expected = ["//flag~a~", "//flag#a#"];
            inlineFlagResolver.GenerateCommentsWithSignatureStrings(signatures, ["//"]).should.deep.equal(expected);
        });
    });

    describe("CountPossibleUnaccountedFlags", () => {
        it("should count all unaccounted inline flags", () => {

            let path1: string = "root/flag~~a}}/";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1 = VirtualFileSystemInstance.File({
                metadata: fileMeta1,
                content: FileContent.String("line1\nflag!~~a}}\n are red\nblabla\nnothing\n are blue\nblabla"),
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
                content: FileContent.String("line2\nflag!##b.d.e}\n help me!\nare black!!"),
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
                content: FileContent.String("line2\nflag`{b.d.f}`\n are red\nnothing\nignore this\n are blue"),
                ignore: parseAll,
            });

            let testSubject = [file1, file2, file3];
            let expected: string[] = [
                `flag!~~a}}:${path1}`,
                `flag~~a}}:${path1}`,
                `flag!##b.d.e}:${path2}`,
                `flag\`{b.d.f}\`:${path3}`].Sort(SortType.AtoZ);

            let actual: string[] = inlineFlagResolver.CountPossibleUnaccountedFlags(testCyanSafeWithMultiCharacterSyntax, testSubject)
                .Sort(SortType.AtoZ);

            actual.should.deep.equal(expected);
            
        });
    });
});