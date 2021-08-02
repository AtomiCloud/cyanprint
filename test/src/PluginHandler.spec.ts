import { should } from "chai";
import { CyanSafe, Glob, IFileFactory, Ignore } from "../../src/classLibrary/interfaces/interfaces";
import { PluginHandler } from "../../src/classLibrary/PluginHandler";
import path from "path";
import { FileFactory } from "../../src/classLibrary/Utility/FileFactory";
import _glob from "glob";

should()

let folderName: string = "pluginDir"
let to: string = path.resolve(__dirname, folderName);
let from = path.resolve(__dirname, '../target/testDir/');
let fileFactory: IFileFactory = new FileFactory(from, to);
let pluginHandler: PluginHandler = new PluginHandler(fileFactory);

const templateIgnore: Ignore = {
    custom: {},
    guidResolver: {},
    ifElseResolver: {},
    inlineResolver: {},
    variableResolver: {},
}

let glob: Glob = {
    root: "./template",
    pattern: "**/*.*",
    ignore: "",
    skip: templateIgnore
}

const testCyanSafe: CyanSafe = {
    comments: [],
    copyOnly: [],
    flags: {},
    globs: [glob],
    guid: [],
    pluginData: {},
    plugins: {},
    syntax: [["~", "~"]],
    variable: {},
};

describe("PluginHandler", () => {
	describe("DownloadNpm", () => {
		it("should download the npm with package.json", async () => {
            pluginHandler.DownloadNpm(testCyanSafe, "package.json")
            .then( function() {
                let pathPattern = path.resolve(__dirname, folderName, "node_modules");
			
                //returns all absolute path according to the glob pattern 
                let files: string[] = _glob.sync(pathPattern)
                files.length.should.greaterThan(1);
                return;
            });
        });
    });
});