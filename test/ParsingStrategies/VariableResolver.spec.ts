import { should } from 'chai';
import {
    CyanSafe,
    FileContent,
    FileSystemInstance,
    IFileSystemInstanceMetadata
} from "../../src/classLibrary/interfaces/interfaces";
import { Core, Kore, SortType } from "@kirinnee/core";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import { VariableResolver } from "../../src/classLibrary/ParsingStrategies/VariableResolver";

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

describe("VariableResolver", () => {
    describe("Count", () => {
        it("should count the number of occurrences of each variable correctly", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }
            let file1: FileSystemInstance = {
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c~ are red\nvar~b.c~ are blue"),
                parse: true,
            };

            let path2: string = "root/var~b.c~/var~g~";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2: FileSystemInstance = {
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"),
                parse: true,
            };

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3: FileSystemInstance = {
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"),
                parse: true,
            };

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
            let file1: FileSystemInstance = {
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c~ are red\nvar~b.c~ are blue"),
                parse: true,
            };

            let path2: string = "root/var{b.c}/var#g#";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2: FileSystemInstance = {
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar~b.d.e~ help me!\nvar#b.c# are blue\nvar{g} are black!!"),
                parse: true,
            };

            let path3: string = "root/var{b.d.e}/var{g}";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3: FileSystemInstance = {
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar#b.d.f# are red\nvar#b.c# are blue\nvar#g# are black!!"),
                parse: true,
            };

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
    });

    describe("ResolveFiles", () => {
        it("should rename the file destination to the correct name", () => {
            let path1: string = "root/var~a~/a.a";
            let fileMeta1: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path1,
                destinationAbsolutePath: path1,
                relativePath: path1,
            }

            let path2: string = "root/var~b.c~/var~g~";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }

            let testSubjects = [fileMeta1, fileMeta2, fileMeta3];

            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~a~/a.a",
                destinationAbsolutePath: "root/Roses/a.a",
                relativePath: "root/var~a~/a.a",
            }

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~b.c~/var~g~",
                destinationAbsolutePath: "root/Violets/Oreos",
                relativePath: "root/var~b.c~/var~g~",
            }

            let fileMeta3Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~b.d.e~/var~g~",
                destinationAbsolutePath: "root/please/Oreos",
                relativePath: "root/var~b.d.e~/var~g~",
            }

            let expected = [fileMeta1Expected, fileMeta2Expected, fileMeta3Expected];

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

            let path2: string = "root/var{b.c}/var{g}";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }

            let path3: string = "root/var#b.d.e#/var#g#";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }

            let testSubjects = [fileMeta1, fileMeta2, fileMeta3];

            let fileMeta1Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var~a~/a.a",
                destinationAbsolutePath: "root/Roses/a.a",
                relativePath: "root/var~a~/a.a",
            }

            let fileMeta2Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var{b.c}/var{g}",
                destinationAbsolutePath: "root/Violets/Oreos",
                relativePath: "root/var{b.c}/var{g}",
            }

            let fileMeta3Expected: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: "root/var#b.d.e#/var#g#",
                destinationAbsolutePath: "root/please/Oreos",
                relativePath: "root/var#b.d.e#/var#g#",
            }

            let expected = [fileMeta1Expected, fileMeta2Expected, fileMeta3Expected];

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
            let file1: FileSystemInstance = {
                metadata: fileMeta1,
                content: FileContent.String("line1\nvar~b.c~ are red\nvar~b.c~ are blue"),
                parse: true,
            };

            let path2: string = "root/var~b.c~/var~g~";
            let fileMeta2: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path2,
                destinationAbsolutePath: path2,
                relativePath: path2,
            }
            let file2: FileSystemInstance = {
                metadata: fileMeta2,
                content: FileContent.String("line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"),
                parse: true,
            };

            let path3: string = "root/var~b.d.e~/var~g~";
            let fileMeta3: IFileSystemInstanceMetadata = {
                sourceAbsolutePath: path3,
                destinationAbsolutePath: path3,
                relativePath: path3,
            }
            let file3: FileSystemInstance = {
                metadata: fileMeta3,
                content: FileContent.String("line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"),
                parse: true,
            };

			let testSubjects = [file1, file2, file3];

            let file1Expected: FileSystemInstance = {
                metadata: fileMeta1,
                content: FileContent.String("line1\nViolets are red\nViolets are blue"),
                parse: true,
            };

            let file2Expected: FileSystemInstance = {
                metadata: fileMeta2,
                content: FileContent.String("line2\nplease help me!\nViolets are blue\nOreos are black!!"),
                parse: true,
            };

            let file3Expected: FileSystemInstance = {
                metadata: fileMeta3,
                content: FileContent.String("line2\nApples are red\nViolets are blue\nOreos are black!!"),
                parse: true,
            };

			let expected = [file1Expected, file2Expected, file3Expected];

			let actual = variableResolver.ResolveContents(testCyanSafe, testSubjects);
			actual.should.deep.equal(expected)
		});
	});

    describe("ModifyVariablesWithAllSyntax", () => {
        it("should pad variables with all open and close syntax terms", () => {
            variableResolver.ModifyVariablesWithAllSyntax("package.name", testCyanSafe.syntax).should.deep.equal(["var~package.name~"]);
        });
    });
});
