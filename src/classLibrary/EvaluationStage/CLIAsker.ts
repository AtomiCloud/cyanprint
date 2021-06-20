import { IAsker, ListInputs } from "../interfaces/interfaces";
import inquirer, { Answers, Questions } from "inquirer";
import { Utility } from "../Utility/Utility";

class CLIAsker implements IAsker {
    private util: Utility;

    constructor(util: Utility) {
        this.util = util;
    }

    AskAsCheckbox(): Promise<object> {
        return Promise.resolve({});
    }

    async AskAsList(options: ListInputs, question: string): Promise<object> {
        const mappedOptions: Map<string, string> = this.util.FlattenObject(options);
        const questionObject: Questions = {
            type: "list",
            name: "selected",
            message: question,
            choices: mappedOptions.Values()
        };
        const answer: Answers = await inquirer.prompt([
            questionObject
        ]);

        const flagsMap: Map<string, boolean> = mappedOptions.MapValue(value => answer["selected"] === value);
        return Promise.resolve(Object.fromEntries(flagsMap));
    }

    AskForInput(): Promise<object> {
        return Promise.resolve({});
    }

    async AskPredicate(question: string, yesOption: string = "Yes", noOption: string = "No"): Promise<Boolean> {
        const questionObject: Questions = {
            type: "list",
            choices: [yesOption, noOption],
            name: "predicate",
            message: question
        };
        const answer: Answers = await inquirer.prompt([
            questionObject
        ]);
        return answer["predicate"] === yesOption;
    }

}

export { CLIAsker };
