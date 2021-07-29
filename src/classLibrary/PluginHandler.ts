import { CyanSafe, IFileFactory } from "./interfaces/interfaces";
import chalk from "chalk";
import { spawn } from "child_process";
import path from "path";

export class PluginHandler {
    private readonly fileFactory: IFileFactory;

    constructor(fileFactory: IFileFactory ) {
        this.fileFactory = fileFactory;
    }

    async DownloadPlugins(cyanSafe: CyanSafe, folderName: string) {
        let plugins: string[] = this.GetModules(cyanSafe, "api.cyanprint.dev");
        
        if (plugins.length > 0) {
            if (plugins.includes("npm")) {
                this.DownloadNpm(cyanSafe, folderName);
            }
            if (plugins.includes("github")) {
                this.SetupGithub();
            }
        }
    }

    SetupGithub() {
        //where to get the github details?
        /*let git: Git = docParser.GetGit()!;

        if (git) {
            await this.ExecuteCommandSimple("git", ["init"], folderName);
            await this.ExecuteCommandSimple("git", ["config", "user.name", git.username], folderName);
            await this.ExecuteCommandSimple("git", ["config", "user.email", git.email], folderName);
            await this.ExecuteCommandSimple("git", ["rm", "-rf", "--cached", "."]);
            await this.ExecuteCommandSimple("git", ["add", "."], folderName);
            let reply = await this.ExecuteCommand("git", ["commit", "-m", '"Initial Commit~"'], "Initialized Git repository!", folderName);
            console.log(reply);

            if (git.remote != null) {
                let useRemote: boolean = await autoInquirer.InquirePredicate("Do you want to set your remote 'origin' to " + chalk.yellowBright(git.remote) + " and immediately push to origin?");
                if (useRemote) {
                    await this.ExecuteCommandSimple("git", ["remote", "add", "origin", git.remote], folderName);
                    let reply: string = await this.ExecuteCommand("git", ["push", "origin", "--all"], "Added and pushed to remote repository", folderName);
                    console.log(reply);
                }
            }
        }*/
    }

    async DownloadNpm(cyanSafe: CyanSafe, folderName: string) {
        let paths: string[] = cyanSafe.globs.map(glob => this.fileFactory.GetAbsoluteFilePathOfFileInDestinationPath("package.json", glob.root, glob.pattern as string, glob.ignore)).Flatten();
        if (paths.length === 0) {
            console.info(chalk.yellowBright("package.json not found. Installation of NPM modules halted."));
            return;
        }
        //what should cd be?
        let cds: string[] = paths.map(p => {
            let destPath = path.resolve(process.cwd(), folderName);
            return path.relative(destPath, p);
        });
        console.log(chalk.cyanBright("Installing NPM modules"));
        let reply = "";
        let hasYarn = await this.ExecuteCommandSimple("yarn", ["-v"], "", true);
        if (hasYarn) {
            console.info(chalk.greenBright("Yarn Detected... Using yarn!"));
            cds.map(async cd => {
                reply = await this.ExecuteCommand("yarn", ["--prefer-offline"], "Installed NPM Modules", folderName, cd);
                if (reply == 'error') {
                    reply = await this.ExecuteCommand("yarn", [], "Installed NPM Modules", folderName, cd);
                }
            })
        } else {
            cds.map(async cd => {
                reply = await this.ExecuteCommand("npm", ["i"], "Installed NPM Modules", folderName, cd);
            });
        }
        console.log(reply);
    }

    GetModules(cyanSafe: CyanSafe, key: string): string[] {
        let plugins = cyanSafe.plugins;
        if (Object.keys(plugins).includes(key)) {
            return plugins.key;
        }
        return [];
    }

     //taken from kirinnee/CyanPrint
     async ExecuteCommandSimple(command: string, variables: string[], cd?: string, ignore: boolean = false): Promise<boolean> {
        let p = cd != null ? path.resolve(process.cwd(), cd) : process.cwd();
    
        console.log(p);
        return await new Promise<boolean>(function (resolve) {
            spawn(command, variables, {
                stdio: ignore ? "ignore" : "inherit",
                shell: true,
                cwd: p
            })
                .on("exit", (code: number) => {
                    console.info(`${command} ${variables.join(' ')} ${cd ? 'at ' + cd : ''} with code ${code}`);
                    if (code === 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .on("error", err => console.info(err));
        });
    }

    async ExecuteCommand(command: string, variables: string[], done: string, cd?: string, cdExt?: string): Promise<string> {
        cdExt = cdExt || ".";
        let p = cd != null ? path.resolve(process.cwd(), cd, cdExt) : process.cwd();
        return await new Promise<string>(function (resolve: (s: string) => void) {
            spawn(command, variables, {stdio: "inherit", shell: true, cwd: p})
                .on("exit", (code: number) => {
                    if (code == 0) {
                        resolve(chalk.greenBright(done));
                    } else {
                        resolve('error');
                    }
                });
        });
    }
    
}