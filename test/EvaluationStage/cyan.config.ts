import { CyanObject, IAsker, InputAsTextInputType } from "../../src/classLibrary/interfaces/interfaces";

export = async function (folderName: string, asker: IAsker): Promise<CyanObject> {
    const question: InputAsTextInputType = {
        name: ["kirin", "Your Name (DNS compatible)"]
    };

    const answers = await asker.AskForInput(question);

    return {
        globs: {root: "./Template", pattern: "**/*.*", skip: {}, ignore: ""},
        variable: answers,
    } as CyanObject;
}
