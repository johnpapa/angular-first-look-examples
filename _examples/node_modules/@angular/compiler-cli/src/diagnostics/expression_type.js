/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/diagnostics/expression_type", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/diagnostics/symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var symbols_1 = require("@angular/compiler-cli/src/diagnostics/symbols");
    var DiagnosticKind;
    (function (DiagnosticKind) {
        DiagnosticKind[DiagnosticKind["Error"] = 0] = "Error";
        DiagnosticKind[DiagnosticKind["Warning"] = 1] = "Warning";
    })(DiagnosticKind = exports.DiagnosticKind || (exports.DiagnosticKind = {}));
    var TypeDiagnostic = /** @class */ (function () {
        function TypeDiagnostic(kind, message, ast) {
            this.kind = kind;
            this.message = message;
            this.ast = ast;
        }
        return TypeDiagnostic;
    }());
    exports.TypeDiagnostic = TypeDiagnostic;
    // AstType calculatetype of the ast given AST element.
    var AstType = /** @class */ (function () {
        function AstType(scope, query, context) {
            this.scope = scope;
            this.query = query;
            this.context = context;
        }
        AstType.prototype.getType = function (ast) { return ast.visit(this); };
        AstType.prototype.getDiagnostics = function (ast) {
            this.diagnostics = [];
            var type = ast.visit(this);
            if (this.context.event && type.callable) {
                this.reportWarning('Unexpected callable expression. Expected a method call', ast);
            }
            return this.diagnostics;
        };
        AstType.prototype.visitBinary = function (ast) {
            var _this = this;
            // Treat undefined and null as other.
            function normalize(kind, other) {
                switch (kind) {
                    case symbols_1.BuiltinType.Undefined:
                    case symbols_1.BuiltinType.Null:
                        return normalize(other, symbols_1.BuiltinType.Other);
                }
                return kind;
            }
            var getType = function (ast, operation) {
                var type = _this.getType(ast);
                if (type.nullable) {
                    switch (operation) {
                        case '&&':
                        case '||':
                        case '==':
                        case '!=':
                        case '===':
                        case '!==':
                            // Nullable allowed.
                            break;
                        default:
                            _this.reportError("The expression might be null", ast);
                            break;
                    }
                    return _this.query.getNonNullableType(type);
                }
                return type;
            };
            var leftType = getType(ast.left, ast.operation);
            var rightType = getType(ast.right, ast.operation);
            var leftRawKind = this.query.getTypeKind(leftType);
            var rightRawKind = this.query.getTypeKind(rightType);
            var leftKind = normalize(leftRawKind, rightRawKind);
            var rightKind = normalize(rightRawKind, leftRawKind);
            // The following swtich implements operator typing similar to the
            // type production tables in the TypeScript specification.
            // https://github.com/Microsoft/TypeScript/blob/v1.8.10/doc/spec.md#4.19
            var operKind = leftKind << 8 | rightKind;
            switch (ast.operation) {
                case '*':
                case '/':
                case '%':
                case '-':
                case '<<':
                case '>>':
                case '>>>':
                case '&':
                case '^':
                case '|':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        default:
                            var errorAst = ast.left;
                            switch (leftKind) {
                                case symbols_1.BuiltinType.Any:
                                case symbols_1.BuiltinType.Number:
                                    errorAst = ast.right;
                                    break;
                            }
                            return this.reportError('Expected a numeric type', errorAst);
                    }
                case '+':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Any:
                            return this.anyType;
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.String:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.String);
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Number:
                            return this.reportError('Expected a number type', ast.left);
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Other:
                            return this.reportError('Expected a number type', ast.right);
                        default:
                            return this.reportError('Expected operands to be a string or number type', ast);
                    }
                case '>':
                case '<':
                case '<=':
                case '>=':
                case '==':
                case '!=':
                case '===':
                case '!==':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Other:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
                        default:
                            return this.reportError('Expected the operants to be of similar type or any', ast);
                    }
                case '&&':
                    return rightType;
                case '||':
                    return this.query.getTypeUnion(leftType, rightType);
            }
            return this.reportError("Unrecognized operator " + ast.operation, ast);
        };
        AstType.prototype.visitChain = function (ast) {
            if (this.diagnostics) {
                // If we are producing diagnostics, visit the children
                compiler_1.visitAstChildren(ast, this);
            }
            // The type of a chain is always undefined.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
        };
        AstType.prototype.visitConditional = function (ast) {
            // The type of a conditional is the union of the true and false conditions.
            if (this.diagnostics) {
                compiler_1.visitAstChildren(ast, this);
            }
            return this.query.getTypeUnion(this.getType(ast.trueExp), this.getType(ast.falseExp));
        };
        AstType.prototype.visitFunctionCall = function (ast) {
            var _this = this;
            // The type of a function call is the return type of the selected signature.
            // The signature is selected based on the types of the arguments. Angular doesn't
            // support contextual typing of arguments so this is simpler than TypeScript's
            // version.
            var args = ast.args.map(function (arg) { return _this.getType(arg); });
            var target = this.getType(ast.target);
            if (!target || !target.callable)
                return this.reportError('Call target is not callable', ast);
            var signature = target.selectSignature(args);
            if (signature)
                return signature.result;
            // TODO: Consider a better error message here.
            return this.reportError('Unable no compatible signature found for call', ast);
        };
        AstType.prototype.visitImplicitReceiver = function (ast) {
            var _this = this;
            // Return a pseudo-symbol for the implicit receiver.
            // The members of the implicit receiver are what is defined by the
            // scope passed into this class.
            return {
                name: '$implict',
                kind: 'component',
                language: 'ng-template',
                type: undefined,
                container: undefined,
                callable: false,
                nullable: false,
                public: true,
                definition: undefined,
                members: function () { return _this.scope; },
                signatures: function () { return []; },
                selectSignature: function (types) { return undefined; },
                indexed: function (argument) { return undefined; }
            };
        };
        AstType.prototype.visitInterpolation = function (ast) {
            // If we are producing diagnostics, visit the children.
            if (this.diagnostics) {
                compiler_1.visitAstChildren(ast, this);
            }
            return this.undefinedType;
        };
        AstType.prototype.visitKeyedRead = function (ast) {
            var targetType = this.getType(ast.obj);
            var keyType = this.getType(ast.key);
            var result = targetType.indexed(keyType);
            return result || this.anyType;
        };
        AstType.prototype.visitKeyedWrite = function (ast) {
            // The write of a type is the type of the value being written.
            return this.getType(ast.value);
        };
        AstType.prototype.visitLiteralArray = function (ast) {
            var _this = this;
            // A type literal is an array type of the union of the elements
            return this.query.getArrayType((_a = this.query).getTypeUnion.apply(_a, tslib_1.__spread(ast.expressions.map(function (element) { return _this.getType(element); }))));
            var _a;
        };
        AstType.prototype.visitLiteralMap = function (ast) {
            // If we are producing diagnostics, visit the children
            if (this.diagnostics) {
                compiler_1.visitAstChildren(ast, this);
            }
            // TODO: Return a composite type.
            return this.anyType;
        };
        AstType.prototype.visitLiteralPrimitive = function (ast) {
            // The type of a literal primitive depends on the value of the literal.
            switch (ast.value) {
                case true:
                case false:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
                case null:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Null);
                case undefined:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
                default:
                    switch (typeof ast.value) {
                        case 'string':
                            return this.query.getBuiltinType(symbols_1.BuiltinType.String);
                        case 'number':
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        default:
                            return this.reportError('Unrecognized primitive', ast);
                    }
            }
        };
        AstType.prototype.visitMethodCall = function (ast) {
            return this.resolveMethodCall(this.getType(ast.receiver), ast);
        };
        AstType.prototype.visitPipe = function (ast) {
            var _this = this;
            // The type of a pipe node is the return type of the pipe's transform method. The table returned
            // by getPipes() is expected to contain symbols with the corresponding transform method type.
            var pipe = this.query.getPipes().get(ast.name);
            if (!pipe)
                return this.reportError("No pipe by the name " + ast.name + " found", ast);
            var expType = this.getType(ast.exp);
            var signature = pipe.selectSignature([expType].concat(ast.args.map(function (arg) { return _this.getType(arg); })));
            if (!signature)
                return this.reportError('Unable to resolve signature for pipe invocation', ast);
            return signature.result;
        };
        AstType.prototype.visitPrefixNot = function (ast) {
            // The type of a prefix ! is always boolean.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
        };
        AstType.prototype.visitNonNullAssert = function (ast) {
            var expressionType = this.getType(ast.expression);
            return this.query.getNonNullableType(expressionType);
        };
        AstType.prototype.visitPropertyRead = function (ast) {
            return this.resolvePropertyRead(this.getType(ast.receiver), ast);
        };
        AstType.prototype.visitPropertyWrite = function (ast) {
            // The type of a write is the type of the value being written.
            return this.getType(ast.value);
        };
        AstType.prototype.visitQuote = function (ast) {
            // The type of a quoted expression is any.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Any);
        };
        AstType.prototype.visitSafeMethodCall = function (ast) {
            return this.resolveMethodCall(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
        };
        AstType.prototype.visitSafePropertyRead = function (ast) {
            return this.resolvePropertyRead(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
        };
        Object.defineProperty(AstType.prototype, "anyType", {
            get: function () {
                var result = this._anyType;
                if (!result) {
                    result = this._anyType = this.query.getBuiltinType(symbols_1.BuiltinType.Any);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AstType.prototype, "undefinedType", {
            get: function () {
                var result = this._undefinedType;
                if (!result) {
                    result = this._undefinedType = this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        AstType.prototype.resolveMethodCall = function (receiverType, ast) {
            var _this = this;
            if (this.isAny(receiverType)) {
                return this.anyType;
            }
            // The type of a method is the selected methods result type.
            var method = receiverType.members().get(ast.name);
            if (!method)
                return this.reportError("Unknown method '" + ast.name + "'", ast);
            if (!method.type)
                return this.reportError("Could not find a type for '" + ast.name + "'", ast);
            if (!method.type.callable)
                return this.reportError("Member '" + ast.name + "' is not callable", ast);
            var signature = method.type.selectSignature(ast.args.map(function (arg) { return _this.getType(arg); }));
            if (!signature)
                return this.reportError("Unable to resolve signature for call of method " + ast.name, ast);
            return signature.result;
        };
        AstType.prototype.resolvePropertyRead = function (receiverType, ast) {
            if (this.isAny(receiverType)) {
                return this.anyType;
            }
            // The type of a property read is the seelcted member's type.
            var member = receiverType.members().get(ast.name);
            if (!member) {
                var receiverInfo = receiverType.name;
                if (receiverInfo == '$implict') {
                    receiverInfo =
                        'The component declaration, template variable declarations, and element references do';
                }
                else if (receiverType.nullable) {
                    return this.reportError("The expression might be null", ast.receiver);
                }
                else {
                    receiverInfo = "'" + receiverInfo + "' does";
                }
                return this.reportError("Identifier '" + ast.name + "' is not defined. " + receiverInfo + " not contain such a member", ast);
            }
            if (!member.public) {
                var receiverInfo = receiverType.name;
                if (receiverInfo == '$implict') {
                    receiverInfo = 'the component';
                }
                else {
                    receiverInfo = "'" + receiverInfo + "'";
                }
                this.reportWarning("Identifier '" + ast.name + "' refers to a private member of " + receiverInfo, ast);
            }
            return member.type;
        };
        AstType.prototype.reportError = function (message, ast) {
            if (this.diagnostics) {
                this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Error, message, ast));
            }
            return this.anyType;
        };
        AstType.prototype.reportWarning = function (message, ast) {
            if (this.diagnostics) {
                this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Warning, message, ast));
            }
            return this.anyType;
        };
        AstType.prototype.isAny = function (symbol) {
            return !symbol || this.query.getTypeKind(symbol) == symbols_1.BuiltinType.Any ||
                (!!symbol.type && this.isAny(symbol.type));
        };
        return AstType;
    }());
    exports.AstType = AstType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl90eXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9kaWFnbm9zdGljcy9leHByZXNzaW9uX3R5cGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQTJVO0lBRTNVLHlFQUF5RjtJQUl6RixJQUFZLGNBR1g7SUFIRCxXQUFZLGNBQWM7UUFDeEIscURBQUssQ0FBQTtRQUNMLHlEQUFPLENBQUE7SUFDVCxDQUFDLEVBSFcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFHekI7SUFFRDtRQUNFLHdCQUFtQixJQUFvQixFQUFTLE9BQWUsRUFBUyxHQUFRO1lBQTdELFNBQUksR0FBSixJQUFJLENBQWdCO1lBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUFTLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBRyxDQUFDO1FBQ3RGLHFCQUFDO0lBQUQsQ0FBQyxBQUZELElBRUM7SUFGWSx3Q0FBYztJQUkzQixzREFBc0Q7SUFDdEQ7UUFHRSxpQkFDWSxLQUFrQixFQUFVLEtBQWtCLEVBQzlDLE9BQXFDO1lBRHJDLFVBQUssR0FBTCxLQUFLLENBQWE7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBQzlDLFlBQU8sR0FBUCxPQUFPLENBQThCO1FBQUcsQ0FBQztRQUVyRCx5QkFBTyxHQUFQLFVBQVEsR0FBUSxJQUFZLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRCxnQ0FBYyxHQUFkLFVBQWUsR0FBUTtZQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN0QixJQUFNLElBQUksR0FBVyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENB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Q3JGLENBQUM7WUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDO1FBRU8sNkJBQVcsR0FBbkIsVUFBb0IsT0FBZSxFQUFFLEdBQVE7WUFDM0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDaEYsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3RCLENBQUM7UUFFTywrQkFBYSxHQUFyQixVQUFzQixPQUFlLEVBQUUsR0FBUTtZQUM3QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsRixDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDdEIsQ0FBQztRQUVPLHVCQUFLLEdBQWIsVUFBYyxNQUFjO1lBQzFCLE1BQU0sQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxxQkFBVyxDQUFDLEdBQUc7Z0JBQy9ELENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0gsY0FBQztJQUFELENBQUMsQUE5WUQsSUE4WUM7SUE5WVksMEJBQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVNULCBBc3RWaXNpdG9yLCBCaW5hcnksIEJpbmRpbmdQaXBlLCBDaGFpbiwgQ29uZGl0aW9uYWwsIEZ1bmN0aW9uQ2FsbCwgSW1wbGljaXRSZWNlaXZlciwgSW50ZXJwb2xhdGlvbiwgS2V5ZWRSZWFkLCBLZXllZFdyaXRlLCBMaXRlcmFsQXJyYXksIExpdGVyYWxNYXAsIExpdGVyYWxQcmltaXRpdmUsIE1ldGhvZENhbGwsIE5vbk51bGxBc3NlcnQsIFByZWZpeE5vdCwgUHJvcGVydHlSZWFkLCBQcm9wZXJ0eVdyaXRlLCBRdW90ZSwgU2FmZU1ldGhvZENhbGwsIFNhZmVQcm9wZXJ0eVJlYWQsIHZpc2l0QXN0Q2hpbGRyZW59IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHtCdWlsdGluVHlwZSwgU2lnbmF0dXJlLCBTcGFuLCBTeW1ib2wsIFN5bWJvbFF1ZXJ5LCBTeW1ib2xUYWJsZX0gZnJvbSAnLi9zeW1ib2xzJztcblxuZXhwb3J0IGludGVyZmFjZSBFeHByZXNzaW9uRGlhZ25vc3RpY3NDb250ZXh0IHsgZXZlbnQ/OiBib29sZWFuOyB9XG5cbmV4cG9ydCBlbnVtIERpYWdub3N0aWNLaW5kIHtcbiAgRXJyb3IsXG4gIFdhcm5pbmcsXG59XG5cbmV4cG9ydCBjbGFzcyBUeXBlRGlhZ25vc3RpYyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBraW5kOiBEaWFnbm9zdGljS2luZCwgcHVibGljIG1lc3NhZ2U6IHN0cmluZywgcHVibGljIGFzdDogQVNUKSB7fVxufVxuXG4vLyBBc3RUeXBlIGNhbGN1bGF0ZXR5cGUgb2YgdGhlIGFzdCBnaXZlbiBBU1QgZWxlbWVudC5cbmV4cG9ydCBjbGFzcyBBc3RUeXBlIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHB1YmxpYyBkaWFnbm9zdGljczogVHlwZURpYWdub3N0aWNbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgc2NvcGU6IFN5bWJvbFRhYmxlLCBwcml2YXRlIHF1ZXJ5OiBTeW1ib2xRdWVyeSxcbiAgICAgIHByaXZhdGUgY29udGV4dDogRXhwcmVzc2lvbkRpYWdub3N0aWNzQ29udGV4dCkge31cblxuICBnZXRUeXBlKGFzdDogQVNUKTogU3ltYm9sIHsgcmV0dXJuIGFzdC52aXNpdCh0aGlzKTsgfVxuXG4gIGdldERpYWdub3N0aWNzKGFzdDogQVNUKTogVHlwZURpYWdub3N0aWNbXSB7XG4gICAgdGhpcy5kaWFnbm9zdGljcyA9IFtdO1xuICAgIGNvbnN0IHR5cGU6IFN5bWJvbCA9IGFzdC52aXNpdCh0aGlzKTtcbiAgICBpZiAodGhpcy5jb250ZXh0LmV2ZW50ICYmIHR5cGUuY2FsbGFibGUpIHtcbiAgICAgIHRoaXMucmVwb3J0V2FybmluZygnVW5leHBlY3RlZCBjYWxsYWJsZSBleHByZXNzaW9uLiBFeHBlY3RlZCBhIG1ldGhvZCBjYWxsJywgYXN0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGlhZ25vc3RpY3M7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSk6IFN5bWJvbCB7XG4gICAgLy8gVHJlYXQgdW5kZWZpbmVkIGFuZCBudWxsIGFzIG90aGVyLlxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShraW5kOiBCdWlsdGluVHlwZSwgb3RoZXI6IEJ1aWx0aW5UeXBlKTogQnVpbHRpblR5cGUge1xuICAgICAgc3dpdGNoIChraW5kKSB7XG4gICAgICAgIGNhc2UgQnVpbHRpblR5cGUuVW5kZWZpbmVkOlxuICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bGw6XG4gICAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZShvdGhlciwgQnVpbHRpblR5cGUuT3RoZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGtpbmQ7XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0VHlwZSA9IChhc3Q6IEFTVCwgb3BlcmF0aW9uOiBzdHJpbmcpOiBTeW1ib2wgPT4ge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuZ2V0VHlwZShhc3QpO1xuICAgICAgaWYgKHR5cGUubnVsbGFibGUpIHtcbiAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICBjYXNlICcmJic6XG4gICAgICAgICAgY2FzZSAnfHwnOlxuICAgICAgICAgIGNhc2UgJz09JzpcbiAgICAgICAgICBjYXNlICchPSc6XG4gICAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgICBjYXNlICchPT0nOlxuICAgICAgICAgICAgLy8gTnVsbGFibGUgYWxsb3dlZC5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLnJlcG9ydEVycm9yKGBUaGUgZXhwcmVzc2lvbiBtaWdodCBiZSBudWxsYCwgYXN0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldE5vbk51bGxhYmxlVHlwZSh0eXBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH07XG5cbiAgICBjb25zdCBsZWZ0VHlwZSA9IGdldFR5cGUoYXN0LmxlZnQsIGFzdC5vcGVyYXRpb24pO1xuICAgIGNvbnN0IHJpZ2h0VHlwZSA9IGdldFR5cGUoYXN0LnJpZ2h0LCBhc3Qub3BlcmF0aW9uKTtcbiAgICBjb25zdCBsZWZ0UmF3S2luZCA9IHRoaXMucXVlcnkuZ2V0VHlwZUtpbmQobGVmdFR5cGUpO1xuICAgIGNvbnN0IHJpZ2h0UmF3S2luZCA9IHRoaXMucXVlcnkuZ2V0VHlwZUtpbmQocmlnaHRUeXBlKTtcbiAgICBjb25zdCBsZWZ0S2luZCA9IG5vcm1hbGl6ZShsZWZ0UmF3S2luZCwgcmlnaHRSYXdLaW5kKTtcbiAgICBjb25zdCByaWdodEtpbmQgPSBub3JtYWxpemUocmlnaHRSYXdLaW5kLCBsZWZ0UmF3S2luZCk7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHN3dGljaCBpbXBsZW1lbnRzIG9wZXJhdG9yIHR5cGluZyBzaW1pbGFyIHRvIHRoZVxuICAgIC8vIHR5cGUgcHJvZHVjdGlvbiB0YWJsZXMgaW4gdGhlIFR5cGVTY3JpcHQgc3BlY2lmaWNhdGlvbi5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi92MS44LjEwL2RvYy9zcGVjLm1kIzQuMTlcbiAgICBjb25zdCBvcGVyS2luZCA9IGxlZnRLaW5kIDw8IDggfCByaWdodEtpbmQ7XG4gICAgc3dpdGNoIChhc3Qub3BlcmF0aW9uKSB7XG4gICAgICBjYXNlICcqJzpcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgY2FzZSAnJSc6XG4gICAgICBjYXNlICctJzpcbiAgICAgIGNhc2UgJzw8JzpcbiAgICAgIGNhc2UgJz4+JzpcbiAgICAgIGNhc2UgJz4+Pic6XG4gICAgICBjYXNlICcmJzpcbiAgICAgIGNhc2UgJ14nOlxuICAgICAgY2FzZSAnfCc6XG4gICAgICAgIHN3aXRjaCAob3BlcktpbmQpIHtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuTnVtYmVyKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGVycm9yQXN0ID0gYXN0LmxlZnQ7XG4gICAgICAgICAgICBzd2l0Y2ggKGxlZnRLaW5kKSB7XG4gICAgICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICAgICAgICBlcnJvckFzdCA9IGFzdC5yaWdodDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdFeHBlY3RlZCBhIG51bWVyaWMgdHlwZScsIGVycm9yQXN0KTtcbiAgICAgICAgfVxuICAgICAgY2FzZSAnKyc6XG4gICAgICAgIHN3aXRjaCAob3BlcktpbmQpIHtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5Cb29sZWFuOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQm9vbGVhbiA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5PdGhlciA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQm9vbGVhbiA8PCA4IHwgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5TdHJpbmcgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuQm9vbGVhbjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuU3RyaW5nIDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5TdHJpbmcgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuT3RoZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLlN0cmluZzpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLlN0cmluZyk7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLk51bWJlcik7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5Cb29sZWFuIDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5PdGhlciA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyIHR5cGUnLCBhc3QubGVmdCk7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLkJvb2xlYW46XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyIHR5cGUnLCBhc3QucmlnaHQpO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBvcnRFcnJvcignRXhwZWN0ZWQgb3BlcmFuZHMgdG8gYmUgYSBzdHJpbmcgb3IgbnVtYmVyIHR5cGUnLCBhc3QpO1xuICAgICAgICB9XG4gICAgICBjYXNlICc+JzpcbiAgICAgIGNhc2UgJzwnOlxuICAgICAgY2FzZSAnPD0nOlxuICAgICAgY2FzZSAnPj0nOlxuICAgICAgY2FzZSAnPT0nOlxuICAgICAgY2FzZSAnIT0nOlxuICAgICAgY2FzZSAnPT09JzpcbiAgICAgIGNhc2UgJyE9PSc6XG4gICAgICAgIHN3aXRjaCAob3BlcktpbmQpIHtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5Cb29sZWFuOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLlN0cmluZzpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuT3RoZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5Cb29sZWFuIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5Cb29sZWFuIDw8IDggfCBCdWlsdGluVHlwZS5Cb29sZWFuOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuU3RyaW5nIDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5PdGhlciA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuT3RoZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQm9vbGVhbik7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdFeHBlY3RlZCB0aGUgb3BlcmFudHMgdG8gYmUgb2Ygc2ltaWxhciB0eXBlIG9yIGFueScsIGFzdCk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgcmV0dXJuIHJpZ2h0VHlwZTtcbiAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0VHlwZVVuaW9uKGxlZnRUeXBlLCByaWdodFR5cGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKGBVbnJlY29nbml6ZWQgb3BlcmF0b3IgJHthc3Qub3BlcmF0aW9ufWAsIGFzdCk7XG4gIH1cblxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pIHtcbiAgICBpZiAodGhpcy5kaWFnbm9zdGljcykge1xuICAgICAgLy8gSWYgd2UgYXJlIHByb2R1Y2luZyBkaWFnbm9zdGljcywgdmlzaXQgdGhlIGNoaWxkcmVuXG4gICAgICB2aXNpdEFzdENoaWxkcmVuKGFzdCwgdGhpcyk7XG4gICAgfVxuICAgIC8vIFRoZSB0eXBlIG9mIGEgY2hhaW4gaXMgYWx3YXlzIHVuZGVmaW5lZC5cbiAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5VbmRlZmluZWQpO1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBjb25kaXRpb25hbCBpcyB0aGUgdW5pb24gb2YgdGhlIHRydWUgYW5kIGZhbHNlIGNvbmRpdGlvbnMuXG4gICAgaWYgKHRoaXMuZGlhZ25vc3RpY3MpIHtcbiAgICAgIHZpc2l0QXN0Q2hpbGRyZW4oYXN0LCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0VHlwZVVuaW9uKHRoaXMuZ2V0VHlwZShhc3QudHJ1ZUV4cCksIHRoaXMuZ2V0VHlwZShhc3QuZmFsc2VFeHApKTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBmdW5jdGlvbiBjYWxsIGlzIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgc2VsZWN0ZWQgc2lnbmF0dXJlLlxuICAgIC8vIFRoZSBzaWduYXR1cmUgaXMgc2VsZWN0ZWQgYmFzZWQgb24gdGhlIHR5cGVzIG9mIHRoZSBhcmd1bWVudHMuIEFuZ3VsYXIgZG9lc24ndFxuICAgIC8vIHN1cHBvcnQgY29udGV4dHVhbCB0eXBpbmcgb2YgYXJndW1lbnRzIHNvIHRoaXMgaXMgc2ltcGxlciB0aGFuIFR5cGVTY3JpcHQnc1xuICAgIC8vIHZlcnNpb24uXG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChhcmcgPT4gdGhpcy5nZXRUeXBlKGFyZykpO1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VHlwZShhc3QudGFyZ2V0ICEpO1xuICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuY2FsbGFibGUpIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdDYWxsIHRhcmdldCBpcyBub3QgY2FsbGFibGUnLCBhc3QpO1xuICAgIGNvbnN0IHNpZ25hdHVyZSA9IHRhcmdldC5zZWxlY3RTaWduYXR1cmUoYXJncyk7XG4gICAgaWYgKHNpZ25hdHVyZSkgcmV0dXJuIHNpZ25hdHVyZS5yZXN1bHQ7XG4gICAgLy8gVE9ETzogQ29uc2lkZXIgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSBoZXJlLlxuICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdVbmFibGUgbm8gY29tcGF0aWJsZSBzaWduYXR1cmUgZm91bmQgZm9yIGNhbGwnLCBhc3QpO1xuICB9XG5cbiAgdmlzaXRJbXBsaWNpdFJlY2VpdmVyKGFzdDogSW1wbGljaXRSZWNlaXZlcik6IFN5bWJvbCB7XG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgIC8vIFJldHVybiBhIHBzZXVkby1zeW1ib2wgZm9yIHRoZSBpbXBsaWNpdCByZWNlaXZlci5cbiAgICAvLyBUaGUgbWVtYmVycyBvZiB0aGUgaW1wbGljaXQgcmVjZWl2ZXIgYXJlIHdoYXQgaXMgZGVmaW5lZCBieSB0aGVcbiAgICAvLyBzY29wZSBwYXNzZWQgaW50byB0aGlzIGNsYXNzLlxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnJGltcGxpY3QnLFxuICAgICAga2luZDogJ2NvbXBvbmVudCcsXG4gICAgICBsYW5ndWFnZTogJ25nLXRlbXBsYXRlJyxcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIGNvbnRhaW5lcjogdW5kZWZpbmVkLFxuICAgICAgY2FsbGFibGU6IGZhbHNlLFxuICAgICAgbnVsbGFibGU6IGZhbHNlLFxuICAgICAgcHVibGljOiB0cnVlLFxuICAgICAgZGVmaW5pdGlvbjogdW5kZWZpbmVkLFxuICAgICAgbWVtYmVycygpOiBTeW1ib2xUYWJsZXtyZXR1cm4gX3RoaXMuc2NvcGU7fSxcbiAgICAgIHNpZ25hdHVyZXMoKTogU2lnbmF0dXJlW117cmV0dXJuIFtdO30sXG4gICAgICBzZWxlY3RTaWduYXR1cmUodHlwZXMpOiBTaWduYXR1cmUgfCB1bmRlZmluZWR7cmV0dXJuIHVuZGVmaW5lZDt9LFxuICAgICAgaW5kZXhlZChhcmd1bWVudCk6IFN5bWJvbCB8IHVuZGVmaW5lZHtyZXR1cm4gdW5kZWZpbmVkO31cbiAgICB9O1xuICB9XG5cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbik6IFN5bWJvbCB7XG4gICAgLy8gSWYgd2UgYXJlIHByb2R1Y2luZyBkaWFnbm9zdGljcywgdmlzaXQgdGhlIGNoaWxkcmVuLlxuICAgIGlmICh0aGlzLmRpYWdub3N0aWNzKSB7XG4gICAgICB2aXNpdEFzdENoaWxkcmVuKGFzdCwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVuZGVmaW5lZFR5cGU7XG4gIH1cblxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCk6IFN5bWJvbCB7XG4gICAgY29uc3QgdGFyZ2V0VHlwZSA9IHRoaXMuZ2V0VHlwZShhc3Qub2JqKTtcbiAgICBjb25zdCBrZXlUeXBlID0gdGhpcy5nZXRUeXBlKGFzdC5rZXkpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRhcmdldFR5cGUuaW5kZXhlZChrZXlUeXBlKTtcbiAgICByZXR1cm4gcmVzdWx0IHx8IHRoaXMuYW55VHlwZTtcbiAgfVxuXG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpOiBTeW1ib2wge1xuICAgIC8vIFRoZSB3cml0ZSBvZiBhIHR5cGUgaXMgdGhlIHR5cGUgb2YgdGhlIHZhbHVlIGJlaW5nIHdyaXR0ZW4uXG4gICAgcmV0dXJuIHRoaXMuZ2V0VHlwZShhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBMaXRlcmFsQXJyYXkpOiBTeW1ib2wge1xuICAgIC8vIEEgdHlwZSBsaXRlcmFsIGlzIGFuIGFycmF5IHR5cGUgb2YgdGhlIHVuaW9uIG9mIHRoZSBlbGVtZW50c1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEFycmF5VHlwZShcbiAgICAgICAgdGhpcy5xdWVyeS5nZXRUeXBlVW5pb24oLi4uYXN0LmV4cHJlc3Npb25zLm1hcChlbGVtZW50ID0+IHRoaXMuZ2V0VHlwZShlbGVtZW50KSkpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiBTeW1ib2wge1xuICAgIC8vIElmIHdlIGFyZSBwcm9kdWNpbmcgZGlhZ25vc3RpY3MsIHZpc2l0IHRoZSBjaGlsZHJlblxuICAgIGlmICh0aGlzLmRpYWdub3N0aWNzKSB7XG4gICAgICB2aXNpdEFzdENoaWxkcmVuKGFzdCwgdGhpcyk7XG4gICAgfVxuICAgIC8vIFRPRE86IFJldHVybiBhIGNvbXBvc2l0ZSB0eXBlLlxuICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gIH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBsaXRlcmFsIHByaW1pdGl2ZSBkZXBlbmRzIG9uIHRoZSB2YWx1ZSBvZiB0aGUgbGl0ZXJhbC5cbiAgICBzd2l0Y2ggKGFzdC52YWx1ZSkge1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgY2FzZSBmYWxzZTpcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQm9vbGVhbik7XG4gICAgICBjYXNlIG51bGw6XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLk51bGwpO1xuICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLlVuZGVmaW5lZCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiBhc3QudmFsdWUpIHtcbiAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuU3RyaW5nKTtcbiAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuTnVtYmVyKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoJ1VucmVjb2duaXplZCBwcmltaXRpdmUnLCBhc3QpO1xuICAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVNZXRob2RDYWxsKHRoaXMuZ2V0VHlwZShhc3QucmVjZWl2ZXIpLCBhc3QpO1xuICB9XG5cbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUpIHtcbiAgICAvLyBUaGUgdHlwZSBvZiBhIHBpcGUgbm9kZSBpcyB0aGUgcmV0dXJuIHR5cGUgb2YgdGhlIHBpcGUncyB0cmFuc2Zvcm0gbWV0aG9kLiBUaGUgdGFibGUgcmV0dXJuZWRcbiAgICAvLyBieSBnZXRQaXBlcygpIGlzIGV4cGVjdGVkIHRvIGNvbnRhaW4gc3ltYm9scyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHRyYW5zZm9ybSBtZXRob2QgdHlwZS5cbiAgICBjb25zdCBwaXBlID0gdGhpcy5xdWVyeS5nZXRQaXBlcygpLmdldChhc3QubmFtZSk7XG4gICAgaWYgKCFwaXBlKSByZXR1cm4gdGhpcy5yZXBvcnRFcnJvcihgTm8gcGlwZSBieSB0aGUgbmFtZSAke2FzdC5uYW1lfSBmb3VuZGAsIGFzdCk7XG4gICAgY29uc3QgZXhwVHlwZSA9IHRoaXMuZ2V0VHlwZShhc3QuZXhwKTtcbiAgICBjb25zdCBzaWduYXR1cmUgPVxuICAgICAgICBwaXBlLnNlbGVjdFNpZ25hdHVyZShbZXhwVHlwZV0uY29uY2F0KGFzdC5hcmdzLm1hcChhcmcgPT4gdGhpcy5nZXRUeXBlKGFyZykpKSk7XG4gICAgaWYgKCFzaWduYXR1cmUpIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKCdVbmFibGUgdG8gcmVzb2x2ZSBzaWduYXR1cmUgZm9yIHBpcGUgaW52b2NhdGlvbicsIGFzdCk7XG4gICAgcmV0dXJuIHNpZ25hdHVyZS5yZXN1bHQ7XG4gIH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCkge1xuICAgIC8vIFRoZSB0eXBlIG9mIGEgcHJlZml4ICEgaXMgYWx3YXlzIGJvb2xlYW4uXG4gICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQm9vbGVhbik7XG4gIH1cblxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0KSB7XG4gICAgY29uc3QgZXhwcmVzc2lvblR5cGUgPSB0aGlzLmdldFR5cGUoYXN0LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldE5vbk51bGxhYmxlVHlwZShleHByZXNzaW9uVHlwZSk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVQcm9wZXJ0eVJlYWQodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlciksIGFzdCk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSB3cml0ZSBpcyB0aGUgdHlwZSBvZiB0aGUgdmFsdWUgYmVpbmcgd3JpdHRlbi5cbiAgICByZXR1cm4gdGhpcy5nZXRUeXBlKGFzdC52YWx1ZSk7XG4gIH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpIHtcbiAgICAvLyBUaGUgdHlwZSBvZiBhIHF1b3RlZCBleHByZXNzaW9uIGlzIGFueS5cbiAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5BbnkpO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZU1ldGhvZENhbGwodGhpcy5xdWVyeS5nZXROb25OdWxsYWJsZVR5cGUodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlcikpLCBhc3QpO1xuICB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVQcm9wZXJ0eVJlYWQodGhpcy5xdWVyeS5nZXROb25OdWxsYWJsZVR5cGUodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlcikpLCBhc3QpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYW55VHlwZTogU3ltYm9sO1xuICBwcml2YXRlIGdldCBhbnlUeXBlKCk6IFN5bWJvbCB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuX2FueVR5cGU7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2FueVR5cGUgPSB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwcml2YXRlIF91bmRlZmluZWRUeXBlOiBTeW1ib2w7XG4gIHByaXZhdGUgZ2V0IHVuZGVmaW5lZFR5cGUoKTogU3ltYm9sIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fdW5kZWZpbmVkVHlwZTtcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5fdW5kZWZpbmVkVHlwZSA9IHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuVW5kZWZpbmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZU1ldGhvZENhbGwocmVjZWl2ZXJUeXBlOiBTeW1ib2wsIGFzdDogU2FmZU1ldGhvZENhbGx8TWV0aG9kQ2FsbCkge1xuICAgIGlmICh0aGlzLmlzQW55KHJlY2VpdmVyVHlwZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgfVxuXG4gICAgLy8gVGhlIHR5cGUgb2YgYSBtZXRob2QgaXMgdGhlIHNlbGVjdGVkIG1ldGhvZHMgcmVzdWx0IHR5cGUuXG4gICAgY29uc3QgbWV0aG9kID0gcmVjZWl2ZXJUeXBlLm1lbWJlcnMoKS5nZXQoYXN0Lm5hbWUpO1xuICAgIGlmICghbWV0aG9kKSByZXR1cm4gdGhpcy5yZXBvcnRFcnJvcihgVW5rbm93biBtZXRob2QgJyR7YXN0Lm5hbWV9J2AsIGFzdCk7XG4gICAgaWYgKCFtZXRob2QudHlwZSkgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgdHlwZSBmb3IgJyR7YXN0Lm5hbWV9J2AsIGFzdCk7XG4gICAgaWYgKCFtZXRob2QudHlwZS5jYWxsYWJsZSkgcmV0dXJuIHRoaXMucmVwb3J0RXJyb3IoYE1lbWJlciAnJHthc3QubmFtZX0nIGlzIG5vdCBjYWxsYWJsZWAsIGFzdCk7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gbWV0aG9kLnR5cGUuc2VsZWN0U2lnbmF0dXJlKGFzdC5hcmdzLm1hcChhcmcgPT4gdGhpcy5nZXRUeXBlKGFyZykpKTtcbiAgICBpZiAoIXNpZ25hdHVyZSlcbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKGBVbmFibGUgdG8gcmVzb2x2ZSBzaWduYXR1cmUgZm9yIGNhbGwgb2YgbWV0aG9kICR7YXN0Lm5hbWV9YCwgYXN0KTtcbiAgICByZXR1cm4gc2lnbmF0dXJlLnJlc3VsdDtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZVByb3BlcnR5UmVhZChyZWNlaXZlclR5cGU6IFN5bWJvbCwgYXN0OiBTYWZlUHJvcGVydHlSZWFkfFByb3BlcnR5UmVhZCkge1xuICAgIGlmICh0aGlzLmlzQW55KHJlY2VpdmVyVHlwZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgfVxuXG4gICAgLy8gVGhlIHR5cGUgb2YgYSBwcm9wZXJ0eSByZWFkIGlzIHRoZSBzZWVsY3RlZCBtZW1iZXIncyB0eXBlLlxuICAgIGNvbnN0IG1lbWJlciA9IHJlY2VpdmVyVHlwZS5tZW1iZXJzKCkuZ2V0KGFzdC5uYW1lKTtcbiAgICBpZiAoIW1lbWJlcikge1xuICAgICAgbGV0IHJlY2VpdmVySW5mbyA9IHJlY2VpdmVyVHlwZS5uYW1lO1xuICAgICAgaWYgKHJlY2VpdmVySW5mbyA9PSAnJGltcGxpY3QnKSB7XG4gICAgICAgIHJlY2VpdmVySW5mbyA9XG4gICAgICAgICAgICAnVGhlIGNvbXBvbmVudCBkZWNsYXJhdGlvbiwgdGVtcGxhdGUgdmFyaWFibGUgZGVjbGFyYXRpb25zLCBhbmQgZWxlbWVudCByZWZlcmVuY2VzIGRvJztcbiAgICAgIH0gZWxzZSBpZiAocmVjZWl2ZXJUeXBlLm51bGxhYmxlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKGBUaGUgZXhwcmVzc2lvbiBtaWdodCBiZSBudWxsYCwgYXN0LnJlY2VpdmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlY2VpdmVySW5mbyA9IGAnJHtyZWNlaXZlckluZm99JyBkb2VzYDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlcG9ydEVycm9yKFxuICAgICAgICAgIGBJZGVudGlmaWVyICcke2FzdC5uYW1lfScgaXMgbm90IGRlZmluZWQuICR7cmVjZWl2ZXJJbmZvfSBub3QgY29udGFpbiBzdWNoIGEgbWVtYmVyYCxcbiAgICAgICAgICBhc3QpO1xuICAgIH1cbiAgICBpZiAoIW1lbWJlci5wdWJsaWMpIHtcbiAgICAgIGxldCByZWNlaXZlckluZm8gPSByZWNlaXZlclR5cGUubmFtZTtcbiAgICAgIGlmIChyZWNlaXZlckluZm8gPT0gJyRpbXBsaWN0Jykge1xuICAgICAgICByZWNlaXZlckluZm8gPSAndGhlIGNvbXBvbmVudCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZWNlaXZlckluZm8gPSBgJyR7cmVjZWl2ZXJJbmZvfSdgO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXBvcnRXYXJuaW5nKFxuICAgICAgICAgIGBJZGVudGlmaWVyICcke2FzdC5uYW1lfScgcmVmZXJzIHRvIGEgcHJpdmF0ZSBtZW1iZXIgb2YgJHtyZWNlaXZlckluZm99YCwgYXN0KTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbWJlci50eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXBvcnRFcnJvcihtZXNzYWdlOiBzdHJpbmcsIGFzdDogQVNUKTogU3ltYm9sIHtcbiAgICBpZiAodGhpcy5kaWFnbm9zdGljcykge1xuICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKG5ldyBUeXBlRGlhZ25vc3RpYyhEaWFnbm9zdGljS2luZC5FcnJvciwgbWVzc2FnZSwgYXN0KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gIH1cblxuICBwcml2YXRlIHJlcG9ydFdhcm5pbmcobWVzc2FnZTogc3RyaW5nLCBhc3Q6IEFTVCk6IFN5bWJvbCB7XG4gICAgaWYgKHRoaXMuZGlhZ25vc3RpY3MpIHtcbiAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChuZXcgVHlwZURpYWdub3N0aWMoRGlhZ25vc3RpY0tpbmQuV2FybmluZywgbWVzc2FnZSwgYXN0KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gIH1cblxuICBwcml2YXRlIGlzQW55KHN5bWJvbDogU3ltYm9sKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICFzeW1ib2wgfHwgdGhpcy5xdWVyeS5nZXRUeXBlS2luZChzeW1ib2wpID09IEJ1aWx0aW5UeXBlLkFueSB8fFxuICAgICAgICAoISFzeW1ib2wudHlwZSAmJiB0aGlzLmlzQW55KHN5bWJvbC50eXBlKSk7XG4gIH1cbn0iXX0=