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
import fs from "fs";
import path from "path";
import { GlobFactory } from "./Utility/GlobFactory";
import chalk from "chalk";
import { FileFactory } from "./Utility/FileFactory";

import deleteEmpty from "delete-empty";

export class Generator {
    private readonly util: Utility;
    private guidGenerator: IGuidGenerator;

    constructor(util: Utility, guidGenerator: IGuidGenerator) {
        this.util = util;
        this.guidGenerator = guidGenerator;
    }
    
    async GenerateVFS(cyanSafe: CyanSafe, globFactory: GlobFactory): Promise<VirtualFileSystemInstance[]> {
    
        //missing package resolver but need think how to expand it to beyond npm modules
        let strategies: IParsingStrategy[] = [
            new GuidResolver(this.guidGenerator, this.util),
            new IfElseResolver(this.util),
            new InlineFlagResolver(this.util),
            new VariableResolver(this.util)
        ];

        let parser: Parser = new Parser(this.util, strategies, cyanSafe);

        console.log(chalk.greenBright("Preparation done!"));
        console.log(chalk.cyanBright("Performing variable and flag scans..."));

        //create globs (empty content vfs)
        let filesMetadata: IFileSystemInstanceMetadata[] = cyanSafe.globs.Map((g: Glob) => globFactory.GenerateFilesMetadata(g, g.root)).Flatten();

        //remove package.lock
        filesMetadata = filesMetadata.Where(f => !f.sourceAbsolutePath.includes("node_modules"))
        .Where(f => f.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "package-lock.json")
        .Where(f => f.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "yarn.lock");

        //no ignore is put
        let files = globFactory.CreateEmptyFiles(filesMetadata);

        //count for paths
        parser.CountFiles(files);

        //parse to get path according to parsing strategy
        parser.ParseFiles(files);

        //Read file asynchronously into the VFS (put the content with the metadata into VFS)
        files = await globFactory.ReadFiles(files);

        //count for the remaining content
        let isNoUnusedFlags: boolean = parser.CountOccurence(files);
        
        //if there are unused flags
        if (!isNoUnusedFlags) {

        }        

        console.log(chalk.cyanBright("Parsing template content..."));

        //Parse Templates
        files = parser.ParseContent(files);

        //Generate warning of possible possible unaccounted flags
        parser.CountPossibleRemains(files);

        return files;
    }

    async GenerateTemplate(cyanSafe: CyanSafe, templatePath: string, folderName: string) {
        //dest file path
        //cwd is where the user is calling from
        let destPath: string = path.resolve(process.cwd(), folderName);

        //Check if the target path is empty
        if (fs.existsSync(destPath)) {
            //ask if want to delete existing stuff
        }

        console.log(chalk.cyanBright("Preparing template, please wait..."));

        let fileFactory: FileFactory = new FileFactory(templatePath, destPath);
        let globFactory: GlobFactory = new GlobFactory(fileFactory, this.util);

        let virtualFSInstances =  await this.GenerateVFS(cyanSafe, globFactory);
        
        //Asynchronous write to target directory
        await globFactory.AWriteFile(virtualFSInstances);

        console.log(chalk.cyanBright("Clearing residue directories..."));
        const deleted = await deleteEmpty(folderName);
        if (deleted)
            console.log(chalk.greenBright(`Deleted ${deleted.join(", ")}`));
        else
            console.log(chalk.greenBright("No residue directories found!"));
        return chalk.greenBright("Complete~!!");
    }

}
    