import { CommandScope, Option } from '../models/command';
import { ArchitectCommand, ArchitectCommandOptions } from '../models/architect-command';
export default class RunCommand extends ArchitectCommand {
    readonly name: string;
    readonly description: string;
    readonly scope: CommandScope;
    readonly arguments: string[];
    readonly options: Option[];
    run(options: ArchitectCommandOptions): Promise<number>;
}
