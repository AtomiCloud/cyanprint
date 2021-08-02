import { CyanObject, CyanSafe, Glob, ICyanParser, Syntax } from "../interfaces/interfaces";
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

        if (cyanObject.globs) defaultCyanSafe.globs = ([] as Glob[]).Add(cyanObject.globs);
        if (cyanObject.copyOnly) defaultCyanSafe.copyOnly = ([] as Glob[]).Add(cyanObject.copyOnly);
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
}

export { CyanParser }
