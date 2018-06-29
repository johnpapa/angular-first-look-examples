import { Command, Option } from '../models/command';
export default class EjectCommand extends Command {
    readonly name: string;
    readonly description: string;
    readonly arguments: string[];
    readonly options: Option[];
    run(): void;
}
