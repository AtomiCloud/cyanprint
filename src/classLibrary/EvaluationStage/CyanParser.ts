import { CyanObject, CyanSafe, Glob, GlobSafe, ICyanParser, Syntax } from "../interfaces/interfaces";
import _ from "lodash";

class CyanParser implements ICyanParser {

    Parse(cyanObject: Partial<CyanObject>): CyanSafe {
        let defaultCyanSafe: CyanSafe = {
            globs: [],
            copyOnly: [],
            variable: {},
            flags: {},
            guid: [],
            syntax: [],
            plugins: {},
            comments: [],
            pluginData: {}
        }

        if (cyanObject.globs) {
            const tempArray: Glob[] = ([] as Glob[]).Add(cyanObject.globs);
            defaultCyanSafe.globs = tempArray.map((value) => this.ParseGlobToGlobSafe(value));
        }
        if (cyanObject.copyOnly) {
            const tempArray: Glob[] = ([] as Glob[]).Add(cyanObject.copyOnly);
            defaultCyanSafe.copyOnly = tempArray.map((value) => this.ParseGlobToGlobSafe(value));
        }
        if (cyanObject.variable) defaultCyanSafe.variable = cyanObject.variable;
        if (cyanObject.flags) defaultCyanSafe.flags = cyanObject.flags;
        if (cyanObject.guid) defaultCyanSafe.guid = ([] as string[]).Add(cyanObject.guid);
        if (cyanObject.syntax) {
            defaultCyanSafe.syntax = _.chunk(cyanObject.syntax.flat(), 2) as Syntax[];
        }
        if (cyanObject.plugins) defaultCyanSafe.plugins = cyanObject.plugins;
        if (cyanObject.comments) defaultCyanSafe.comments = ([] as string[]).Add(cyanObject.comments);
        if (cyanObject.pluginData) defaultCyanSafe.pluginData = cyanObject.pluginData;

        return defaultCyanSafe;
    }

    private ParseGlobToGlobSafe(glob: Glob): GlobSafe {
        return {
            root: glob.root,
            pattern: ([] as string[]).Add(glob.pattern),
            skip: _.defaultsDeep(glob.skip, {
                custom: {},
                guidResolver: {},
                ifElseResolver: {},
                inlineResolver: {},
                variableResolver: {},
            }),
            ignore: ([] as string[]).Add(glob.ignore)
        }
    }
}

export { CyanParser }
