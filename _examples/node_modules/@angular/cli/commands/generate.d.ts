import { CommandScope, Option } from '../models/command';
import { SchematicCommand } from '../models/schematic-command';
export default class GenerateCommand extends SchematicCommand {
    readonly name: string;
    readonly description: string;
    static aliases: string[];
    readonly scope: CommandScope;
    arguments: string[];
    options: Option[];
    private initialized;
    initialize(options: any): Promise<void>;
    validate(options: any): boolean | Promise<boolean>;
    run(options: any): Promise<number | void>;
    private parseSchematicInfo(options);
    printHelp(options: any): void;
}
