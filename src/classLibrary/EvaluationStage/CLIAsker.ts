import { IAsker, InputAsTextInputType, InputsAsListType } from "../interfaces/interfaces";
import inquirer, { Answers, Question, Questions } from "inquirer";
import { Utility } from "../Utility/Utility";

class CLIAsker implements IAsker {
    private util: Utility;

    constructor(util: Utility) {
        this.util = util;
    }

    async AskAsCheckbox(options: InputsAsListType, question: string): Promise<{ [s: string]: boolean }> {
        const mappedOptions: Map<string, string> = this.util.FlattenStringValueObject(options);
        const questionObject: Question = {
            type: "checkbox",
            name: "selected",
            message: question,
            choices: mappedOptions.Values()
        };
        const answer: Answers = await inquirer.prompt([
            questionObject
        ]);

        const flagsMap: Map<string, boolean> = mappedOptions.MapValue(option => answer["selected"].Has(option));
        return Promise.resolve(Object.fromEntries(flagsMap));
    }

    async AskAsList(options: InputsAsListType, question: string): Promise<{ [s: string]: boolean }> {
        const mappedOptions: Map<string, string> = this.util.FlattenStringValueObject(options);
        const questionObject: Question = {
            type: "list",
            name: "selected",
            message: question,
            choices: mappedOptions.Values()
        };
        const answer: Answers = await inquirer.prompt([
            questionObject
        ]);

        const flagsMap: Map<string, boolean> = mappedOptions.MapValue(option => answer["selected"] === option);
        return Promise.resolve(Object.fromEntries(flagsMap));
    }

    async AskForInput(options: InputAsTextInputType): Promise<object> {
        const mappedOptions: Map<string, [string, string]> = new Map(Object.entries(options));
        const questionObjects: Questions = mappedOptions
            .Map((flag: string, questionWithDefaultValue: [string, string]) => this.MakeInputQuestion(flag, questionWithDefaultValue))
        const answer: Answers = await inquirer.prompt(questionObjects);
        const flagsMap: Map<string, string> = mappedOptions.MapValue((options, flag) => answer[flag]);
        return Promise.resolve(Object.fromEntries(flagsMap));
    }

    async AskPredicate(question: string, yesOption: string = "Yes", noOption: string = "No"): Promise<Boolean> {
        const questionObject: Question = {
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

    private MakeInputQuestion(flag: string, questionWithDefaultValue: [string, string]): Question {
        const [message, defaultValue] = questionWithDefaultValue;
        return {
            type: "input",
            message,
            name: flag,
            default: defaultValue
        };
    }

}

export { CLIAsker };
