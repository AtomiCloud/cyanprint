import { CLIAsker } from "../../src/classLibrary/EvaluationStage/CLIAsker";
import inquirer from "inquirer";
import sinon, { SinonSandbox } from "sinon";
import { should } from "chai";
import { Core, Kore } from "@kirinnee/core";
import { ListInputs } from "../../src/classLibrary/interfaces/interfaces";
import { Utility } from "../../src/classLibrary/Utility/Utility";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

const utility: Utility = new Utility(core);
const cliAsker: CLIAsker = new CLIAsker(utility);

describe("CLIAsker", () => {
    describe("AskPredicate", () => {
        let sandbox: SinonSandbox;
        before(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore()
        });

        it("should return the right answer when user chooses Yes", async () => {
            const stubReply = {predicate: "Yes"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a test question");
            answer.should.equal(true);
        });

        it("should return the right answer when user chooses No", async () => {
            const stubReply = {predicate: "No"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a test question");
            answer.should.equal(false);
        });

        it("should return the right answer when user chooses custom Yes option", async () => {
            const stubReply = {predicate: "CustomYes"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a custom test question", "CustomYes", "CustomNo");
            answer.should.equal(true);
        });

        it("should return the right answer when user chooses custom No option", async () => {
            const stubReply = {predicate: "CustomNo"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a custom test question", "CustomYes", "CustomNo");
            answer.should.equal(false);
        });
    });

    describe("AskAsList", () => {
        let sandbox: SinonSandbox;
        before(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore()
        });

        it("should return the right selection from user", async () => {
            const stubReply = {selected: "Amazon Web Service"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: ListInputs = {
                aws: "Amazon Web Service",
                azure: "Azure Blob Storage",
                gcp: "Google Cloud Platform",
                do: "Digital Ocean Spaces",
            }
            const answer = await cliAsker.AskAsList(options, "Which provider do you want to use?");
            const expected = {
                aws: true,
                azure: false,
                gcp: false,
                do: false
            }
            answer.should.deep.equal(expected);
        });

        it("should return the right keys for nested options", async () => {
            const stubReply = {selected: "Amazon Web Service"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: ListInputs = {
                aws: "Amazon Web Service",
                azure: "Azure Blob Storage",
                gcp: {
                    compute: "GCP Compute Engine",
                    storage: "GCP Cloud Storage",
                },
                do: "Digital Ocean Spaces",
            }
            const answer = await cliAsker.AskAsList(options, "Which provider do you want to use?");
            const expected = {
                "aws": true,
                "azure": false,
                "gcp.compute": false,
                "gcp.storage": false,
                "do": false
            }
            answer.should.deep.equal(expected);
        });

        it("should return the right answer if the selected answer is nested", async () => {
            const stubReply = {selected: "GCP Compute Engine"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: ListInputs = {
                aws: "Amazon Web Service",
                azure: "Azure Blob Storage",
                gcp: {
                    compute: "GCP Compute Engine",
                    storage: "GCP Cloud Storage",
                },
                do: "Digital Ocean Spaces",
            }
            const answer = await cliAsker.AskAsList(options, "Which provider do you want to use?");
            const expected = {
                "aws": false,
                "azure": false,
                "gcp.compute": true,
                "gcp.storage": false,
                "do": false
            }
            answer.should.deep.equal(expected);
        });
    });
});
