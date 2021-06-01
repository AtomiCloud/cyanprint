import { of, Union } from "ts-union";

type Syntax = [string,string] // [open, close] , [ ["~", "~"] , ["{{"], ["}}"]]

interface CyanObject {
	globs: Glob[] | Glob;
	copyOnly: Glob[] | Glob; // Doesn't go through parser
	variable: object; // { a: "Roses", b: { c: "Violets", d: "please" } }
	flags: object; // { remove: { one: true, two: false } }
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
	variable: object;
	flags: object;
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

const FileContent = Union({
	String: of<string>(),
	Buffer: of<Buffer>(),
});

type FileContent = typeof FileContent.T;

interface FileSystemInstance {
	metadata: IFileSystemInstanceMetadata;
	content: FileContent;
	parseContent: boolean;
	parseMetadata: boolean;
}

interface DirectorySystemInstance {
	metadata: IFileSystemInstanceMetadata;
	parseMetadata: boolean;
}

const VirtualFileSystemInstance = Union({
	File: of<FileSystemInstance>(),
	Folder: of<DirectorySystemInstance>(),
});

type VirtualFileSystemInstance = typeof VirtualFileSystemInstance.T;

interface Glob {
	root: string;
	pattern: string[] | string;
	ignore: string | string[];
}

// TODO may need further review
interface IGlobFactory {
	GenerateFiles(glob: Glob, target: string): IFileSystemInstanceMetadata[];

	// Callback is used to bump progress
	ReadFiles(files: IFileSystemInstanceMetadata[], callback?: Function): Promise<FileSystemInstance[]>;
}

// TODO may need further review
interface IFileFactory {
	CreateFileSystemInstance(relativePath: string, from?: string, to?: string): IFileSystemInstanceMetadata;

	// Callback is used to bump progress
	ReadFile(file: IFileSystemInstanceMetadata, callback?: Function): Promise<FileSystemInstance>;
}

interface IParsingStrategy {
	ResolveContents(cyan: CyanSafe, files: VirtualFileSystemInstance[]): VirtualFileSystemInstance[];

	Count(cyan: CyanSafe, files: VirtualFileSystemInstance[]): Map<string, number>;

	ResolveFiles(cyan: CyanSafe, files: VirtualFileSystemInstance[]): VirtualFileSystemInstance[];
}

export {
	Glob,
	Syntax,
	CyanObject,
	CyanSafe,
	ICyanParser,
	IFileSystemInstanceMetadata,
	FileSystemInstance,
	IGlobFactory,
	IFileFactory,
	IParsingStrategy,
	FileContent,
	DirectorySystemInstance,
	VirtualFileSystemInstance
};
