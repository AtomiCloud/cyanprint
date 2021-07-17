import { CyanObject, CyanSafe, ICyanParser, Syntax } from "../interfaces/interfaces";
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

        if (cyanObject.globs) defaultCyanSafe.globs = _.concat([], cyanObject.globs);
        if (cyanObject.copyOnly) defaultCyanSafe.copyOnly = _.concat([], cyanObject.copyOnly);
        if (cyanObject.variable) defaultCyanSafe.variable = cyanObject.variable;
        if (cyanObject.flags) defaultCyanSafe.flags = cyanObject.flags;
        if (cyanObject.guid) defaultCyanSafe.guid = _.concat([], cyanObject.guid);
        if (cyanObject.syntax) {
            defaultCyanSafe.syntax = _.chunk(_.flattenDeep(cyanObject.syntax), 2) as Syntax[];
        }
        if (cyanObject.plugins) defaultCyanSafe.plugins = cyanObject.plugins;
        if (cyanObject.comments) defaultCyanSafe.comments = _.concat([], cyanObject.comments);
        if (cyanObject.pluginData) defaultCyanSafe.pluginData = cyanObject.pluginData;

        return defaultCyanSafe;
    }
}

export { CyanParser }
