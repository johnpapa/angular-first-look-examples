import { Command, Option } from '../models/command';
export interface ConfigOptions {
    jsonPath: string;
    value?: string;
    global?: boolean;
}
export default class ConfigCommand extends Command {
    readonly name: string;
    readonly description: string;
    readonly arguments: string[];
    readonly options: Option[];
    run(options: ConfigOptions): void;
    private get(config, options);
    private set(options);
}
