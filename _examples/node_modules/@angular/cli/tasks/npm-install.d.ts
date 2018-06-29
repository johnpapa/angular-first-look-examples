import { logging } from '@angular-devkit/core';
export declare type NpmInstall = (packageName: string, logger: logging.Logger, packageManager: string, projectRoot: string, save?: boolean) => void;
export default function (packageName: string, logger: logging.Logger, packageManager: string, projectRoot: string, save?: boolean): Promise<void>;
