import { Command, Option } from '../models/command';
export default class VersionCommand extends Command {
    readonly name: string;
    readonly description: string;
    static aliases: string[];
    readonly arguments: string[];
    readonly options: Option[];
    run(_options: any): void;
    private getVersion(moduleName, projectNodeModules, cliNodeModules);
}
