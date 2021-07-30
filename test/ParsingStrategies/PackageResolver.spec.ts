import { Core, Kore, SortType } from "@kirinnee/core";
import { should } from "chai";
import { CyanFlag, CyanSafe, FileContent, FileSystemInstance, IFileSystemInstanceMetadata, Ignore, VirtualFileSystemInstance } from "../../src/classLibrary/interfaces/interfaces";
import { PackageResolver } from "../../src/classLibrary/ParsingStrategies/PackageResolver";
import { Utility } from "../../src/classLibrary/Utility/Utility";

should();

let core: Core = new Kore();
core.ExtendPrimitives();

let util: Utility = new Utility(core);

let packageParser: PackageResolver = new PackageResolver(util);
let flags: CyanFlag = {
	a: false,
	b: false,
	packages: {
		mocha: true,
		chai: false,
		"@types/mocha": true,
		"@types/chai": false
	}
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

const templateIgnore: Ignore = {
    custom: {},
    guidResolver: {},
    ifElseResolver: {},
    inlineResolver: {},
    variableResolver: {},
}

describe("PackageResolver", () => {
	describe("ResolveJsonFile", () => {
		it("should remove unused packages", () => {
			
			let map: Map<string, boolean> = new Map<string, boolean>([
				["mocha", true],
				["chai", false],
				["@types/mocha", true],
				["@types/chai", false]
			]);
			
			let testSubj: string =
				`{
                    "name": "@kirinnee/weave",
                    "license": "MIT",
                    "devDependencies": {
                        "@types/chai": "^4.1.5",
                        "@types/mocha": "^5.2.5",
                        "@types/webpack": "^4.4.12",
                        "typescript": "^3.0.3",
                        "webpack": "^4.19.1",
                        "webpack-cli": "^3.1.0"
                    },
                    "dependencies": {
                        "chai": "^4.1.2",
                        "mocha": "^5.2.0"
                    }
                }`;
                let expectedContent: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/mocha": "^5.2.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "mocha": "^5.2.0"
  }
}`;

            let testMetadata: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json",
            };

			let testFile: FileSystemInstance = {
				metadata: testMetadata,
				content: FileContent.String(testSubj),
                ignore: templateIgnore
			};
			
			let expectedFile: FileSystemInstance = {
				metadata: testMetadata,
				content: FileContent.String(expectedContent),
				ignore: templateIgnore
			};
			
			packageParser.ResolveJsonFile(map, testFile).should.deep.equal(expectedFile);
		});
	});
	
	describe("ResolveContents", () => {
		it("should return package json with unused packages removed", () => {
			let testSubj: string =
				`{
                    "name": "@kirinnee/weave",
                    "license": "MIT",
                    "devDependencies": {
                        "@types/chai": "^4.1.5",
                        "@types/mocha": "^5.2.5",
                        "@types/webpack": "^4.4.12",
                        "typescript": "^3.0.3",
                        "webpack": "^4.19.1",
                        "webpack-cli": "^3.1.0"
                    },
                    "dependencies": {
                        "chai": "^4.1.2",
                        "mocha": "^5.2.0"
                    }
                }`;
                let expectedContent: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/mocha": "^5.2.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "mocha": "^5.2.0"
  }
}`;

            let testMetadata: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json"
            }

			let testFile = VirtualFileSystemInstance.File({
				metadata: testMetadata,
				content: FileContent.String(testSubj),
				ignore: templateIgnore
			});

            let testMetadata2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/main.js",
				sourceAbsolutePath: "root/main.js",
				relativePath: "root/main.js",
            }

			let file2 = VirtualFileSystemInstance.File({
				metadata: testMetadata2,
				content: FileContent.String("rofl"),
				ignore: templateIgnore
			});

            let dirMetadata: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/src",
				sourceAbsolutePath: "root/src",
				relativePath: "root/src"
            }

			let dir = VirtualFileSystemInstance.Folder({
				metadata: dirMetadata,
                ignore: templateIgnore
			});
			
			let expectedFile = VirtualFileSystemInstance.File({
				metadata: testMetadata,
				content: FileContent.String(expectedContent),
				ignore: templateIgnore
			});

			let expectedFile2 = VirtualFileSystemInstance.File({
				metadata: testMetadata2,
				content: FileContent.String("rofl"),
				ignore: templateIgnore
			});

			let expectedDir = VirtualFileSystemInstance.Folder({
                metadata: dirMetadata,
                ignore: templateIgnore
			});
			
			let test = [testFile, file2, dir];
			let expected = [expectedFile, expectedFile2, expectedDir];
			
			packageParser.ResolveContents(testCyanSafe, test).should.deep.equal(expected);
		});
	});
	
	
	describe("Count", () => {
		it("should count the occurrences of the package flags", () => {
			let testSubj: string =
				`{
                    "name": "@kirinnee/weave",
                    "license": "MIT",
                    "devDependencies": {
                        "@types/chai": "^4.1.5",
                        "@types/mocha": "^5.2.5",
                        "@types/webpack": "^4.4.12",
                        "typescript": "^3.0.3",
                        "webpack": "^4.19.1",
                        "webpack-cli": "^3.1.0"
                    },
                    "dependencies": {
                        "chai": "^4.1.2",
                        "mocha": "^5.2.0"
                    }
                }`;
			
            let testMetadata: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json"
            }

			let testFile = VirtualFileSystemInstance.File({
				metadata: testMetadata,
				content: FileContent.String(testSubj),
				ignore: templateIgnore
			});

            let testMetadata2: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/main.js",
				sourceAbsolutePath: "root/main.js",
				relativePath: "root/main.js",
            }

			let file2 = VirtualFileSystemInstance.File({
				metadata: testMetadata2,
				content: FileContent.String("rofl"),
				ignore: templateIgnore
			});

            let dirMetadata: IFileSystemInstanceMetadata = {
                destinationAbsolutePath: "root/src",
				sourceAbsolutePath: "root/src",
				relativePath: "root/src"
            }

			let dir = VirtualFileSystemInstance.Folder({
				metadata: dirMetadata,
                ignore: templateIgnore
			});
			
			let test = [dir, file2, testFile];
			
			let expected: [string, number][] = new Map([
				["packages.mocha", 1],
				["packages.chai", 1],
				["packages.@types/mocha", 1],
				["packages.@types/chai", 1]
			])
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			let oldMap: Map<string, number> = new Map([
				["packages.chai", 1],
				["packages.@types/mocha", 1],
			]);

			let oldExpected: [string, number][] = new Map([
				["packages.mocha", 1],
				["packages.chai", 2],
				["packages.@types/mocha", 2],
				["packages.@types/chai", 1]
			])
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			let resMap = packageParser.Count(testCyanSafe, test);
            resMap.SortByKey(SortType.AtoZ).Arr().should.deep.equal(expected);
			(util.IncreaseInMap(resMap, oldMap).SortByKey(SortType.AtoZ).Arr()).should.deep.equal(oldExpected);
		});
	});
});

