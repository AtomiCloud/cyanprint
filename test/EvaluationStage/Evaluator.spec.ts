import { should } from 'chai';
import { Evaluator } from "../../src/classLibrary/EvaluationStage/Evaluator";
import { CyanParser } from "../../src/classLibrary/EvaluationStage/CyanParser";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import { CLIAsker } from "../../src/classLibrary/EvaluationStage/CLIAsker";
import { Core, Kore } from "@kirinnee/core";
import { CyanFlag, CyanSafe, CyanVariable } from "../../src/classLibrary/interfaces/interfaces";
import sinon, { SinonSandbox } from "sinon";
import inquirer from "inquirer";
import path from "path";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

const cyanParser = new CyanParser();
const evaluator = new Evaluator(cyanParser);
const utility: Utility = new Utility(core);
const cliAsker: CLIAsker = new CLIAsker(utility);


describe("Evaluator", () => {
    describe("Evaluate", () => {
        let sandbox: SinonSandbox;
        before(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => {
            sandbox.restore();
        });

        it("Should be able to evaluate a CyanScript and return the correct CyanSafe object", async () => {
            const stubReply = {name: "Kirito Lombok"};
            sandbox.stub(inquirer, 'prompt').resolves(stubReply);

            const templatePath = path.resolve(__dirname);
            const actual: CyanSafe = await evaluator.Evaluate(templatePath, "SampleFolderName", cliAsker, null);

            const expected: CyanSafe = {
                globs: [
                    {
                        root: "./Template",
                        pattern: "**/*.*",
                        skip: {},
                        ignore: ""
                    }
                ],
                copyOnly: [],
                variable: {
                    name: "Kirito Lombok"
                } as CyanVariable,
                flags: {} as CyanFlag,
                guid: [],
                syntax: [],
                plugins: {},
                comments: [],
                pluginData: {}
            };

            actual.should.deep.equal(expected);
        });
    });
});

