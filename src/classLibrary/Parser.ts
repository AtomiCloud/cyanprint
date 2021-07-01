import { IParsingStrategy, 
    VirtualFileSystemInstance,
    CyanSafe
} from "./interfaces/interfaces";
import chalk from "chalk";
import { GuidResolver } from "./ParsingStrategies/GuidResolver";
import { IfElseResolver } from "./ParsingStrategies/IfElseResolver";
import { InlineFlagResolver } from "./ParsingStrategies/InlineFlagResolver";
import { VariableResolver } from "./ParsingStrategies/VariableResolver";
import { Utility } from "./Utility/Utility";
import {Bar, Presets} from "cli-progress";

//taken from kirinnee/CyanPrint (to be edited later if needed)
class Parser {
    private flagCounter: Map<string, number>;
	private variableCounter: Map<string, number>;
	private guidCounter: Map<string, number>;
	private readonly strategies: IParsingStrategy[];
	private readonly settings: CyanSafe;
    private readonly util: Utility;


    constructor(util: Utility, strategies: IParsingStrategy[], settings: CyanSafe) {
		this.strategies = strategies;
		this.settings = settings;
        this.util = util;
		this.flagCounter = util.FlattenBooleanValueObject(settings.flags).MapValue(() => 0);
		this.variableCounter = util.FlattenStringValueObject(settings.variable).MapValue(() => 0);
		this.guidCounter = settings.guid.AsKey((() => 0));
	}

    ParseFiles(files: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		for (let i = 0; i < this.strategies.length; i++) {
			let strategy = this.strategies[i];
			files = strategy.ResolveFiles(this.settings, files);
		}
		return files;
	}

    private CountFiles(files: VirtualFileSystemInstance[]): void {
		for (let i = 0; i < this.strategies.length; i++) {
			let strategy = this.strategies[i];
			switch (typeof(strategy)) {
				case typeof(InlineFlagResolver):
					this.flagCounter = this.util.IncreaseInMap(this.flagCounter, strategy.Count(this.settings, files));
					break;
                case typeof(IfElseResolver):
                    this.flagCounter = this.util.IncreaseInMap(this.flagCounter, strategy.Count(this.settings, files));
                    break;
				case typeof(GuidResolver):
					this.guidCounter = strategy.Count(this.settings, files);
					break;
				case typeof(VariableResolver):
					this.variableCounter = strategy.Count(this.settings, files);
					break;
				default:
					throw new Error("Unknown flag type!");
			}
		}
	}

    /**
	 * Counts the occurrences of things that need to be replaced
	 * returns true if its all ok
	 * returns false if there are variables or flags unused
	 * @param files the files
	 * @constructor
	 */
	CountOccurence(files: VirtualFileSystemInstance[]): boolean {
		
		//Count occurrences and add to counting map
		this.CountFiles(files);
		//remove cyan.docs occurrences
		this.flagCounter = this.flagCounter.Where((k: string) => k.Take(10) !== "cyan.docs.");
		this.variableCounter = this.variableCounter.Where((k: string) => k.Take(10) !== "cyan.docs.").Where((k: string) => k.Take(12) !== "cyan.folder.");
		
		//Display occurrence's stats to user
		let flagZeroes: string[] = this.DisplayOccurrences("flag", this.flagCounter);
		let varZeroes: string[] = this.DisplayOccurrences("variables", this.variableCounter);
		let guidZeroes: string[] = this.DisplayOccurrences("Guid", this.guidCounter);
		if (flagZeroes.length > 0 || varZeroes.length > 0 || guidZeroes.length > 0) {
			console.log(chalk.yellowBright(`===========\n WARNING\n===========`));
			this.Warn("flags", flagZeroes);
			this.Warn("variables", varZeroes);
			this.Warn("Guid", guidZeroes);
			return false;
		}
		return true;
	}

    
    CountPossibleRemains(files: VirtualFileSystemInstance[]): void {
		let unaccounted: string[] = this.strategies
			.Map((s: IParsingStrategy) => s.CountPossibleUnaccountedFlags(this.settings, files))
			.Flatten();
		if (unaccounted.length > 0) {
			console.log(chalk.redBright("WARNING: LIST OF POSSIBLE UNUSED VARIABLES"));
			unaccounted.TrimAll().Each((s: string) => console.log("\t" + chalk.red(s)));
		}
	}
	
	ParseContent(files: VirtualFileSystemInstance[]): VirtualFileSystemInstance[] {
		//Announce start of parsing
		console.log(chalk.cyanBright("Parsing templates..."));
		
		//Generate loading bar
		let bar: Bar = new Bar({}, Presets.shades_grey);
		let counter: number = 0;
		bar.start(this.strategies.length, 0);
		
		for (let i = 0; i < this.strategies.length; i++) {
			let strategy = this.strategies[i];
			files = strategy.ResolveContents(this.settings, files);
			counter++;
			bar.update(counter);
		}
		bar.stop();
		console.log(chalk.greenBright("Completed parsing templates!"));
		return files;
	}
	

    DisplayOccurrences(type: string, map: Map<string, number>): string[] {
		let ret: string[] = [];
		if (map.size > 0) {
			console.log(chalk.cyanBright(`======================================\n  Number of occurrences of ${type}:\n======================================`));
			map.Each((s: string, v: number) => {
				if (v > 0) {
					console.log(chalk.greenBright(s) + ": " + chalk.yellowBright(v.toString()));
				} else {
					ret.push(s);
					console.log(chalk.redBright(`[Warning - this ${type} has no occurrence]: `) + chalk.yellowBright(s));
				}
			});
		}
		return ret;
	}
	
	Warn(type: string, variables: string[]) {
		if (variables.length > 0) {
			console.log(chalk.redBright(`[Warning] The following ${type} do not exist in the template`));
			variables.Map((s: string) => console.log("\t" + chalk.red(s)));
		}
	}
	
}