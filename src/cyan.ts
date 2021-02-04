import {Core, Kore} from "@kirinnee/core";
import program from "commander";

let core: Core = new Kore();
core.ExtendPrimitives();

declare  global {
	const VERSION: string
	
}
program
	.on('command:*', function () {
		console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
		process.exit(1);
	});


program
	.version(VERSION)
	.description("Templating engine to generate and scaffold production ready code");

program.parse(process.argv);

let NO_COMMAND_SPECIFIED = program.args.length === 0;

if (NO_COMMAND_SPECIFIED) {
	program.help();
}
