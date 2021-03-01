import { should } from 'chai';
import { variableResolver } from "../../src/classLibrary/ParsingStrategies/VariableResolver";
import {
    CyanSafe,
    FileContent,
    FileSystemInstance,
    IFileSystemInstanceMetadata
} from "../../src/classLibrary/interfaces/interfaces";
import { Core, Kore, SortType } from "@kirinnee/core";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

let variables: object = {
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

let testCyanSafe: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: {},
    globs: [],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~", "~"]],
    variable: variables
};

describe("VariableResolver", () => {
    describe("Count", () => {
        it("should count the number of occurrences of each variable", () => {
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
    });
});
