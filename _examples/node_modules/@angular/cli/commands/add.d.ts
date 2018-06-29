import { CommandScope, Option } from '../models/command';
import { SchematicCommand } from '../models/schematic-command';
export default class AddCommand extends SchematicCommand {
    readonly name: string;
    readonly description: string;
    readonly allowPrivateSchematics: boolean;
    scope: CommandScope;
    arguments: string[];
    options: Option[];
    private _parseSchematicOptions(collectionName);
    validate(options: any): boolean;
    run(options: any): Promise<number | void>;
}
