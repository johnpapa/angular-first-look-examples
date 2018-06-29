/// <amd-module name="@angular/compiler-cli/src/metadata/bundle_index_host" />
import * as ts from 'typescript';
import { CompilerOptions } from '../transformers/api';
import { MetadataCache } from '../transformers/metadata_cache';
export declare function createBundleIndexHost<H extends ts.CompilerHost>(ngOptions: CompilerOptions, rootFiles: ReadonlyArray<string>, host: H, getMetadataCache: () => MetadataCache): {
    host: H;
    indexName?: string;
    errors?: ts.Diagnostic[];
};
