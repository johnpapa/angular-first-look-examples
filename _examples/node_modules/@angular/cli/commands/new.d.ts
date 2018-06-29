import { CommandScope, Option } from '../models/command';
import { SchematicCommand } from '../models/schematic-command';
export default class NewCommand extends SchematicCommand {
    readonly name: string;
    readonly description: string;
    static aliases: string[];
    scope: CommandScope;
    readonly allowMissingWorkspace: boolean;
    arguments: string[];
    options: Option[];
    private schematicName;
    private initialized;
    initialize(options: any): Promise<void>;
    run(options: any): Promise<number | void>;
    private parseCollectionName(options);
    private removeLocalOptions(options);
}
