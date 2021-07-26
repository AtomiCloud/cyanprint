import { CyanParser } from "../../src/classLibrary/EvaluationStage/CyanParser";
import { CyanObject, CyanSafe, Glob } from "../../types/classLibrary/interfaces/interfaces";
import { CyanFlag, CyanVariable } from "../../src/classLibrary/interfaces/interfaces";

const cyanParser = new CyanParser();

const globsArray: Glob[] = [
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
]

const cyanVariable: CyanVariable = {
    a: "Roses",
    b: {
        c: "Violets",
        d: {
            e: "please",
            f: "Apples"
        }
    },
    g: "Oreos"
};

const fullCyanObject: Partial<CyanObject> = {
    globs: globsArray,
    copyOnly: globsArray,
    variable: cyanVariable,
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

const alternativeCyanObject: Partial<CyanObject> = {
    globs: { // Partial Glob
        root: "./Template/Common/",
        pattern: ".gitlab-ci.yml",
        skip: {
            variableResolver: {metadata: true},
            inlineResolver: {metadata: true}
        },
        ignore: "**/postcss.config.js"
    },
    copyOnly: { // Partial Glob
        root: "./Template/Common/",
        pattern: ".gitlab-ci.yml",
        skip: {
            variableResolver: {metadata: true},
            inlineResolver: {metadata: true}
        },
        ignore: "**/postcss.config.js"
    },
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
    guid: "6de0a74e-70a9-4cfc-be14-04789ecd44fa",
    syntax: ["##", "}"],
    plugins: {"api.cyanprint.dev": ["npm, c#", "github"]},
    comments: "//",
    pluginData: null
}

const partialCyanObject: Partial<CyanObject> = {}

describe("CyanParser", () => {
    describe("Parse", () => {

        it("should convert similar CyanObject to a CyanSafe object properly", () => {
            const actual: CyanSafe = cyanParser.Parse(fullCyanObject);
        });

        it('should convert CyanObject with single value in fields to a CyanSafe object properly as an array', () => {

        });

        it('should convert CyanObject pluginData correctly', () => {

        });
    });
});
