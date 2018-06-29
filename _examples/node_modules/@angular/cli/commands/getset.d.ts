import { Command, Option } from '../models/command';
export interface Options {
    keyword: string;
    search?: boolean;
}
export default class GetSetCommand extends Command {
    readonly name: string;
    readonly description: string;
    readonly arguments: string[];
    readonly options: Option[];
    readonly hidden: boolean;
    run(_options: Options): Promise<void>;
}
