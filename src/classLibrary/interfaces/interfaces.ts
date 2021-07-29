import { of, Union } from "ts-union";

type Syntax = [string,string] // [open, close] , [ ["~", "~"] , ["{{"], ["}}"]]
type CyanFlag = { [s:string] : boolean | CyanFlag }
type  CyanVariable = { [s:string] : string | CyanVariable }

interface CyanObject {
    globs: Glob[] | Glob;
    copyOnly: Glob[] | Glob; // Doesn't go through parser
    variable: CyanVariable; // { a: "Roses", b: { c: "Violets", d: "please" } }
    flags: CyanFlag; // { remove: { one: true, two: false } }
    guid: string[] | string; // ["asdf-asdf-asdf-asdf", "1234'1234'1234"]
    syntax: Syntax[] | Syntax;
    plugins: { [s: string]: string[] }; // {"api.cyanprint.dev": ["npm, c#", "github"]}
    comments: string[] | string; // remove these strings if cyanprint templates starts with them
    pluginData: object | null | undefined;
}

// Parsed version
interface CyanSafe {
    globs: Glob[];
    copyOnly: Glob[];
    variable: CyanVariable;
    flags: CyanFlag;
    guid: string[];
    syntax: Syntax[];
    plugins: { [s: string]: string[] };
    comments: string[];
    pluginData: object;
}

interface ICyanParser {
    Parse(p: Partial<CyanObject>): CyanSafe;
}

interface IFileSystemInstanceMetadata {
    sourceAbsolutePath: string;
    destinationAbsolutePath: string;
    relativePath: string;
}

interface IGuidGenerator {
    GenerateGuid(): string;
}

const FileContent = Union({
    String: of<string>(),
    Buffer: of<Buffer>(),
});

type FileContent = typeof FileContent.T;

interface FileSystemInstance {
    metadata: IFileSystemInstanceMetadata;
    content: FileContent;
    ignore: Ignore;
}

interface DirectorySystemInstance {
    metadata: IFileSystemInstanceMetadata;
    ignore: Ignore;
}

const VirtualFileSystemInstance = Union({
    File: of<FileSystemInstance>(),
    Folder: of<DirectorySystemInstance>(),
});

type VirtualFileSystemInstance = typeof VirtualFileSystemInstance.T;

interface Glob {
    root: string;
    pattern: string[] | string;
    skip: Partial<Ignore>;
    ignore: string[] | string;
}

interface IgnoreConfig {
    metadata: boolean;
    content: boolean;
}

interface Ignore {
    variableResolver: Partial<IgnoreConfig>;
    inlineResolver: Partial<IgnoreConfig>;
    ifElseResolver: Partial<IgnoreConfig>;
    guidResolver: Partial<IgnoreConfig>;
    custom: object; // Reserved for custom parsing strategies from plugins
}

// TODO may need further review
interface IGlobFactory {
    GenerateFilesMetadata(glob: Glob, target: string): IFileSystemInstanceMetadata[];

    // Callback is used to bump progress
    ReadFiles(files: VirtualFileSystemInstance[]): Promise<VirtualFileSystemInstance[]>;
}

// TODO may need further review
interface IFileFactory {
    ToRoot: string;
    FromRoot: string;

    CreateFileSystemInstanceMetadata(relativePath: string, from?: string, to?: string): IFileSystemInstanceMetadata;

    CreateEmptyFiles(filesMetadata: IFileSystemInstanceMetadata[], ignore?: Ignore): VirtualFileSystemInstance[];

    // Callback is used to bump progress
    ReadFile(file: VirtualFileSystemInstance, callback?: Function): Promise<VirtualFileSystemInstance>;
}

interface IParsingStrategy {
    ResolveContents(cyan: CyanSafe, files: VirtualFileSystemInstance[]): VirtualFileSystemInstance[];

    Count(cyan: CyanSafe, files: VirtualFileSystemInstance[]): Map<string, number>;

    ResolveFiles(cyan: CyanSafe, files: VirtualFileSystemInstance[]): VirtualFileSystemInstance[];

    CountPossibleUnaccountedFlags(cyan: CyanSafe,files: VirtualFileSystemInstance[]): string[];
}

export {
    Glob,
    Syntax,
    CyanFlag,
    CyanVariable,
    CyanObject,
    CyanSafe,
    ICyanParser,
    IFileSystemInstanceMetadata,
    IGuidGenerator,
    FileSystemInstance,
    IGlobFactory,
    IFileFactory,
    IParsingStrategy,
    FileContent,
    DirectorySystemInstance,
    VirtualFileSystemInstance,
    Ignore
};
