import { Core, Kore, SortType } from "@kirinnee/core";
import { should } from "chai";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import path from "path";
import { FileContent } from "../../src/classLibrary/interfaces/interfaces";
import { glob } from "glob";

should();

let core: Core = new Kore();
core.ExtendPrimitives();
let u: Utility = new Utility(core);

//to test increase + increase in map
describe("Utility", () => {
	describe("FlattenStringValueObject", () => {
		it("should flatten objects with strings as values", () => {
            let testSubject: object = {
				index: {hello: "how are you?"},
				unbelievable: {yup: "morning"},
				testFace: {
					test: {test: "tick tock"},
					face: {face: "la la la la"},
				},
				try: {
					really: {
						hard: {to: "Hello"},
						get: {
							this: {"to work": "how are you?"}
						}
					}
				},
				package: {
					"@types/kirinnee": {no: "sleeping"}
				}
			};
			
			let expected = new Map<string, string>([
				["index.hello", "how are you?"],
				["unbelievable.yup", "morning"],
				["testFace.test.test", "tick tock"],
				["testFace.face.face", "la la la la"],
				["try.really.hard.to", "Hello"],
				["try.really.get.this.to work", "how are you?"],
				["package.@types/kirinnee.no", "sleeping"]
			]).SortByKey(SortType.AtoZ);
			
			let actual: Map<string, string | [string, string]> = u.FlattenStringValueObject(testSubject).SortByKey(SortType.AtoZ);
			
			actual.Arr().should.deep.equal(expected.Arr());
        })
    })

    describe("FlattenBooleanValueObject", () => {	
		it("should flatten object wit true false value into a map", () => {
			let testSubject: object = {
				index: true,
				unbelievable: true,
				testFace: {
					test: false,
					face: false,
				},
				try: {
					really: {
						hard: true,
						get: {
							this: false
						}
					}
				},
				package: {
					"@types/kirinnee": true
				}
			};
			
			let expected: [string, boolean][] = [
				["index", true],
				["unbelievable", true],
				["testFace.test", false],
				["testFace.face", false],
				["try.really.hard", true],
				["try.really.get.this", false],
				["package.@types/kirinnee", true]
			];
			expected = expected.Sort(SortType.AtoZ, (s: [string, boolean]) => s["0"]);
			let actual: [string, boolean][] =
				u.FlattenBooleanValueObject(testSubject).Arr()
					.Sort(SortType.AtoZ, (s: [string, boolean]) => s["0"]);
			expected.should.deep.equal(actual);
			
		});
    });

	describe("IncreaseInMap", () => {	
		it("should merge the maps and add the values for same keys", () => {
			let map1: Map<string, number> = new Map([
				["packages.mocha", 1],
				["packages.chai", 1],
				["packages.@types/mocha", 1],
				["packages.@types/chai", 1]
			]);
			
			let map2: Map<string, number> = new Map([
				["packages.chai", 1],
				["packages.@types/mocha", 1],
			]);

			let expected: [string, number][] = new Map([
				["packages.mocha", 1],
				["packages.chai", 2],
				["packages.@types/mocha", 2],
				["packages.@types/chai", 1]
			])
				.SortByKey(SortType.AtoZ)
				.Arr();

			(u.IncreaseInMap(map1, map2).SortByKey(SortType.AtoZ).Arr()).should.deep.equal(expected);
		});
	});

	describe("ASafeWriteFile", () => {
        it("should write file into correct directory", () => {
			let folderName: string = "newDir"
			let to: string = path.resolve(__dirname, folderName);
            u.ASafeWriteFile(path.resolve(to, "./template/writeFile.txt"), FileContent.String("wrote file using Utility"), false);
            
			let expected = path.resolve(__dirname, folderName) + "/template/writeFile.txt";
            
			let pathPattern = path.resolve(to, "**/*.*");
			//returns all absolute path according to the glob pattern 
			let files: string[] = glob.sync(pathPattern).filter(str => str.includes("writeFile.txt"));
			files[0].should.equal(expected);
        })
    })

	describe("ASafeCreateDirectory", () => {
        it("should create correct directory", () => {
			let folderName: string = "createDir"
			let to: string = path.resolve(__dirname, folderName);
            u.ASafeCreateDirectory(to);
                    
			let pathPattern = path.resolve(__dirname, folderName);
			//returns all absolute path according to the glob pattern 
			let files: string[] = glob.sync(pathPattern)
			files[0].should.equal(to);
        })
    })
})