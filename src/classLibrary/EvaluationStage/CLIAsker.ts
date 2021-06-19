import { IAsker } from "../interfaces/interfaces";
import inquirer, { Answers, Questions } from "inquirer";

class CLIAsker implements IAsker {
    AskAsCheckbox(): Promise<object> {
        return Promise.resolve({});
    }

    AskAsList(): Promise<object> {
        return Promise.resolve({});
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
