import { Command, Option } from '../models/command';
export default class AwesomeCommand extends Command {
    readonly name: string;
    readonly description: string;
    readonly hidden: boolean;
    readonly arguments: string[];
    readonly options: Option[];
    run(_options: any): void;
}
