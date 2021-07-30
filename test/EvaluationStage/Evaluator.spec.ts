import { should } from 'chai';
import { Evaluator } from "../../src/classLibrary/EvaluationStage/Evaluator";
import { CyanParser } from "../../src/classLibrary/EvaluationStage/CyanParser";
import { Utility } from "../../src/classLibrary/Utility/Utility";
import { CLIAsker } from "../../src/classLibrary/EvaluationStage/CLIAsker";
import { Core, Kore } from "@kirinnee/core";
import { CyanFlag, CyanSafe, CyanVariable } from "../../src/classLibrary/interfaces/interfaces";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

const cyanParser = new CyanParser();
const evaluator = new Evaluator(cyanParser);
const utility: Utility = new Utility(core);
const cliAsker: CLIAsker = new CLIAsker(utility);


describe("Evaluator", () => {
    describe("Evaluate", () => {

        it("Should be able to evaluate a CyanScript and return the correct CyanSafe object", async () => {
            const actual: CyanSafe = await evaluator.Evaluate("./", "SampleFolderName", cliAsker, null);

            const expected: CyanSafe = {
                globs: [
                    { // Fully initialized Glob
                        root: "./Template",
                        pattern: ["**/*.*", "**/.*"],
                        skip: {
                            variableResolver: {metadata: true, content: true},
                            inlineResolver: {metadata: true, content: true},
                            ifElseResolver: {metadata: true, content: true},
                            guidResolver: {metadata: true, content: true},
                            custom: {}
                        },
                        ignore: ["**/Javascript/**/*", "**/Typescript/**/*", "**/Common/**/*"]
                    },
                    { // Partial Glob
                        root: "./Template/Common/",
                        pattern: ".gitlab-ci.yml",
                        skip: {
                            variableResolver: {metadata: true},
                            inlineResolver: {metadata: true}
                        },
                        ignore: "**/postcss.config.js"
                    }
                ],
                copyOnly: [{ // Partial Glob
                    root: "./Template/Common/",
                    pattern: ".gitlab-ci.yml",
                    skip: {
                        variableResolver: {metadata: true},
                        inlineResolver: {metadata: true}
                    },
                    ignore: "**/postcss.config.js"
                }],
                variable: {
                    a: "Roses",
                    b: {
                        c: "Violets",
                        d: {
                            e: "please",
                            f: "Apples"
                        }
                    },
                    g: "Oreos"
                } as CyanVariable,
                flags: {
                    a: true,
                    b: {
                        c: true,
                        d: {
                            e: false,
                            f: false
                        }
                    },
                    g: true
                } as CyanFlag,
                guid: ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", "bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1"],
                syntax: [["~", "~"], ["{", "}"], ["#", "#"], ["##", "}"]],
                plugins: {"api.cyanprint.dev": ["npm, c#", "github"]},
                comments: ["//", "##"],
                pluginData: {"randomPlugin": "asdf"}
            };

            actual.should.deep.equal(expected);
        });
    });
});

