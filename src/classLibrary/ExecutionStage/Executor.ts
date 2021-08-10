import {
    CyanSafe,
    DirectorySystemInstance,
    FileSystemInstance,
    GlobSafe,
    IGuidGenerator,
    IParsingStrategy,
    VirtualFileSystemInstance
} from "../interfaces/interfaces";
import { GuidResolver } from "../ParsingStrategies/GuidResolver";
import { IfElseResolver } from "../ParsingStrategies/IfElseResolver";
import { InlineFlagResolver } from "../ParsingStrategies/InlineFlagResolver";
import { VariableResolver } from "../ParsingStrategies/VariableResolver";
import { Utility } from "../Utility/Utility";
import fs from "fs";
import path from "path";
import { GlobFactory } from "../Utility/GlobFactory";
import chalk from "chalk";
import { FileFactory } from "../Utility/FileFactory";
import deleteEmpty from "delete-empty";
import { PluginHandler } from "../PluginHandler";
import { AllParsers } from "./AllParsers";

class Executor {
    private readonly util: Utility;
    private guidGenerator: IGuidGenerator;

    constructor(util: Utility, guidGenerator: IGuidGenerator) {
        this.util = util;
        this.guidGenerator = guidGenerator;
    }
    
    async GenerateVFS(cyanSafe: CyanSafe, globFactory: GlobFactory): Promise<VirtualFileSystemInstance[]> {
    
        //package resolver may need to think how to expand it to beyond npm modules
        let strategies: IParsingStrategy[] = [
            new GuidResolver(this.guidGenerator, this.util),
            new IfElseResolver(this.util),
            new InlineFlagResolver(this.util),
            new VariableResolver(this.util)
        ];

        let parser: AllParsers = new AllParsers(this.util, strategies, cyanSafe);

        console.log(chalk.greenBright("Preparation done!"));
        console.log(chalk.cyanBright("Performing variable and flag scans..."));

        //create globs (empty content vfs)
        let files: VirtualFileSystemInstance[] = cyanSafe.globs.Map((g: GlobSafe) => globFactory.GenerateFiles(g, g.root)).Flatten();

        //remove package.lock
        files = files.Where(f => { 
            return VirtualFileSystemInstance.match(f, {
                File: (file: FileSystemInstance) => {
                    return !file.metadata.sourceAbsolutePath.includes("node_modules");
                },
                Folder: (folder: DirectorySystemInstance) => {
                    return !folder.metadata.sourceAbsolutePath.includes("node_modules");
                },
                default: () => false
            });
        })
        .Where(f => {
            return VirtualFileSystemInstance.match(f, {
                File: (file: FileSystemInstance) => {
                    return (file.metadata.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "package-lock.json");
                },
                Folder: (folder: DirectorySystemInstance) => {
                    return (folder.metadata.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "package-lock.json");
                },
                default: () => false
            });
        })
        .Where(f => {
            return VirtualFileSystemInstance.match(f, {
                File: (file: FileSystemInstance) => {
                    return (file.metadata.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "yarn.lock");

                },
                Folder: (folder: DirectorySystemInstance) => {
                    return (folder.metadata.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "yarn.lock");
                },
                default: () => false
            });
        });

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
            // TODO handle provided but unused variables in template files
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
        const destPath: string = path.resolve(process.cwd(), folderName);

        //Check if the target path is empty
        if (fs.existsSync(destPath)) {
            //TODO: ask if want to delete existing stuff
        }

        console.log(chalk.cyanBright("Preparing template, please wait..."));

        let fileFactory: FileFactory = new FileFactory(templatePath, destPath);
        let globFactory: GlobFactory = new GlobFactory(fileFactory, this.util);

        let virtualFSInstances =  await this.GenerateVFS(cyanSafe, globFactory);
        
        //Asynchronous write to target directory
        await globFactory.AWriteFile(virtualFSInstances);

        //use plugin handler
        let pluginHandler: PluginHandler = new PluginHandler(fileFactory);
        pluginHandler.DownloadPlugins(cyanSafe, folderName);
        
        console.log(chalk.cyanBright("Clearing residue directories..."));
        const deleted = await deleteEmpty(folderName);
        if (deleted)
            console.log(chalk.greenBright(`Deleted ${deleted.join(", ")}`));
        else
            console.log(chalk.greenBright("No residue directories found!"));
        return chalk.greenBright("Complete~!!");
    }

}

export { Executor };
