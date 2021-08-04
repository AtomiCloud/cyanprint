import { CLIAsker } from "../../src/classLibrary/EvaluationStage/CLIAsker";
import inquirer from "inquirer";
import sinon, { SinonSandbox } from "sinon";
import { Core, Kore } from "@kirinnee/core";
import { InputAsTextInputType, InputsAsListType } from "../../src/classLibrary/interfaces/interfaces";
import { Utility } from "../../src/classLibrary/Utility/Utility";

let core: Core = new Kore();
core.ExtendPrimitives();

const utility: Utility = new Utility(core);
const cliAsker: CLIAsker = new CLIAsker(utility);

describe("CLIAsker", () => {
    describe("AskPredicate", () => {
        let sandbox: SinonSandbox;
        beforeAll(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore()
        });

        it("should return the right answer when user chooses Yes", async () => {
            const stubReply = {predicate: "Yes"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a test question");
            expect(answer).toBe(true);
        });

        it("should return the right answer when user chooses No", async () => {
            const stubReply = {predicate: "No"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a test question");
            expect(answer).toBe(false);
        });

        it("should return the right answer when user chooses custom Yes option", async () => {
            const stubReply = {predicate: "CustomYes"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a custom test question", "CustomYes", "CustomNo");
            expect(answer).toBe(true);
        });

        it("should return the right answer when user chooses custom No option", async () => {
            const stubReply = {predicate: "CustomNo"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);
            const answer = await cliAsker.AskPredicate("This is a custom test question", "CustomYes", "CustomNo");
            expect(answer).toBe(false);
        });
    });

    describe("AskAsList", () => {
        let sandbox: SinonSandbox;
        beforeAll(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore()
        });

        it("should return the right selection from user", async () => {
            const stubReply = {selected: "Amazon Web Service"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputsAsListType = {
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
            expect(answer).toStrictEqual(expected);
        });

        it("should return the right keys for nested options", async () => {
            const stubReply = {selected: "Amazon Web Service"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputsAsListType = {
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
            expect(answer).toStrictEqual(expected);
        });

        it("should return the right answer if the selected answer is nested", async () => {
            const stubReply = {selected: "GCP Compute Engine"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputsAsListType = {
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
            expect(answer).toStrictEqual(expected);
        });
    });

    describe("AskAsCheckbox", () => {
        let sandbox: SinonSandbox;
        beforeAll(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore()
        });

        it("should return the right selections from user", async () => {
            const stubReply = {selected: ["Amazon Web Service", "Google Cloud Platform"]};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputsAsListType = {
                aws: "Amazon Web Service",
                azure: "Azure Blob Storage",
                gcp: "Google Cloud Platform",
                do: "Digital Ocean Spaces",
            }
            const answer = await cliAsker.AskAsCheckbox(options, "Which provider do you want to use?");
            const expected = {
                aws: true,
                azure: false,
                gcp: true,
                do: false
            }
            expect(answer).toStrictEqual(expected);
        });

        it("should return the right keys for nested options", async () => {
            const stubReply = {selected: ["Amazon Web Service", "GCP Compute Engine", "Digital Ocean Spaces"]};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputsAsListType = {
                aws: "Amazon Web Service",
                azure: "Azure Blob Storage",
                gcp: {
                    compute: "GCP Compute Engine",
                    storage: "GCP Cloud Storage",
                },
                do: "Digital Ocean Spaces",
            }
            const answer = await cliAsker.AskAsCheckbox(options, "Which provider do you want to use?");
            const expected = {
                "aws": true,
                "azure": false,
                "gcp.compute": true,
                "gcp.storage": false,
                "do": true
            }
            expect(answer).toStrictEqual(expected);
        });

        it("should return the right answers if the selected answer is nested", async () => {
            const stubReply = {selected: ["GCP Compute Engine", "GCP Cloud Storage", "Azure Blob Storage"]};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputsAsListType = {
                aws: "Amazon Web Service",
                azure: "Azure Blob Storage",
                gcp: {
                    compute: "GCP Compute Engine",
                    storage: "GCP Cloud Storage",
                },
                do: "Digital Ocean Spaces",
            }
            const answer = await cliAsker.AskAsCheckbox(options, "Which provider do you want to use?");
            const expected = {
                "aws": false,
                "azure": true,
                "gcp.compute": true,
                "gcp.storage": true,
                "do": false
            }
            expect(answer).toStrictEqual(expected);
        });
    });

    describe("AskForInput", () => {
        let sandbox: SinonSandbox;
        beforeAll(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore()
        });

        it("should return the right answer from user", async () => {
            const stubReply = {deploy: "Very fancy and secret bucket name"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputAsTextInputType = {
                deploy: ["Random Default Bucket name", "Enter the bucket name"]
            };
            const answer = await cliAsker.AskForInput(options);
            const expected = {
                deploy: "Very fancy and secret bucket name"
            }
            expect(answer).toStrictEqual(expected);
        });

        it("should return the right answers if there are multiple questions", async () => {
            const stubReply = {
                deploy: "Very fancy and secret bucket name",
                aws_region: "ap-southeast-1"
            };
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const options: InputAsTextInputType = {
                deploy: ["Random Default Bucket name", "Enter the bucket name:"],
                aws_region: ["ap-southeast-1", "Which AWS region do you use?"]
            };
            const answer = await cliAsker.AskForInput(options);
            const expected = {
                deploy: "Very fancy and secret bucket name",
                aws_region: "ap-southeast-1"
            }
            expect(answer).toStrictEqual(expected);
        });
    });
});
