/// <amd-module name="@angular/language-service/src/locate_symbol" />
import { TemplateInfo } from './common';
import { Span, Symbol } from './types';
export interface SymbolInfo {
    symbol: Symbol;
    span: Span;
}
export declare function locateSymbol(info: TemplateInfo): SymbolInfo | undefined;
