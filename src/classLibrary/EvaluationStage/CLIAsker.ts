import { IAsker } from "../interfaces/interfaces";

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

    AskPredicate(): Promise<Boolean> {
        return Promise.resolve(false);
    }

}

export { CLIAsker };
