/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("tsickle/src/typescript", ["require", "exports", "typescript", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @fileoverview Abstraction over the TypeScript API that makes multiple
     * versions of TypeScript appear to be interoperable. Any time a breaking change
     * in TypeScript affects Tsickle code, we should extend this shim to present an
     * unbroken API.
     * All code in tsickle should import from this location, not from 'typescript'.
     */
    // tslint:disable:no-any We need to do various unsafe casts between TS versions
    var ts = require("typescript");
    var typescript_1 = require("typescript");
    exports.addSyntheticTrailingComment = typescript_1.addSyntheticTrailingComment;
    exports.createArrayLiteral = typescript_1.createArrayLiteral;
    exports.createArrayTypeNode = typescript_1.createArrayTypeNode;
    exports.createArrowFunction = typescript_1.createArrowFunction;
    exports.createAssignment = typescript_1.createAssignment;
    exports.createBinary = typescript_1.createBinary;
    exports.createCall = typescript_1.createCall;
    exports.createCompilerHost = typescript_1.createCompilerHost;
    exports.createFunctionTypeNode = typescript_1.createFunctionTypeNode;
    exports.createIdentifier = typescript_1.createIdentifier;
    exports.createIndexSignature = typescript_1.createIndexSignature;
    exports.createKeywordTypeNode = typescript_1.createKeywordTypeNode;
    exports.createLiteral = typescript_1.createLiteral;
    exports.createLiteralTypeNode = typescript_1.createLiteralTypeNode;
    exports.createNodeArray = typescript_1.createNodeArray;
    exports.createNotEmittedStatement = typescript_1.createNotEmittedStatement;
    exports.createNull = typescript_1.createNull;
    exports.createObjectLiteral = typescript_1.createObjectLiteral;
    exports.createParameter = typescript_1.createParameter;
    exports.createProgram = typescript_1.createProgram;
    exports.createProperty = typescript_1.createProperty;
    exports.createPropertyAccess = typescript_1.createPropertyAccess;
    exports.createPropertyAssignment = typescript_1.createPropertyAssignment;
    exports.createPropertySignature = typescript_1.createPropertySignature;
    exports.createSourceFile = typescript_1.createSourceFile;
    exports.createStatement = typescript_1.createStatement;
    exports.createToken = typescript_1.createToken;
    exports.createTypeLiteralNode = typescript_1.createTypeLiteralNode;
    exports.createTypeReferenceNode = typescript_1.createTypeReferenceNode;
    exports.createUnionTypeNode = typescript_1.createUnionTypeNode;
    exports.createVariableDeclaration = typescript_1.createVariableDeclaration;
    exports.createVariableDeclarationList = typescript_1.createVariableDeclarationList;
    exports.createVariableStatement = typescript_1.createVariableStatement;
    exports.DiagnosticCategory = typescript_1.DiagnosticCategory;
    exports.EmitFlags = typescript_1.EmitFlags;
    exports.flattenDiagnosticMessageText = typescript_1.flattenDiagnosticMessageText;
    exports.forEachChild = typescript_1.forEachChild;
    exports.getCombinedModifierFlags = typescript_1.getCombinedModifierFlags;
    exports.getLeadingCommentRanges = typescript_1.getLeadingCommentRanges;
    exports.getLineAndCharacterOfPosition = typescript_1.getLineAndCharacterOfPosition;
    exports.getMutableClone = typescript_1.getMutableClone;
    exports.getOriginalNode = typescript_1.getOriginalNode;
    exports.getPreEmitDiagnostics = typescript_1.getPreEmitDiagnostics;
    exports.getSyntheticLeadingComments = typescript_1.getSyntheticLeadingComments;
    exports.getSyntheticTrailingComments = typescript_1.getSyntheticTrailingComments;
    exports.getTrailingCommentRanges = typescript_1.getTrailingCommentRanges;
    exports.isArrowFunction = typescript_1.isArrowFunction;
    exports.isBinaryExpression = typescript_1.isBinaryExpression;
    exports.isCallExpression = typescript_1.isCallExpression;
    exports.isExportDeclaration = typescript_1.isExportDeclaration;
    exports.isExpressionStatement = typescript_1.isExpressionStatement;
    exports.isIdentifier = typescript_1.isIdentifier;
    exports.isImportDeclaration = typescript_1.isImportDeclaration;
    exports.isLiteralExpression = typescript_1.isLiteralExpression;
    exports.isLiteralTypeNode = typescript_1.isLiteralTypeNode;
    exports.isObjectLiteralExpression = typescript_1.isObjectLiteralExpression;
    exports.isPropertyAccessExpression = typescript_1.isPropertyAccessExpression;
    exports.isPropertyAssignment = typescript_1.isPropertyAssignment;
    exports.isQualifiedName = typescript_1.isQualifiedName;
    exports.isStringLiteral = typescript_1.isStringLiteral;
    exports.isTypeReferenceNode = typescript_1.isTypeReferenceNode;
    exports.isVariableStatement = typescript_1.isVariableStatement;
    exports.ModifierFlags = typescript_1.ModifierFlags;
    exports.ModuleKind = typescript_1.ModuleKind;
    exports.NodeFlags = typescript_1.NodeFlags;
    exports.parseCommandLine = typescript_1.parseCommandLine;
    exports.parseJsonConfigFileContent = typescript_1.parseJsonConfigFileContent;
    exports.readConfigFile = typescript_1.readConfigFile;
    exports.resolveModuleName = typescript_1.resolveModuleName;
    exports.ScriptTarget = typescript_1.ScriptTarget;
    exports.setCommentRange = typescript_1.setCommentRange;
    exports.setEmitFlags = typescript_1.setEmitFlags;
    exports.setOriginalNode = typescript_1.setOriginalNode;
    exports.setSourceMapRange = typescript_1.setSourceMapRange;
    exports.setSyntheticLeadingComments = typescript_1.setSyntheticLeadingComments;
    exports.setSyntheticTrailingComments = typescript_1.setSyntheticTrailingComments;
    exports.setTextRange = typescript_1.setTextRange;
    exports.SymbolFlags = typescript_1.SymbolFlags;
    exports.SyntaxKind = typescript_1.SyntaxKind;
    exports.sys = typescript_1.sys;
    exports.TypeFlags = typescript_1.TypeFlags;
    exports.updateBlock = typescript_1.updateBlock;
    exports.updateConstructor = typescript_1.updateConstructor;
    exports.updateGetAccessor = typescript_1.updateGetAccessor;
    exports.updateMethod = typescript_1.updateMethod;
    exports.updateParameter = typescript_1.updateParameter;
    exports.updateSetAccessor = typescript_1.updateSetAccessor;
    exports.updateSourceFileNode = typescript_1.updateSourceFileNode;
    exports.visitEachChild = typescript_1.visitEachChild;
    exports.visitFunctionBody = typescript_1.visitFunctionBody;
    exports.visitLexicalEnvironment = typescript_1.visitLexicalEnvironment;
    exports.visitNode = typescript_1.visitNode;
    exports.visitParameterList = typescript_1.visitParameterList;
    // getEmitFlags is now private starting in TS 2.5.
    // So we define our own method that calls through to TypeScript to defeat the
    // visibility constraint.
    function getEmitFlags(node) {
        return ts.getEmitFlags(node);
    }
    exports.getEmitFlags = getEmitFlags;
    // Between TypeScript 2.4 and 2.5 updateProperty was modified. If called with 2.4 re-order the
    // parameters.
    exports.updateProperty = ts.updateProperty;
    var _a = __read(ts.version.split('.'), 2), major = _a[0], minor = _a[1];
    if (major === '2' && minor === '4') {
        var updateProperty24_1 = ts.updateProperty;
        exports.updateProperty = function (node, decorators, modifiers, name, questionToken, type, initializer) {
            return updateProperty24_1(node, decorators, modifiers, name, type, initializer);
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUVIOzs7Ozs7T0FNRztJQUVILCtFQUErRTtJQUUvRSwrQkFBaUM7SUFLakMseUNBQW9vRztJQUFsbkcsbURBQUEsMkJBQTJCLENBQUE7SUFBOE0sMENBQUEsa0JBQWtCLENBQUE7SUFBRSwyQ0FBQSxtQkFBbUIsQ0FBQTtJQUFFLDJDQUFBLG1CQUFtQixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSxvQ0FBQSxZQUFZLENBQUE7SUFBRSxrQ0FBQSxVQUFVLENBQUE7SUFBRSwwQ0FBQSxrQkFBa0IsQ0FBQTtJQUFFLDhDQUFBLHNCQUFzQixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSw0Q0FBQSxvQkFBb0IsQ0FBQTtJQUFFLDZDQUFBLHFCQUFxQixDQUFBO0lBQUUscUNBQUEsYUFBYSxDQUFBO0lBQUUsNkNBQUEscUJBQXFCLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSxpREFBQSx5QkFBeUIsQ0FBQTtJQUFFLGtDQUFBLFVBQVUsQ0FBQTtJQUFFLDJDQUFBLG1CQUFtQixDQUFBO0lBQUUsdUNBQUEsZUFBZSxDQUFBO0lBQUUscUNBQUEsYUFBYSxDQUFBO0lBQUUsc0NBQUEsY0FBYyxDQUFBO0lBQUUsNENBQUEsb0JBQW9CLENBQUE7SUFBRSxnREFBQSx3QkFBd0IsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUsd0NBQUEsZ0JBQWdCLENBQUE7SUFBRSx1Q0FBQSxlQUFlLENBQUE7SUFBRSxtQ0FBQSxXQUFXLENBQUE7SUFBRSw2Q0FBQSxxQkFBcUIsQ0FBQTtJQUFFLCtDQUFBLHVCQUF1QixDQUFBO0lBQUUsMkNBQUEsbUJBQW1CLENBQUE7SUFBRSxpREFBQSx5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QXlDLEVBQUUsSUFBMkIsRUFDdEUsV0FBb0M7WUFDcEQsT0FBTyxrQkFBZ0IsQ0FDWixJQUF1QyxFQUFFLFVBQXFDLEVBQzlFLFNBQWdCLEVBQUUsSUFBVyxFQUFFLElBQVcsRUFBRSxXQUFrQixDQUFRLENBQUM7UUFDcEYsQ0FBQyxDQUFDO0tBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBBYnN0cmFjdGlvbiBvdmVyIHRoZSBUeXBlU2NyaXB0IEFQSSB0aGF0IG1ha2VzIG11bHRpcGxlXG4gKiB2ZXJzaW9ucyBvZiBUeXBlU2NyaXB0IGFwcGVhciB0byBiZSBpbnRlcm9wZXJhYmxlLiBBbnkgdGltZSBhIGJyZWFraW5nIGNoYW5nZVxuICogaW4gVHlwZVNjcmlwdCBhZmZlY3RzIFRzaWNrbGUgY29kZSwgd2Ugc2hvdWxkIGV4dGVuZCB0aGlzIHNoaW0gdG8gcHJlc2VudCBhblxuICogdW5icm9rZW4gQVBJLlxuICogQWxsIGNvZGUgaW4gdHNpY2tsZSBzaG91bGQgaW1wb3J0IGZyb20gdGhpcyBsb2NhdGlvbiwgbm90IGZyb20gJ3R5cGVzY3JpcHQnLlxuICovXG5cbi8vIHRzbGludDpkaXNhYmxlOm5vLWFueSBXZSBuZWVkIHRvIGRvIHZhcmlvdXMgdW5zYWZlIGNhc3RzIGJldHdlZW4gVFMgdmVyc2lvbnNcblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbi8vIE5vdGUsIHRoaXMgaW1wb3J0IGRlcGVuZHMgb24gYSBnZW5ydWxlIGNvcHlpbmcgdGhlIC5kLnRzIGZpbGUgdG8gdGhpcyBwYWNrYWdlXG5pbXBvcnQgKiBhcyB0czI0IGZyb20gJy4vdHlwZXNjcmlwdC0yLjQnO1xuXG5leHBvcnQge19fU3RyaW5nLCBhZGRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnQsIEFzc2VydGlvbkV4cHJlc3Npb24sIEJpbmFyeUV4cHJlc3Npb24sIEJsb2NrLCBDYWxsRXhwcmVzc2lvbiwgQ2FuY2VsbGF0aW9uVG9rZW4sIENsYXNzRGVjbGFyYXRpb24sIENsYXNzRWxlbWVudCwgQ2xhc3NMaWtlRGVjbGFyYXRpb24sIENvbW1lbnRSYW5nZSwgQ29tcGlsZXJIb3N0LCBDb21waWxlck9wdGlvbnMsIENvbnN0cnVjdG9yRGVjbGFyYXRpb24sIGNyZWF0ZUFycmF5TGl0ZXJhbCwgY3JlYXRlQXJyYXlUeXBlTm9kZSwgY3JlYXRlQXJyb3dGdW5jdGlvbiwgY3JlYXRlQXNzaWdubWVudCwgY3JlYXRlQmluYXJ5LCBjcmVhdGVDYWxsLCBjcmVhdGVDb21waWxlckhvc3QsIGNyZWF0ZUZ1bmN0aW9uVHlwZU5vZGUsIGNyZWF0ZUlkZW50aWZpZXIsIGNyZWF0ZUluZGV4U2lnbmF0dXJlLCBjcmVhdGVLZXl3b3JkVHlwZU5vZGUsIGNyZWF0ZUxpdGVyYWwsIGNyZWF0ZUxpdGVyYWxUeXBlTm9kZSwgY3JlYXRlTm9kZUFycmF5LCBjcmVhdGVOb3RFbWl0dGVkU3RhdGVtZW50LCBjcmVhdGVOdWxsLCBjcmVhdGVPYmplY3RMaXRlcmFsLCBjcmVhdGVQYXJhbWV0ZXIsIGNyZWF0ZVByb2dyYW0sIGNyZWF0ZVByb3BlcnR5LCBjcmVhdGVQcm9wZXJ0eUFjY2VzcywgY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50LCBjcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZSwgY3JlYXRlU291cmNlRmlsZSwgY3JlYXRlU3RhdGVtZW50LCBjcmVhdGVUb2tlbiwgY3JlYXRlVHlwZUxpdGVyYWxOb2RlLCBjcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSwgY3JlYXRlVW5pb25UeXBlTm9kZSwgY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbiwgY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbkxpc3QsIGNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50LCBDdXN0b21UcmFuc2Zvcm1lcnMsIERlY2xhcmF0aW9uLCBEZWNsYXJhdGlvblN0YXRlbWVudCwgRGVjbGFyYXRpb25XaXRoVHlwZVBhcmFtZXRlcnMsIERlY29yYXRvciwgRGlhZ25vc3RpYywgRGlhZ25vc3RpY0NhdGVnb3J5LCBFbGVtZW50QWNjZXNzRXhwcmVzc2lvbiwgRW1pdEZsYWdzLCBFbWl0UmVzdWx0LCBFbnRpdHlOYW1lLCBFbnVtRGVjbGFyYXRpb24sIEVudW1NZW1iZXIsIEV4cG9ydERlY2xhcmF0aW9uLCBFeHBvcnRTcGVjaWZpZXIsIEV4cHJlc3Npb24sIEV4cHJlc3Npb25TdGF0ZW1lbnQsIGZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZVRleHQsIGZvckVhY2hDaGlsZCwgRnVuY3Rpb25EZWNsYXJhdGlvbiwgRnVuY3Rpb25MaWtlRGVjbGFyYXRpb24sIEdldEFjY2Vzc29yRGVjbGFyYXRpb24sIGdldENvbWJpbmVkTW9kaWZpZXJGbGFncywgZ2V0TGVhZGluZ0NvbW1lbnRSYW5nZXMsIGdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uLCBnZXRNdXRhYmxlQ2xvbmUsIGdldE9yaWdpbmFsTm9kZSwgZ2V0UHJlRW1pdERpYWdub3N0aWNzLCBnZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMsIGdldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMsIGdldFRyYWlsaW5nQ29tbWVudFJhbmdlcywgSWRlbnRpZmllciwgSW1wb3J0RGVjbGFyYXRpb24sIEltcG9ydEVxdWFsc0RlY2xhcmF0aW9uLCBJbXBvcnRTcGVjaWZpZXIsIEludGVyZmFjZURlY2xhcmF0aW9uLCBpc0Fycm93RnVuY3Rpb24sIGlzQmluYXJ5RXhwcmVzc2lvbiwgaXNDYWxsRXhwcmVzc2lvbiwgaXNFeHBvcnREZWNsYXJhdGlvbiwgaXNFeHByZXNzaW9uU3RhdGVtZW50LCBpc0lkZW50aWZpZXIsIGlzSW1wb3J0RGVjbGFyYXRpb24sIGlzTGl0ZXJhbEV4cHJlc3Npb24sIGlzTGl0ZXJhbFR5cGVOb2RlLCBpc09iamVjdExpdGVyYWxFeHByZXNzaW9uLCBpc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiwgaXNQcm9wZXJ0eUFzc2lnbm1lbnQsIGlzUXVhbGlmaWVkTmFtZSwgaXNTdHJpbmdMaXRlcmFsLCBpc1R5cGVSZWZlcmVuY2VOb2RlLCBpc1ZhcmlhYmxlU3RhdGVtZW50LCBNZXRob2REZWNsYXJhdGlvbiwgTW9kaWZpZXJGbGFncywgTW9kdWxlQmxvY2ssIE1vZHVsZURlY2xhcmF0aW9uLCBNb2R1bGVLaW5kLCBNb2R1bGVSZXNvbHV0aW9uSG9zdCwgTmFtZWREZWNsYXJhdGlvbiwgTmFtZWRJbXBvcnRzLCBOb2RlLCBOb2RlQXJyYXksIE5vZGVGbGFncywgTm9uTnVsbEV4cHJlc3Npb24sIE5vdEVtaXR0ZWRTdGF0ZW1lbnQsIE9iamVjdExpdGVyYWxFbGVtZW50TGlrZSwgT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24sIFBhcmFtZXRlckRlY2xhcmF0aW9uLCBwYXJzZUNvbW1hbmRMaW5lLCBwYXJzZUpzb25Db25maWdGaWxlQ29udGVudCwgUHJvZ3JhbSwgUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uLCBQcm9wZXJ0eUFzc2lnbm1lbnQsIFByb3BlcnR5RGVjbGFyYXRpb24sIFByb3BlcnR5TmFtZSwgUHJvcGVydHlTaWduYXR1cmUsIFF1YWxpZmllZE5hbWUsIHJlYWRDb25maWdGaWxlLCByZXNvbHZlTW9kdWxlTmFtZSwgU2NyaXB0VGFyZ2V0LCBTZXRBY2Nlc3NvckRlY2xhcmF0aW9uLCBzZXRDb21tZW50UmFuZ2UsIHNldEVtaXRGbGFncywgc2V0T3JpZ2luYWxOb2RlLCBzZXRTb3VyY2VNYXBSYW5nZSwgc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzLCBzZXRTeW50aGV0aWNUcmFpbGluZ0NvbW1lbnRzLCBzZXRUZXh0UmFuZ2UsIFNpZ25hdHVyZURlY2xhcmF0aW9uLCBTb3VyY2VGaWxlLCBTdGF0ZW1lbnQsIFN0cmluZ0xpdGVyYWwsIFN5bWJvbCwgU3ltYm9sRmxhZ3MsIFN5bnRheEtpbmQsIFN5bnRoZXNpemVkQ29tbWVudCwgc3lzLCBUb2tlbiwgVHJhbnNmb3JtYXRpb25Db250ZXh0LCBUcmFuc2Zvcm1lciwgVHJhbnNmb3JtZXJGYWN0b3J5LCBUeXBlLCBUeXBlQWxpYXNEZWNsYXJhdGlvbiwgVHlwZUNoZWNrZXIsIFR5cGVFbGVtZW50LCBUeXBlRmxhZ3MsIFR5cGVOb2RlLCBUeXBlUmVmZXJlbmNlLCBUeXBlUmVmZXJlbmNlTm9kZSwgVW5pb25UeXBlLCB1cGRhdGVCbG9jaywgdXBkYXRlQ29uc3RydWN0b3IsIHVwZGF0ZUdldEFjY2Vzc29yLCB1cGRhdGVNZXRob2QsIHVwZGF0ZVBhcmFtZXRlciwgdXBkYXRlU2V0QWNjZXNzb3IsIHVwZGF0ZVNvdXJjZUZpbGVOb2RlLCBWYXJpYWJsZURlY2xhcmF0aW9uLCBWYXJpYWJsZVN0YXRlbWVudCwgdmlzaXRFYWNoQ2hpbGQsIHZpc2l0RnVuY3Rpb25Cb2R5LCB2aXNpdExleGljYWxFbnZpcm9ubWVudCwgdmlzaXROb2RlLCBWaXNpdG9yLCB2aXNpdFBhcmFtZXRlckxpc3QsIFdyaXRlRmlsZUNhbGxiYWNrfSBmcm9tICd0eXBlc2NyaXB0JztcblxuLy8gZ2V0RW1pdEZsYWdzIGlzIG5vdyBwcml2YXRlIHN0YXJ0aW5nIGluIFRTIDIuNS5cbi8vIFNvIHdlIGRlZmluZSBvdXIgb3duIG1ldGhvZCB0aGF0IGNhbGxzIHRocm91Z2ggdG8gVHlwZVNjcmlwdCB0byBkZWZlYXQgdGhlXG4vLyB2aXNpYmlsaXR5IGNvbnN0cmFpbnQuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW1pdEZsYWdzKG5vZGU6IHRzLk5vZGUpOiB0cy5FbWl0RmxhZ3N8dW5kZWZpbmVkIHtcbiAgcmV0dXJuICh0cyBhcyBhbnkpLmdldEVtaXRGbGFncyhub2RlKTtcbn1cblxuLy8gQmV0d2VlbiBUeXBlU2NyaXB0IDIuNCBhbmQgMi41IHVwZGF0ZVByb3BlcnR5IHdhcyBtb2RpZmllZC4gSWYgY2FsbGVkIHdpdGggMi40IHJlLW9yZGVyIHRoZVxuLy8gcGFyYW1ldGVycy5cbmV4cG9ydCBsZXQgdXBkYXRlUHJvcGVydHkgPSB0cy51cGRhdGVQcm9wZXJ0eTtcblxuY29uc3QgW21ham9yLCBtaW5vcl0gPSB0cy52ZXJzaW9uLnNwbGl0KCcuJyk7XG5pZiAobWFqb3IgPT09ICcyJyAmJiBtaW5vciA9PT0gJzQnKSB7XG4gIGNvbnN0IHVwZGF0ZVByb3BlcnR5MjQgPSB0cy51cGRhdGVQcm9wZXJ0eSBhcyBhbnkgYXMgdHlwZW9mIHRzMjQudXBkYXRlUHJvcGVydHk7XG4gIHVwZGF0ZVByb3BlcnR5ID0gKG5vZGU6IHRzLlByb3BlcnR5RGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IFJlYWRvbmx5QXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyczogUmVhZG9ubHlBcnJheTx0cy5Nb2RpZmllcj58dW5kZWZpbmVkLCBuYW1lOiBzdHJpbmd8dHMuUHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvblRva2VuOiB0cy5RdWVzdGlvblRva2VufHVuZGVmaW5lZCwgdHlwZTogdHMuVHlwZU5vZGV8dW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplcjogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQpOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uID0+IHtcbiAgICByZXR1cm4gdXBkYXRlUHJvcGVydHkyNChcbiAgICAgICAgICAgICAgIG5vZGUgYXMgYW55IGFzIHRzMjQuUHJvcGVydHlEZWNsYXJhdGlvbiwgZGVjb3JhdG9ycyBhcyBhbnkgYXMgdHMyNC5EZWNvcmF0b3JbXSxcbiAgICAgICAgICAgICAgIG1vZGlmaWVycyBhcyBhbnksIG5hbWUgYXMgYW55LCB0eXBlIGFzIGFueSzCoGluaXRpYWxpemVyIGFzIGFueSkgYXMgYW55O1xuICB9O1xufVxuIl19