import { CommandScope, Option } from '../models/command';
import { SchematicCommand, CoreSchematicOptions } from '../models/schematic-command';
export interface UpdateOptions extends CoreSchematicOptions {
    next: boolean;
    schematic?: boolean;
}
export default class UpdateCommand extends SchematicCommand {
    readonly name: string;
    readonly description: string;
    static aliases: string[];
    readonly scope: CommandScope;
    arguments: string[];
    options: Option[];
    readonly allowMissingWorkspace: boolean;
    private collectionName;
    private schematicName;
    private initialized;
    initialize(options: any): Promise<void>;
    validate(options: any): Promise<boolean>;
    run(options: UpdateOptions): Promise<number | void>;
}
