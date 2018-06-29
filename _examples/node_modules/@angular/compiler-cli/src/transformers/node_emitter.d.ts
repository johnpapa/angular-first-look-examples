/// <amd-module name="@angular/compiler-cli/src/transformers/node_emitter" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ParseSourceSpan, PartialModule, Statement } from '@angular/compiler';
import * as ts from 'typescript';
export interface Node {
    sourceSpan: ParseSourceSpan | null;
}
export declare class TypeScriptNodeEmitter {
    updateSourceFile(sourceFile: ts.SourceFile, stmts: Statement[], preamble?: string): [ts.SourceFile, Map<ts.Node, Node>];
    /** Creates a not emitted statement containing the given comment. */
    createCommentStatement(sourceFile: ts.SourceFile, comment: string): ts.Statement;
}
/**
 * Update the given source file to include the changes specified in module.
 *
 * The module parameter is treated as a partial module meaning that the statements are added to
 * the module instead of replacing the module. Also, any classes are treated as partial classes
 * and the included members are added to the class with the same name instead of a new class
 * being created.
 */
export declare function updateSourceFile(sourceFile: ts.SourceFile, module: PartialModule, context: ts.TransformationContext): [ts.SourceFile, Map<ts.Node, Node>];
