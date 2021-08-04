import { CyanObject, CyanSafe, IAsker, ICyanParser, IEvaluator } from "../interfaces/interfaces";
import path from "path";

class Evaluator implements IEvaluator {

    private cyanParser: ICyanParser;

    constructor(cyanParser: ICyanParser) {
        this.cyanParser = cyanParser;
    }

    /**
     * Locates the specific cyan.config.ts file within specific template and executes it
     */
    async Evaluate(templatePath: string, folderName: string, asker: IAsker, previousAnswers: any): Promise<CyanSafe> {
        // Always look for cyan.config.js, user's responsibility to transpile from TS to JS
        const absoluteConfigFilePath = path.resolve(templatePath, "./cyan.config.js");
        const relativeConfigPath = path.relative(__dirname, absoluteConfigFilePath);

        // TODO Include Execute logic where it can execute a separate a separate config file

        const CyanScript: (folderName: string, asker: IAsker) => Promise<CyanObject>
            = eval(`require("${relativeConfigPath.ReplaceAll("\\\\", "/", true)}")`);
        const cyanObject: CyanObject = await CyanScript(folderName, asker);

        return this.cyanParser.Parse(cyanObject);
    }

}

export { Evaluator };
