import { CommanderStatic } from "commander";
import axios from "axios";
import chalk from "chalk";

interface Post {
    userId: number
    id: number
    title: string
    body: string
}

export function InstallController(program: CommanderStatic) {

    const install = program
        .command("install")
        .alias("i")
        .option("-t, --temp-file", "temporary file to use", "db.db")

    install.command("template <key> [group]")
        .alias("t")
        .description("installs an template", {
            key: 'CyanPrint template key to install',
            group: "Group to install it. Will install in main if none is provided"
        })
        .action(async function (key, group) {
            console.log(key, group);
            const result = await axios.get<Post>("http://slowwly.robertomurray.co.uk/delay/2000/url/https://jsonplaceholder.typicode.com/posts/1");
            console.log(chalk.cyan(JSON.stringify(result.data)));
        })
    install.command("group <key>")
        .alias("g")
        .option("-g , --group-buds <key>", "the group to install to", "main")
        .description("installs a group and all its templates", {
            key: 'Key of the group to install',
        })
        .action(async function (key, g) {
            console.log(key, g);
            const result = await axios.get<Post>("http://slowwly.robertomurray.co.uk/delay/2000/url/https://jsonplaceholder.typicode.com/posts/1");
            console.log(chalk.cyan(JSON.stringify(result.data)));
        })

}
