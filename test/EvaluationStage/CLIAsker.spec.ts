import { CLIAsker } from "../../src/classLibrary/EvaluationStage/CLIAsker";
import inquirer from "inquirer";
import sinon, { SinonSandbox } from "sinon";
import { expect } from "chai";

const cliAsker: CLIAsker = new CLIAsker();

describe("CLIAsker", () => {
    describe("AskPredicate", () => {
        let sandbox: SinonSandbox;
        before(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore()
        })

        it("should return the right answer when user chooses Yes", async () => {
            const expected = {predicate: "Yes"};
            sandbox.stub(inquirer, 'prompt').resolves(expected);
            const answer = await cliAsker.AskPredicate("This is a test question");
            expect(answer).to.equal(true);
        });

        it("should return the right answer when user chooses No", async () => {
            const expected = {predicate: "No"};
            sandbox.stub(inquirer, 'prompt').resolves(expected);
            const answer = await cliAsker.AskPredicate("This is a test question");
            expect(answer).to.equal(false);
        });

        it("should return the right answer when user chooses custom Yes option", async () => {
            const expected = {predicate: "CustomYes"};
            sandbox.stub(inquirer, 'prompt').resolves(expected);
            const answer = await cliAsker.AskPredicate("This is a custom test question", "CustomYes", "CustomNo");
            expect(answer).to.equal(true);
        });

        it("should return the right answer when user chooses custom No option", async () => {
            const expected = {predicate: "CustomNo"};
            sandbox.stub(inquirer, 'prompt').resolves(expected);
            const answer = await cliAsker.AskPredicate("This is a custom test question", "CustomYes", "CustomNo");
            expect(answer).to.equal(false);
        });
    });
});
