import {Core, Kore} from "@kirinnee/core";
import program from "commander";

let core: Core = new Kore();
core.ExtendPrimitives();


program
	.version("0.0.1")
	.description("Templating engine to generate and scaffold production ready code");

program.parse(process.argv);

Program().then();

async function Program() {

}
