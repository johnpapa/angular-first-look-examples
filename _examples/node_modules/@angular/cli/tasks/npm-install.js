"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@angular-devkit/core/node");
const child_process_1 = require("child_process");
const core_1 = require("@angular-devkit/core");
const SilentError = require('silent-error');
function default_1(packageName, logger, packageManager, projectRoot, save = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (packageManager === 'default') {
            packageManager = 'npm';
        }
        logger.info(core_1.terminal.green(`Installing packages for tooling via ${packageManager}.`));
        const installArgs = [];
        switch (packageManager) {
            case 'cnpm':
            case 'npm':
                installArgs.push('install', '--quiet');
                break;
            case 'yarn':
                installArgs.push('add');
                break;
            default:
                throw new SilentError(`Invalid package manager: ${JSON.stringify(packageManager)}.`);
        }
        if (packageName) {
            try {
                // Verify if we need to install the package (it might already be there).
                // If it's available and we shouldn't save, simply return. Nothing to be done.
                node_1.resolve(packageName, { checkLocal: true, basedir: projectRoot });
                return;
            }
            catch (e) {
                if (!(e instanceof node_1.ModuleNotFoundException)) {
                    throw e;
                }
            }
            installArgs.push(packageName);
        }
        if (!save) {
            installArgs.push('--no-save');
        }
        const installOptions = {
            stdio: 'inherit',
            shell: true
        };
        yield new Promise((resolve, reject) => {
            child_process_1.spawn(packageManager, installArgs, installOptions)
                .on('close', (code) => {
                if (code === 0) {
                    logger.info(core_1.terminal.green(`Installed packages for tooling via ${packageManager}.`));
                    resolve();
                }
                else {
                    const message = 'Package install failed, see above.';
                    logger.info(core_1.terminal.red(message));
                    reject(message);
                }
            });
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=/Users/hansl/Sources/hansl/angular-cli/tasks/npm-install.js.map