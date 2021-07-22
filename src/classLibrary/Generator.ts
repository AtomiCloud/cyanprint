import { CyanSafe, 
    Glob, 
    IFileSystemInstanceMetadata, 
    IGuidGenerator, 
    IParsingStrategy, 
    VirtualFileSystemInstance } from "./interfaces/interfaces";
import { Parser } from "./Parser";
import { GuidResolver } from "./ParsingStrategies/GuidResolver";
import { IfElseResolver } from "./ParsingStrategies/IfElseResolver";
import { InlineFlagResolver } from "./ParsingStrategies/InlineFlagResolver";
import { VariableResolver } from "./ParsingStrategies/VariableResolver";
import { Utility } from "./Utility/Utility";
import path from "path";
import fs from "fs";
import { GlobFactory } from "./Utility/GlobFactory";
import chalk from "chalk";

export class Generator {
    private readonly util: Utility;
    private guidGenerator: IGuidGenerator;

    constructor(util: Utility, guidGenerator: IGuidGenerator) {
        this.util = util;
        this.guidGenerator = guidGenerator;
    }
    
    async Execute(cyanSafe: CyanSafe, relativePath: string, folderName: string, plugins: Plugin[]): VirtualFileSystemInstance[] {
        //dest file path 
        let destPath: string = path.resolve(process.cwd(), folderName);
        //list of src file path is the relativePath + the glob.root?

        //Check if the target path is empty
        if (fs.existsSync(destPath)) {
            //ask if want to delete existing stuff
        }

        console.log(chalk.cyanBright("Preparing template, please wait..."));

        let strategies: IParsingStrategy[] = [
            new GuidResolver(this.guidGenerator, this.util),
            new IfElseResolver(this.util),
            new InlineFlagResolver(this.util),
            new VariableResolver(this.util)
        ];

        let parser: Parser = new Parser(this.util, strategies, cyanSafe);

        console.log(chalk.greenBright("Preparation done!"));
        console.log(chalk.cyanBright("Performing variable and flag scans..."));

        //create globs
        let globFactory: GlobFactory = new GlobFactory();
        let files: VirtualFileSystemInstance[] = cyanSafe.globs.Map((g: Glob) => globFactory.GenerateFiles(g, g.root)).Flatten();

        parser.CountFiles(files);
        
    }
}
    