import { CommandScope, Option } from '../models/command';
import { ArchitectCommand, ArchitectCommandOptions } from '../models/architect-command';
export default class TestCommand extends ArchitectCommand {
    readonly name: string;
    readonly target: string;
    readonly description: string;
    static aliases: string[];
    readonly scope: CommandScope;
    readonly multiTarget: boolean;
    readonly options: Option[];
    run(options: ArchitectCommandOptions): Promise<number>;
}
