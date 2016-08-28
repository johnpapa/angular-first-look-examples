import { BaseException } from '@angular/core';

export function throwIfAlreadyLoaded(parentModule: any, moduleName: string) {
  if (parentModule) {
    throw new ModuleImportGuardException(moduleName);
  }
}

class ModuleImportGuardException extends BaseException {
  constructor(name: string) {
    super(`${name} has already been loaded. Import Core modules in the AppModule only.`);
  }
}
