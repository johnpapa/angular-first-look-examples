/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ɵparseCookieValue as parseCookieValue } from '@angular/common';
import { ɵglobal as global } from '@angular/core';
import { setRootDomAdapter } from '../dom/dom_adapter';
import { GenericBrowserDomAdapter } from './generic_browser_adapter';
var _attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex',
};
var DOM_KEY_LOCATION_NUMPAD = 3;
// Map to convert some key or keyIdentifier values to what will be returned by getEventKey
var _keyMap = {
    // The following values are here for cross-browser compatibility and to match the W3C standard
    // cf http://www.w3.org/TR/DOM-Level-3-Events-key/
    '\b': 'Backspace',
    '\t': 'Tab',
    '\x7F': 'Delete',
    '\x1B': 'Escape',
    'Del': 'Delete',
    'Esc': 'Escape',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
    'Up': 'ArrowUp',
    'Down': 'ArrowDown',
    'Menu': 'ContextMenu',
    'Scroll': 'ScrollLock',
    'Win': 'OS'
};
// There is a bug in Chrome for numeric keypad keys:
// https://code.google.com/p/chromium/issues/detail?id=155654
// 1, 2, 3 ... are reported as A, B, C ...
var _chromeNumKeyPadMap = {
    'A': '1',
    'B': '2',
    'C': '3',
    'D': '4',
    'E': '5',
    'F': '6',
    'G': '7',
    'H': '8',
    'I': '9',
    'J': '*',
    'K': '+',
    'M': '-',
    'N': '.',
    'O': '/',
    '\x60': '0',
    '\x90': 'NumLock'
};
var nodeContains;
if (global['Node']) {
    nodeContains = global['Node'].prototype.contains || function (node) {
        return !!(this.compareDocumentPosition(node) & 16);
    };
}
/**
 * A `DomAdapter` powered by full browser DOM APIs.
 *
 * @security Tread carefully! Interacting with the DOM directly is dangerous and
 * can introduce XSS risks.
 */
/* tslint:disable:requireParameterType no-console */
var BrowserDomAdapter = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserDomAdapter, _super);
    function BrowserDomAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BrowserDomAdapter.prototype.parse = function (templateHtml) { throw new Error('parse not implemented'); };
    BrowserDomAdapter.makeCurrent = function () { setRootDomAdapter(new BrowserDomAdapter()); };
    BrowserDomAdapter.prototype.hasProperty = function (element, name) { return name in element; };
    BrowserDomAdapter.prototype.setProperty = function (el, name, value) { el[name] = value; };
    BrowserDomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
    BrowserDomAdapter.prototype.invoke = function (el, methodName, args) {
        (_a = el)[methodName].apply(_a, tslib_1.__spread(args));
        var _a;
    };
    // TODO(tbosch): move this into a separate environment class once we have it
    BrowserDomAdapter.prototype.logError = function (error) {
        if (window.console) {
            if (console.error) {
                console.error(error);
            }
            else {
                console.log(error);
            }
        }
    };
    BrowserDomAdapter.prototype.log = function (error) {
        if (window.console) {
            window.console.log && window.console.log(error);
        }
    };
    BrowserDomAdapter.prototype.logGroup = function (error) {
        if (window.console) {
            window.console.group && window.console.group(error);
        }
    };
    BrowserDomAdapter.prototype.logGroupEnd = function () {
        if (window.console) {
            window.console.groupEnd && window.console.groupEnd();
        }
    };
    Object.defineProperty(BrowserDomAdapter.prototype, "attrToPropMap", {
        get: function () { return _attrToPropMap; },
        enumerable: true,
        configurable: true
    });
    BrowserDomAdapter.prototype.contains = function (nodeA, nodeB) { return nodeContains.call(nodeA, nodeB); };
    BrowserDomAdapter.prototype.querySelector = function (el, selector) { return el.querySelector(selector); };
    BrowserDomAdapter.prototype.querySelectorAll = function (el, selector) { return el.querySelectorAll(selector); };
    BrowserDomAdapter.prototype.on = function (el, evt, listener) { el.addEventListener(evt, listener, false); };
    BrowserDomAdapter.prototype.onAndCancel = function (el, evt, listener) {
        el.addEventListener(evt, listener, false);
        // Needed to follow Dart's subscription semantic, until fix of
        // https://code.google.com/p/dart/issues/detail?id=17406
        return function () { el.removeEventListener(evt, listener, false); };
    };
    BrowserDomAdapter.prototype.dispatchEvent = function (el, evt) { el.dispatchEvent(evt); };
    BrowserDomAdapter.prototype.createMouseEvent = function (eventType) {
        var evt = this.getDefaultDocument().createEvent('MouseEvent');
        evt.initEvent(eventType, true, true);
        return evt;
    };
    BrowserDomAdapter.prototype.createEvent = function (eventType) {
        var evt = this.getDefaultDocument().createEvent('Event');
        evt.initEvent(eventType, true, true);
        return evt;
    };
    BrowserDomAdapter.prototype.preventDefault = function (evt) {
        evt.preventDefault();
        evt.returnValue = false;
    };
    BrowserDomAdapter.prototype.isPrevented = function (evt) {
        return evt.defaultPrevented || evt.returnValue != null && !evt.returnValue;
    };
    BrowserDomAdapter.prototype.getInnerHTML = function (el) { return el.innerHTML; };
    BrowserDomAdapter.prototype.getTemplateContent = function (el) {
        return 'content' in el && this.isTemplateElement(el) ? el.content : null;
    };
    BrowserDomAdapter.prototype.getOuterHTML = function (el) { return el.outerHTML; };
    BrowserDomAdapter.prototype.nodeName = function (node) { return node.nodeName; };
    BrowserDomAdapter.prototype.nodeValue = function (node) { return node.nodeValue; };
    BrowserDomAdapter.prototype.type = function (node) { return node.type; };
    BrowserDomAdapter.prototype.content = function (node) {
        if (this.hasProperty(node, 'content')) {
            return node.content;
        }
        else {
            return node;
        }
    };
    BrowserDomAdapter.prototype.firstChild = function (el) { return el.firstChild; };
    BrowserDomAdapter.prototype.nextSibling = function (el) { return el.nextSibling; };
    BrowserDomAdapter.prototype.parentElement = function (el) { return el.parentNode; };
    BrowserDomAdapter.prototype.childNodes = function (el) { return el.childNodes; };
    BrowserDomAdapter.prototype.childNodesAsList = function (el) {
        var childNodes = el.childNodes;
        var res = new Array(childNodes.length);
        for (var i = 0; i < childNodes.length; i++) {
            res[i] = childNodes[i];
        }
        return res;
    };
    BrowserDomAdapter.prototype.clearNodes = function (el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    };
    BrowserDomAdapter.prototype.appendChild = function (el, node) { el.appendChild(node); };
    BrowserDomAdapter.prototype.removeChild = function (el, node) { el.removeChild(node); };
    BrowserDomAdapter.prototype.replaceChild = function (el, newChild, oldChild) { el.replaceChild(newChild, oldChild); };
    BrowserDomAdapter.prototype.remove = function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return node;
    };
    BrowserDomAdapter.prototype.insertBefore = function (parent, ref, node) { parent.insertBefore(node, ref); };
    BrowserDomAdapter.prototype.insertAllBefore = function (parent, ref, nodes) {
        nodes.forEach(function (n) { return parent.insertBefore(n, ref); });
    };
    BrowserDomAdapter.prototype.insertAfter = function (parent, ref, node) { parent.insertBefore(node, ref.nextSibling); };
    BrowserDomAdapter.prototype.setInnerHTML = function (el, value) { el.innerHTML = value; };
    BrowserDomAdapter.prototype.getText = function (el) { return el.textContent; };
    BrowserDomAdapter.prototype.setText = function (el, value) { el.textContent = value; };
    BrowserDomAdapter.prototype.getValue = function (el) { return el.value; };
    BrowserDomAdapter.prototype.setValue = function (el, value) { el.value = value; };
    BrowserDomAdapter.prototype.getChecked = function (el) { return el.checked; };
    BrowserDomAdapter.prototype.setChecked = function (el, value) { el.checked = value; };
    BrowserDomAdapter.prototype.createComment = function (text) { return this.getDefaultDocument().createComment(text); };
    BrowserDomAdapter.prototype.createTemplate = function (html) {
        var t = this.getDefaultDocument().createElement('template');
        t.innerHTML = html;
        return t;
    };
    BrowserDomAdapter.prototype.createElement = function (tagName, doc) {
        doc = doc || this.getDefaultDocument();
        return doc.createElement(tagName);
    };
    BrowserDomAdapter.prototype.createElementNS = function (ns, tagName, doc) {
        doc = doc || this.getDefaultDocument();
        return doc.createElementNS(ns, tagName);
    };
    BrowserDomAdapter.prototype.createTextNode = function (text, doc) {
        doc = doc || this.getDefaultDocument();
        return doc.createTextNode(text);
    };
    BrowserDomAdapter.prototype.createScriptTag = function (attrName, attrValue, doc) {
        doc = doc || this.getDefaultDocument();
        var el = doc.createElement('SCRIPT');
        el.setAttribute(attrName, attrValue);
        return el;
    };
    BrowserDomAdapter.prototype.createStyleElement = function (css, doc) {
        doc = doc || this.getDefaultDocument();
        var style = doc.createElement('style');
        this.appendChild(style, this.createTextNode(css, doc));
        return style;
    };
    BrowserDomAdapter.prototype.createShadowRoot = function (el) { return el.createShadowRoot(); };
    BrowserDomAdapter.prototype.getShadowRoot = function (el) { return el.shadowRoot; };
    BrowserDomAdapter.prototype.getHost = function (el) { return el.host; };
    BrowserDomAdapter.prototype.clone = function (node) { return node.cloneNode(true); };
    BrowserDomAdapter.prototype.getElementsByClassName = function (element, name) {
        return element.getElementsByClassName(name);
    };
    BrowserDomAdapter.prototype.getElementsByTagName = function (element, name) {
        return element.getElementsByTagName(name);
    };
    BrowserDomAdapter.prototype.classList = function (element) { return Array.prototype.slice.call(element.classList, 0); };
    BrowserDomAdapter.prototype.addClass = function (element, className) { element.classList.add(className); };
    BrowserDomAdapter.prototype.removeClass = function (element, className) { element.classList.remove(className); };
    BrowserDomAdapter.prototype.hasClass = function (element, className) {
        return element.classList.contains(className);
    };
    BrowserDomAdapter.prototype.setStyle = function (element, styleName, styleValue) {
        element.style[styleName] = styleValue;
    };
    BrowserDomAdapter.prototype.removeStyle = function (element, stylename) {
        // IE requires '' instead of null
        // see https://github.com/angular/angular/issues/7916
        element.style[stylename] = '';
    };
    BrowserDomAdapter.prototype.getStyle = function (element, stylename) { return element.style[stylename]; };
    BrowserDomAdapter.prototype.hasStyle = function (element, styleName, styleValue) {
        var value = this.getStyle(element, styleName) || '';
        return styleValue ? value == styleValue : value.length > 0;
    };
    BrowserDomAdapter.prototype.tagName = function (element) { return element.tagName; };
    BrowserDomAdapter.prototype.attributeMap = function (element) {
        var res = new Map();
        var elAttrs = element.attributes;
        for (var i = 0; i < elAttrs.length; i++) {
            var attrib = elAttrs.item(i);
            res.set(attrib.name, attrib.value);
        }
        return res;
    };
    BrowserDomAdapter.prototype.hasAttribute = function (element, attribute) {
        return element.hasAttribute(attribute);
    };
    BrowserDomAdapter.prototype.hasAttributeNS = function (element, ns, attribute) {
        return element.hasAttributeNS(ns, attribute);
    };
    BrowserDomAdapter.prototype.getAttribute = function (element, attribute) {
        return element.getAttribute(attribute);
    };
    BrowserDomAdapter.prototype.getAttributeNS = function (element, ns, name) {
        return element.getAttributeNS(ns, name);
    };
    BrowserDomAdapter.prototype.setAttribute = function (element, name, value) { element.setAttribute(name, value); };
    BrowserDomAdapter.prototype.setAttributeNS = function (element, ns, name, value) {
        element.setAttributeNS(ns, name, value);
    };
    BrowserDomAdapter.prototype.removeAttribute = function (element, attribute) { element.removeAttribute(attribute); };
    BrowserDomAdapter.prototype.removeAttributeNS = function (element, ns, name) {
        element.removeAttributeNS(ns, name);
    };
    BrowserDomAdapter.prototype.templateAwareRoot = function (el) { return this.isTemplateElement(el) ? this.content(el) : el; };
    BrowserDomAdapter.prototype.createHtmlDocument = function () {
        return document.implementation.createHTMLDocument('fakeTitle');
    };
    BrowserDomAdapter.prototype.getDefaultDocument = function () { return document; };
    BrowserDomAdapter.prototype.getBoundingClientRect = function (el) {
        try {
            return el.getBoundingClientRect();
        }
        catch (e) {
            return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
        }
    };
    BrowserDomAdapter.prototype.getTitle = function (doc) { return doc.title; };
    BrowserDomAdapter.prototype.setTitle = function (doc, newTitle) { doc.title = newTitle || ''; };
    BrowserDomAdapter.prototype.elementMatches = function (n, selector) {
        if (this.isElementNode(n)) {
            return n.matches && n.matches(selector) ||
                n.msMatchesSelector && n.msMatchesSelector(selector) ||
                n.webkitMatchesSelector && n.webkitMatchesSelector(selector);
        }
        return false;
    };
    BrowserDomAdapter.prototype.isTemplateElement = function (el) {
        return this.isElementNode(el) && el.nodeName === 'TEMPLATE';
    };
    BrowserDomAdapter.prototype.isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
    BrowserDomAdapter.prototype.isCommentNode = function (node) { return node.nodeType === Node.COMMENT_NODE; };
    BrowserDomAdapter.prototype.isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
    BrowserDomAdapter.prototype.hasShadowRoot = function (node) {
        return node.shadowRoot != null && node instanceof HTMLElement;
    };
    BrowserDomAdapter.prototype.isShadowRoot = function (node) { return node instanceof DocumentFragment; };
    BrowserDomAdapter.prototype.importIntoDoc = function (node) { return document.importNode(this.templateAwareRoot(node), true); };
    BrowserDomAdapter.prototype.adoptNode = function (node) { return document.adoptNode(node); };
    BrowserDomAdapter.prototype.getHref = function (el) { return el.getAttribute('href'); };
    BrowserDomAdapter.prototype.getEventKey = function (event) {
        var key = event.key;
        if (key == null) {
            key = event.keyIdentifier;
            // keyIdentifier is defined in the old draft of DOM Level 3 Events implemented by Chrome and
            // Safari cf
            // http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/events.html#Events-KeyboardEvents-Interfaces
            if (key == null) {
                return 'Unidentified';
            }
            if (key.startsWith('U+')) {
                key = String.fromCharCode(parseInt(key.substring(2), 16));
                if (event.location === DOM_KEY_LOCATION_NUMPAD && _chromeNumKeyPadMap.hasOwnProperty(key)) {
                    // There is a bug in Chrome for numeric keypad keys:
                    // https://code.google.com/p/chromium/issues/detail?id=155654
                    // 1, 2, 3 ... are reported as A, B, C ...
                    key = _chromeNumKeyPadMap[key];
                }
            }
        }
        return _keyMap[key] || key;
    };
    BrowserDomAdapter.prototype.getGlobalEventTarget = function (doc, target) {
        if (target === 'window') {
            return window;
        }
        if (target === 'document') {
            return doc;
        }
        if (target === 'body') {
            return doc.body;
        }
        return null;
    };
    BrowserDomAdapter.prototype.getHistory = function () { return window.history; };
    BrowserDomAdapter.prototype.getLocation = function () { return window.location; };
    BrowserDomAdapter.prototype.getBaseHref = function (doc) {
        var href = getBaseElementHref();
        return href == null ? null : relativePath(href);
    };
    BrowserDomAdapter.prototype.resetBaseElement = function () { baseElement = null; };
    BrowserDomAdapter.prototype.getUserAgent = function () { return window.navigator.userAgent; };
    BrowserDomAdapter.prototype.setData = function (element, name, value) {
        this.setAttribute(element, 'data-' + name, value);
    };
    BrowserDomAdapter.prototype.getData = function (element, name) {
        return this.getAttribute(element, 'data-' + name);
    };
    BrowserDomAdapter.prototype.getComputedStyle = function (element) { return getComputedStyle(element); };
    // TODO(tbosch): move this into a separate environment class once we have it
    BrowserDomAdapter.prototype.supportsWebAnimation = function () {
        return typeof Element.prototype['animate'] === 'function';
    };
    BrowserDomAdapter.prototype.performanceNow = function () {
        // performance.now() is not available in all browsers, see
        // http://caniuse.com/#search=performance.now
        return window.performance && window.performance.now ? window.performance.now() :
            new Date().getTime();
    };
    BrowserDomAdapter.prototype.supportsCookies = function () { return true; };
    BrowserDomAdapter.prototype.getCookie = function (name) { return parseCookieValue(document.cookie, name); };
    BrowserDomAdapter.prototype.setCookie = function (name, value) {
        // document.cookie is magical, assigning into it assigns/overrides one cookie value, but does
        // not clear other cookies.
        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    };
    return BrowserDomAdapter;
}(GenericBrowserDomAdapter));
export { BrowserDomAdapter };
var baseElement = null;
function getBaseElementHref() {
    if (!baseElement) {
        baseElement = document.querySelector('base');
        if (!baseElement) {
            return null;
        }
    }
    return baseElement.getAttribute('href');
}
// based on urlUtils.js in AngularJS 1
var urlParsingNode;
function relativePath(url) {
    if (!urlParsingNode) {
        urlParsingNode = document.createElement('a');
    }
    urlParsingNode.setAttribute('href', url);
    return (urlParsingNode.pathname.charAt(0) === '/') ? urlParsingNode.pathname :
        '/' + urlParsingNode.pathname;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcGxhdGZvcm0tYnJvd3Nlci9zcmMvYnJvd3Nlci9icm93c2VyX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxPQUFPLElBQUksTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWhELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXJELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRW5FLElBQU0sY0FBYyxHQUFHO0lBQ3JCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFdBQVcsRUFBRSxXQUFXO0lBQ3hCLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLFVBQVUsRUFBRSxVQUFVO0NBQ3ZCLENBQUM7QUFFRixJQUFNLHVCQUF1QixHQUFHLENBQUMsQ0FBQztBQUVsQywwRkFBMEY7QUFDMUYsSUFBTSxPQUFPLEdBQTBCO0lBQ3JDLDhGQUE4RjtJQUM5RixrREFBa0Q7SUFDbEQsSUFBSSxFQUFFLFdBQVc7SUFDakIsSUFBSSxFQUFFLEtBQUs7SUFDWCxNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixLQUFLLEVBQUUsUUFBUTtJQUNmLEtBQUssRUFBRSxRQUFRO0lBQ2YsTUFBTSxFQUFFLFdBQVc7SUFDbkIsT0FBTyxFQUFFLFlBQVk7SUFDckIsSUFBSSxFQUFFLFNBQVM7SUFDZixNQUFNLEVBQUUsV0FBVztJQUNuQixNQUFNLEVBQUUsYUFBYTtJQUNyQixRQUFRLEVBQUUsWUFBWTtJQUN0QixLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFFRixvREFBb0Q7QUFDcEQs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QUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsY0FBYyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELGNBQWMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekIsR0FBRyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUM7QUFDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHvJtXBhcnNlQ29va2llVmFsdWUgYXMgcGFyc2VDb29raWVWYWx1ZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7ybVnbG9iYWwgYXMgZ2xvYmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtzZXRSb290RG9tQWRhcHRlcn0gZnJvbSAnLi4vZG9tL2RvbV9hZGFwdGVyJztcblxuaW1wb3J0IHtHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXJ9IGZyb20gJy4vZ2VuZXJpY19icm93c2VyX2FkYXB0ZXInO1xuXG5jb25zdCBfYXR0clRvUHJvcE1hcCA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdpbm5lckh0bWwnOiAnaW5uZXJIVE1MJyxcbiAgJ3JlYWRvbmx5JzogJ3JlYWRPbmx5JyxcbiAgJ3RhYmluZGV4JzogJ3RhYkluZGV4Jyxcbn07XG5cbmNvbnN0IERPTV9LRVlfTE9DQVRJT05fTlVNUEFEID0gMztcblxuLy8gTWFwIHRvIGNvbnZlcnQgc29tZSBrZXkgb3Iga2V5SWRlbnRpZmllciB2YWx1ZXMgdG8gd2hhdCB3aWxsIGJlIHJldHVybmVkIGJ5IGdldEV2ZW50S2V5XG5jb25zdCBfa2V5TWFwOiB7W2s6IHN0cmluZ106IHN0cmluZ30gPSB7XG4gIC8vIFRoZSBmb2xsb3dpbmcgdmFsdWVzIGFyZSBoZXJlIGZvciBjcm9zcy1icm93c2VyIGNvbXBhdGliaWxpdHkgYW5kIHRvIG1hdGNoIHRoZSBXM0Mgc3RhbmRhcmRcbiAgLy8gY2YgaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLWtleS9cbiAgJ1xcYic6ICdCYWNrc3BhY2UnLFxuICAnXFx0JzogJ1RhYicsXG4gICdcXHg3Ric6ICdEZWxldGUnLFxuICAnXFx4MUInOiAnRXNjYXBlJyxcbiAgJ0RlbCc6ICdEZWxldGUnLFxuICAnRXNjJzogJ0VzY2FwZScsXG4gICdMZWZ0JzogJ0Fycm93TGVmdCcsXG4gICdSaWdodCc6ICdBcnJvd1JpZ2h0JyxcbiAgJ1VwJzogJ0Fycm93VXAnLFxuICAnRG93bic6ICdBcnJvd0Rvd24nLFxuICAnTWVudSc6ICdDb250ZXh0TWVudScsXG4gICdTY3JvbGwnOiAnU2Nyb2xsTG9jaycsXG4gICdXaW4nOiAnT1MnXG59O1xuXG4vLyBUaGVyZSBpcyBhIGJ1ZyBpbiBDaHJvbWUgZm9yIG51bWVyaWMga2V5cGFkIGtleXM6XG4vLyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTU1NjU0XG4vLyAxLCAyLCAzIC4uLiBhcmUgcmVwb3J0ZWQgYXMgQSwgQiwgQyAuLi5cbmNvbnN0IF9jaHJvbWVOdW1LZXlQYWRNYXAgPSB7XG4gICdBJzogJzEnLFxuICAnQic6ICcyJyxcbiAgJ0MnOiAnMycsXG4gICdEJzogJzQnLFxuICAnRSc6ICc1JyxcbiAgJ0YnOiAnNicsXG4gICdHJzogJzcnLFxuICAnSCc6ICc4JyxcbiAgJ0knOiAnOScsXG4gICdKJzogJyonLFxuICAnSyc6ICcrJyxcbiAgJ00nOiAnLScsXG4gICdOJzogJy4nLFxuICAnTyc6ICcvJyxcbiAgJ1xceDYwJzogJzAnLFxuICAnXFx4OTAnOiAnTnVtTG9jaydcbn07XG5cbmxldCBub2RlQ29udGFpbnM6IChhOiBhbnksIGI6IGFueSkgPT4gYm9vbGVhbjtcblxuaWYgKGdsb2JhbFsnTm9kZSddKSB7XG4gIG5vZGVDb250YWlucyA9IGdsb2JhbFsnTm9kZSddLnByb3RvdHlwZS5jb250YWlucyB8fCBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuICEhKHRoaXMuY29tcGFyZURvY3VtZW50UG9zaXRpb24obm9kZSkgJiAxNik7XG4gIH07XG59XG5cbi8qKlxuICogQSBgRG9tQWRhcHRlcmAgcG93ZXJlZCBieSBmdWxsIGJyb3dzZXIgRE9NIEFQSXMuXG4gKlxuICogQHNlY3VyaXR5IFRyZWFkIGNhcmVmdWxseSEgSW50ZXJhY3Rpbmcgd2l0aCB0aGUgRE9NIGRpcmVjdGx5IGlzIGRhbmdlcm91cyBhbmRcbiAqIGNhbiBpbnRyb2R1Y2UgWFNTIHJpc2tzLlxuICovXG4vKiB0c2xpbnQ6ZGlzYWJsZTpyZXF1aXJlUGFyYW1ldGVyVHlwZSBuby1jb25zb2xlICovXG5leHBvcnQgY2xhc3MgQnJvd3NlckRvbUFkYXB0ZXIgZXh0ZW5kcyBHZW5lcmljQnJvd3NlckRvbUFkYXB0ZXIge1xuICBwYXJzZSh0ZW1wbGF0ZUh0bWw6IHN0cmluZykgeyB0aHJvdyBuZXcgRXJyb3IoJ3BhcnNlIG5vdCBpbXBsZW1lbnRlZCcpOyB9XG4gIHN0YXRpYyBtYWtlQ3VycmVudCgpIHsgc2V0Um9vdERvbUFkYXB0ZXIobmV3IEJyb3dzZXJEb21BZGFwdGVyKCkpOyB9XG4gIGhhc1Byb3BlcnR5KGVsZW1lbnQ6IE5vZGUsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gbmFtZSBpbiBlbGVtZW50OyB9XG4gIHNldFByb3BlcnR5KGVsOiBOb2RlLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHsgKDxhbnk+ZWwpW25hbWVdID0gdmFsdWU7IH1cbiAgZ2V0UHJvcGVydHkoZWw6IE5vZGUsIG5hbWU6IHN0cmluZyk6IGFueSB7IHJldHVybiAoPGFueT5lbClbbmFtZV07IH1cbiAgaW52b2tlKGVsOiBOb2RlLCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKTogYW55IHsgKDxhbnk+ZWwpW21ldGhvZE5hbWVdKC4uLmFyZ3MpOyB9XG5cbiAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHRoaXMgaW50byBhIHNlcGFyYXRlIGVudmlyb25tZW50IGNsYXNzIG9uY2Ugd2UgaGF2ZSBpdFxuICBsb2dFcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHdpbmRvdy5jb25zb2xlKSB7XG4gICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsb2coZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUubG9nICYmIHdpbmRvdy5jb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgbG9nR3JvdXAoZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUuZ3JvdXAgJiYgd2luZG93LmNvbnNvbGUuZ3JvdXAoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGxvZ0dyb3VwRW5kKCk6IHZvaWQge1xuICAgIGlmICh3aW5kb3cuY29uc29sZSkge1xuICAgICAgd2luZG93LmNvbnNvbGUuZ3JvdXBFbmQgJiYgd2luZG93LmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgYXR0clRvUHJvcE1hcCgpOiBhbnkgeyByZXR1cm4gX2F0dHJUb1Byb3BNYXA7IH1cblxuICBjb250YWlucyhub2RlQTogYW55LCBub2RlQjogYW55KTogYm9vbGVhbiB7IHJldHVybiBub2RlQ29udGFpbnMuY2FsbChub2RlQSwgbm9kZUIpOyB9XG4gIHF1ZXJ5U2VsZWN0b3IoZWw6IEVsZW1lbnQsIHNlbGVjdG9yOiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gZWwucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7IH1cbiAgcXVlcnlTZWxlY3RvckFsbChlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYW55W10geyByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7IH1cbiAgb24oZWw6IE5vZGUsIGV2dDogYW55LCBsaXN0ZW5lcjogYW55KSB7IGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBsaXN0ZW5lciwgZmFsc2UpOyB9XG4gIG9uQW5kQ2FuY2VsKGVsOiBOb2RlLCBldnQ6IGFueSwgbGlzdGVuZXI6IGFueSk6IEZ1bmN0aW9uIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2dCwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAvLyBOZWVkZWQgdG8gZm9sbG93IERhcnQncyBzdWJzY3JpcHRpb24gc2VtYW50aWMsIHVudGlsIGZpeCBvZlxuICAgIC8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvZGFydC9pc3N1ZXMvZGV0YWlsP2lkPTE3NDA2XG4gICAgcmV0dXJuICgpID0+IHsgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGxpc3RlbmVyLCBmYWxzZSk7IH07XG4gIH1cbiAgZGlzcGF0Y2hFdmVudChlbDogTm9kZSwgZXZ0OiBhbnkpIHsgZWwuZGlzcGF0Y2hFdmVudChldnQpOyB9XG4gIGNyZWF0ZU1vdXNlRXZlbnQoZXZlbnRUeXBlOiBzdHJpbmcpOiBNb3VzZUV2ZW50IHtcbiAgICBjb25zdCBldnQ6IE1vdXNlRXZlbnQgPSB0aGlzLmdldERlZmF1bHREb2N1bWVudCgpLmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgZXZ0LmluaXRFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUpO1xuICAgIHJldHVybiBldnQ7XG4gIH1cbiAgY3JlYXRlRXZlbnQoZXZlbnRUeXBlOiBhbnkpOiBFdmVudCB7XG4gICAgY29uc3QgZXZ0OiBFdmVudCA9IHRoaXMuZ2V0RGVmYXVsdERvY3VtZW50KCkuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZXZ0LmluaXRFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUpO1xuICAgIHJldHVybiBldnQ7XG4gIH1cbiAgcHJldmVudERlZmF1bHQoZXZ0OiBFdmVudCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2dC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICB9XG4gIGlzUHJldmVudGVkKGV2dDogRXZlbnQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZXZ0LmRlZmF1bHRQcmV2ZW50ZWQgfHwgZXZ0LnJldHVyblZhbHVlICE9IG51bGwgJiYgIWV2dC5yZXR1cm5WYWx1ZTtcbiAgfVxuICBnZXRJbm5lckhUTUwoZWw6IEhUTUxFbGVtZW50KTogc3RyaW5nIHsgcmV0dXJuIGVsLmlubmVySFRNTDsgfVxuICBnZXRUZW1wbGF0ZUNvbnRlbnQoZWw6IE5vZGUpOiBOb2RlfG51bGwge1xuICAgIHJldHVybiAnY29udGVudCcgaW4gZWwgJiYgdGhpcy5pc1RlbXBsYXRlRWxlbWVudChlbCkgPyAoPGFueT5lbCkuY29udGVudCA6IG51bGw7XG4gIH1cbiAgZ2V0T3V0ZXJIVE1MKGVsOiBIVE1MRWxlbWVudCk6IHN0cmluZyB7IHJldHVybiBlbC5vdXRlckhUTUw7IH1cbiAgbm9kZU5hbWUobm9kZTogTm9kZSk6IHN0cmluZyB7IHJldHVybiBub2RlLm5vZGVOYW1lOyB9XG4gIG5vZGVWYWx1ZShub2RlOiBOb2RlKTogc3RyaW5nfG51bGwgeyByZXR1cm4gbm9kZS5ub2RlVmFsdWU7IH1cbiAgdHlwZShub2RlOiBIVE1MSW5wdXRFbGVtZW50KTogc3RyaW5nIHsgcmV0dXJuIG5vZGUudHlwZTsgfVxuICBjb250ZW50KG5vZGU6IE5vZGUpOiBOb2RlIHtcbiAgICBpZiAodGhpcy5oYXNQcm9wZXJ0eShub2RlLCAnY29udGVudCcpKSB7XG4gICAgICByZXR1cm4gKDxhbnk+bm9kZSkuY29udGVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG4gIGZpcnN0Q2hpbGQoZWw6IE5vZGUpOiBOb2RlfG51bGwgeyByZXR1cm4gZWwuZmlyc3RDaGlsZDsgfVxuICBuZXh0U2libGluZyhlbDogTm9kZSk6IE5vZGV8bnVsbCB7IHJldHVybiBlbC5uZXh0U2libGluZzsgfVxuICBwYXJlbnRFbGVtZW50KGVsOiBOb2RlKTogTm9kZXxudWxsIHsgcmV0dXJuIGVsLnBhcmVudE5vZGU7IH1cbiAgY2hpbGROb2RlcyhlbDogYW55KTogTm9kZVtdIHsgcmV0dXJuIGVsLmNoaWxkTm9kZXM7IH1cbiAgY2hpbGROb2Rlc0FzTGlzdChlbDogTm9kZSk6IGFueVtdIHtcbiAgICBjb25zdCBjaGlsZE5vZGVzID0gZWwuY2hpbGROb2RlcztcbiAgICBjb25zdCByZXMgPSBuZXcgQXJyYXkoY2hpbGROb2Rlcy5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzW2ldID0gY2hpbGROb2Rlc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICBjbGVhck5vZGVzKGVsOiBOb2RlKSB7XG4gICAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpIHtcbiAgICAgIGVsLnJlbW92ZUNoaWxkKGVsLmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgfVxuICBhcHBlbmRDaGlsZChlbDogTm9kZSwgbm9kZTogTm9kZSkgeyBlbC5hcHBlbmRDaGlsZChub2RlKTsgfVxuICByZW1vdmVDaGlsZChlbDogTm9kZSwgbm9kZTogTm9kZSkgeyBlbC5yZW1vdmVDaGlsZChub2RlKTsgfVxuICByZXBsYWNlQ2hpbGQoZWw6IE5vZGUsIG5ld0NoaWxkOiBOb2RlLCBvbGRDaGlsZDogTm9kZSkgeyBlbC5yZXBsYWNlQ2hpbGQobmV3Q2hpbGQsIG9sZENoaWxkKTsgfVxuICByZW1vdmUobm9kZTogTm9kZSk6IE5vZGUge1xuICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgaW5zZXJ0QmVmb3JlKHBhcmVudDogTm9kZSwgcmVmOiBOb2RlLCBub2RlOiBOb2RlKSB7IHBhcmVudC5pbnNlcnRCZWZvcmUobm9kZSwgcmVmKTsgfVxuICBpbnNlcnRBbGxCZWZvcmUocGFyZW50OiBOb2RlLCByZWY6IE5vZGUsIG5vZGVzOiBOb2RlW10pIHtcbiAgICBub2Rlcy5mb3JFYWNoKChuOiBhbnkpID0+IHBhcmVudC5pbnNlcnRCZWZvcmUobiwgcmVmKSk7XG4gIH1cbiAgaW5zZXJ0QWZ0ZXIocGFyZW50OiBOb2RlLCByZWY6IE5vZGUsIG5vZGU6IGFueSkgeyBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIHJlZi5uZXh0U2libGluZyk7IH1cbiAgc2V0SW5uZXJIVE1MKGVsOiBFbGVtZW50LCB2YWx1ZTogc3RyaW5nKSB7IGVsLmlubmVySFRNTCA9IHZhbHVlOyB9XG4gIGdldFRleHQoZWw6IE5vZGUpOiBzdHJpbmd8bnVsbCB7IHJldHVybiBlbC50ZXh0Q29udGVudDsgfVxuICBzZXRUZXh0KGVsOiBOb2RlLCB2YWx1ZTogc3RyaW5nKSB7IGVsLnRleHRDb250ZW50ID0gdmFsdWU7IH1cbiAgZ2V0VmFsdWUoZWw6IGFueSk6IHN0cmluZyB7IHJldHVybiBlbC52YWx1ZTsgfVxuICBzZXRWYWx1ZShlbDogYW55LCB2YWx1ZTogc3RyaW5nKSB7IGVsLnZhbHVlID0gdmFsdWU7IH1cbiAgZ2V0Q2hlY2tlZChlbDogYW55KTogYm9vbGVhbiB7IHJldHVybiBlbC5jaGVja2VkOyB9XG4gIHNldENoZWNrZWQoZWw6IGFueSwgdmFsdWU6IGJvb2xlYW4pIHsgZWwuY2hlY2tlZCA9IHZhbHVlOyB9XG4gIGNyZWF0ZUNvbW1lbnQodGV4dDogc3RyaW5nKTogQ29tbWVudCB7IHJldHVybiB0aGlzLmdldERlZmF1bHREb2N1bWVudCgpLmNyZWF0ZUNvbW1lbnQodGV4dCk7IH1cbiAgY3JlYXRlVGVtcGxhdGUoaHRtbDogYW55KTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IHQgPSB0aGlzLmdldERlZmF1bHREb2N1bWVudCgpLmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgdC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiB0O1xuICB9XG4gIGNyZWF0ZUVsZW1lbnQodGFnTmFtZTogc3RyaW5nLCBkb2M/OiBEb2N1bWVudCk6IEhUTUxFbGVtZW50IHtcbiAgICBkb2MgPSBkb2MgfHwgdGhpcy5nZXREZWZhdWx0RG9jdW1lbnQoKTtcbiAgICByZXR1cm4gZG9jLmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIH1cbiAgY3JlYXRlRWxlbWVudE5TKG5zOiBzdHJpbmcsIHRhZ05hbWU6IHN0cmluZywgZG9jPzogRG9jdW1lbnQpOiBFbGVtZW50IHtcbiAgICBkb2MgPSBkb2MgfHwgdGhpcy5nZXREZWZhdWx0RG9jdW1lbnQoKTtcbiAgICByZXR1cm4gZG9jLmNyZWF0ZUVsZW1lbnROUyhucywgdGFnTmFtZSk7XG4gIH1cbiAgY3JlYXRlVGV4dE5vZGUodGV4dDogc3RyaW5nLCBkb2M/OiBEb2N1bWVudCk6IFRleHQge1xuICAgIGRvYyA9IGRvYyB8fCB0aGlzLmdldERlZmF1bHREb2N1bWVudCgpO1xuICAgIHJldHVybiBkb2MuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG4gIH1cbiAgY3JlYXRlU2NyaXB0VGFnKGF0dHJOYW1lOiBzdHJpbmcsIGF0dHJWYWx1ZTogc3RyaW5nLCBkb2M/OiBEb2N1bWVudCk6IEhUTUxTY3JpcHRFbGVtZW50IHtcbiAgICBkb2MgPSBkb2MgfHwgdGhpcy5nZXREZWZhdWx0RG9jdW1lbnQoKTtcbiAgICBjb25zdCBlbCA9IDxIVE1MU2NyaXB0RWxlbWVudD5kb2MuY3JlYXRlRWxlbWVudCgnU0NSSVBUJyk7XG4gICAgZWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgIHJldHVybiBlbDtcbiAgfVxuICBjcmVhdGVTdHlsZUVsZW1lbnQoY3NzOiBzdHJpbmcsIGRvYz86IERvY3VtZW50KTogSFRNTFN0eWxlRWxlbWVudCB7XG4gICAgZG9jID0gZG9jIHx8IHRoaXMuZ2V0RGVmYXVsdERvY3VtZW50KCk7XG4gICAgY29uc3Qgc3R5bGUgPSA8SFRNTFN0eWxlRWxlbWVudD5kb2MuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICB0aGlzLmFwcGVuZENoaWxkKHN0eWxlLCB0aGlzLmNyZWF0ZVRleHROb2RlKGNzcywgZG9jKSk7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG4gIGNyZWF0ZVNoYWRvd1Jvb3QoZWw6IEhUTUxFbGVtZW50KTogRG9jdW1lbnRGcmFnbWVudCB7IHJldHVybiAoPGFueT5lbCkuY3JlYXRlU2hhZG93Um9vdCgpOyB9XG4gIGdldFNoYWRvd1Jvb3QoZWw6IEhUTUxFbGVtZW50KTogRG9jdW1lbnRGcmFnbWVudCB7IHJldHVybiAoPGFueT5lbCkuc2hhZG93Um9vdDsgfVxuICBnZXRIb3N0KGVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHsgcmV0dXJuICg8YW55PmVsKS5ob3N0OyB9XG4gIGNsb25lKG5vZGU6IE5vZGUpOiBOb2RlIHsgcmV0dXJuIG5vZGUuY2xvbmVOb2RlKHRydWUpOyB9XG4gIGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKG5hbWUpO1xuICB9XG4gIGdldEVsZW1lbnRzQnlUYWdOYW1lKGVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUobmFtZSk7XG4gIH1cbiAgY2xhc3NMaXN0KGVsZW1lbnQ6IGFueSk6IGFueVtdIHsgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVsZW1lbnQuY2xhc3NMaXN0LCAwKTsgfVxuICBhZGRDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKSB7IGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpOyB9XG4gIHJlbW92ZUNsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpIHsgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7IH1cbiAgaGFzQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO1xuICB9XG4gIHNldFN0eWxlKGVsZW1lbnQ6IGFueSwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZykge1xuICAgIGVsZW1lbnQuc3R5bGVbc3R5bGVOYW1lXSA9IHN0eWxlVmFsdWU7XG4gIH1cbiAgcmVtb3ZlU3R5bGUoZWxlbWVudDogYW55LCBzdHlsZW5hbWU6IHN0cmluZykge1xuICAgIC8vIElFIHJlcXVpcmVzICcnIGluc3RlYWQgb2YgbnVsbFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy83OTE2XG4gICAgZWxlbWVudC5zdHlsZVtzdHlsZW5hbWVdID0gJyc7XG4gIH1cbiAgZ2V0U3R5bGUoZWxlbWVudDogYW55LCBzdHlsZW5hbWU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBlbGVtZW50LnN0eWxlW3N0eWxlbmFtZV07IH1cbiAgaGFzU3R5bGUoZWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZT86IHN0cmluZ3xudWxsKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldFN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSkgfHwgJyc7XG4gICAgcmV0dXJuIHN0eWxlVmFsdWUgPyB2YWx1ZSA9PSBzdHlsZVZhbHVlIDogdmFsdWUubGVuZ3RoID4gMDtcbiAgfVxuICB0YWdOYW1lKGVsZW1lbnQ6IGFueSk6IHN0cmluZyB7IHJldHVybiBlbGVtZW50LnRhZ05hbWU7IH1cbiAgYXR0cmlidXRlTWFwKGVsZW1lbnQ6IGFueSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIGNvbnN0IHJlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgY29uc3QgZWxBdHRycyA9IGVsZW1lbnQuYXR0cmlidXRlcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsQXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGF0dHJpYiA9IGVsQXR0cnMuaXRlbShpKTtcbiAgICAgIHJlcy5zZXQoYXR0cmliLm5hbWUsIGF0dHJpYi52YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbiAgaGFzQXR0cmlidXRlKGVsZW1lbnQ6IEVsZW1lbnQsIGF0dHJpYnV0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gIH1cbiAgaGFzQXR0cmlidXRlTlMoZWxlbWVudDogRWxlbWVudCwgbnM6IHN0cmluZywgYXR0cmlidXRlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGVOUyhucywgYXR0cmlidXRlKTtcbiAgfVxuICBnZXRBdHRyaWJ1dGUoZWxlbWVudDogRWxlbWVudCwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gIH1cbiAgZ2V0QXR0cmlidXRlTlMoZWxlbWVudDogRWxlbWVudCwgbnM6IHN0cmluZywgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGVOUyhucywgbmFtZSk7XG4gIH1cbiAgc2V0QXR0cmlidXRlKGVsZW1lbnQ6IEVsZW1lbnQsIG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgeyBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7IH1cbiAgc2V0QXR0cmlidXRlTlMoZWxlbWVudDogRWxlbWVudCwgbnM6IHN0cmluZywgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyhucywgbmFtZSwgdmFsdWUpO1xuICB9XG4gIHJlbW92ZUF0dHJpYnV0ZShlbGVtZW50OiBFbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZykgeyBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpOyB9XG4gIHJlbW92ZUF0dHJpYnV0ZU5TKGVsZW1lbnQ6IEVsZW1lbnQsIG5zOiBzdHJpbmcsIG5hbWU6IHN0cmluZykge1xuICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlTlMobnMsIG5hbWUpO1xuICB9XG4gIHRlbXBsYXRlQXdhcmVSb290KGVsOiBOb2RlKTogYW55IHsgcmV0dXJuIHRoaXMuaXNUZW1wbGF0ZUVsZW1lbnQoZWwpID8gdGhpcy5jb250ZW50KGVsKSA6IGVsOyB9XG4gIGNyZWF0ZUh0bWxEb2N1bWVudCgpOiBIVE1MRG9jdW1lbnQge1xuICAgIHJldHVybiBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJ2Zha2VUaXRsZScpO1xuICB9XG4gIGdldERlZmF1bHREb2N1bWVudCgpOiBEb2N1bWVudCB7IHJldHVybiBkb2N1bWVudDsgfVxuICBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZWw6IEVsZW1lbnQpOiBhbnkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHt0b3A6IDAsIGJvdHRvbTogMCwgbGVmdDogMCwgcmlnaHQ6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDB9O1xuICAgIH1cbiAgfVxuICBnZXRUaXRsZShkb2M6IERvY3VtZW50KTogc3RyaW5nIHsgcmV0dXJuIGRvYy50aXRsZTsgfVxuICBzZXRUaXRsZShkb2M6IERvY3VtZW50LCBuZXdUaXRsZTogc3RyaW5nKSB7IGRvYy50aXRsZSA9IG5ld1RpdGxlIHx8ICcnOyB9XG4gIGVsZW1lbnRNYXRjaGVzKG46IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmlzRWxlbWVudE5vZGUobikpIHtcbiAgICAgIHJldHVybiBuLm1hdGNoZXMgJiYgbi5tYXRjaGVzKHNlbGVjdG9yKSB8fFxuICAgICAgICAgIG4ubXNNYXRjaGVzU2VsZWN0b3IgJiYgbi5tc01hdGNoZXNTZWxlY3RvcihzZWxlY3RvcikgfHxcbiAgICAgICAgICBuLndlYmtpdE1hdGNoZXNTZWxlY3RvciAmJiBuLndlYmtpdE1hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlzVGVtcGxhdGVFbGVtZW50KGVsOiBOb2RlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbGVtZW50Tm9kZShlbCkgJiYgZWwubm9kZU5hbWUgPT09ICdURU1QTEFURSc7XG4gIH1cbiAgaXNUZXh0Tm9kZShub2RlOiBOb2RlKTogYm9vbGVhbiB7IHJldHVybiBub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERTsgfVxuICBpc0NvbW1lbnROb2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFOyB9XG4gIGlzRWxlbWVudE5vZGUobm9kZTogTm9kZSk6IGJvb2xlYW4geyByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREU7IH1cbiAgaGFzU2hhZG93Um9vdChub2RlOiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbm9kZS5zaGFkb3dSb290ICE9IG51bGwgJiYgbm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50O1xuICB9XG4gIGlzU2hhZG93Um9vdChub2RlOiBhbnkpOiBib29sZWFuIHsgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50OyB9XG4gIGltcG9ydEludG9Eb2Mobm9kZTogTm9kZSk6IGFueSB7IHJldHVybiBkb2N1bWVudC5pbXBvcnROb2RlKHRoaXMudGVtcGxhdGVBd2FyZVJvb3Qobm9kZSksIHRydWUpOyB9XG4gIGFkb3B0Tm9kZShub2RlOiBOb2RlKTogYW55IHsgcmV0dXJuIGRvY3VtZW50LmFkb3B0Tm9kZShub2RlKTsgfVxuICBnZXRIcmVmKGVsOiBFbGVtZW50KTogc3RyaW5nIHsgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpICE7IH1cblxuICBnZXRFdmVudEtleShldmVudDogYW55KTogc3RyaW5nIHtcbiAgICBsZXQga2V5ID0gZXZlbnQua2V5O1xuICAgIGlmIChrZXkgPT0gbnVsbCkge1xuICAgICAga2V5ID0gZXZlbnQua2V5SWRlbnRpZmllcjtcbiAgICAgIC8vIGtleUlkZW50aWZpZXIgaXMgZGVmaW5lZCBpbiB0aGUgb2xkIGRyYWZ0IG9mIERPTSBMZXZlbCAzIEV2ZW50cyBpbXBsZW1lbnRlZCBieSBDaHJvbWUgYW5kXG4gICAgICAvLyBTYWZhcmkgY2ZcbiAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSLzIwMDcvV0QtRE9NLUxldmVsLTMtRXZlbnRzLTIwMDcxMjIxL2V2ZW50cy5odG1sI0V2ZW50cy1LZXlib2FyZEV2ZW50cy1JbnRlcmZhY2VzXG4gICAgICBpZiAoa2V5ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICdVbmlkZW50aWZpZWQnO1xuICAgICAgfVxuICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdVKycpKSB7XG4gICAgICAgIGtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQoa2V5LnN1YnN0cmluZygyKSwgMTYpKTtcbiAgICAgICAgaWYgKGV2ZW50LmxvY2F0aW9uID09PSBET01fS0VZX0xPQ0FUSU9OX05VTVBBRCAmJiBfY2hyb21lTnVtS2V5UGFkTWFwLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAvLyBUaGVyZSBpcyBhIGJ1ZyBpbiBDaHJvbWUgZm9yIG51bWVyaWMga2V5cGFkIGtleXM6XG4gICAgICAgICAgLy8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTE1NTY1NFxuICAgICAgICAgIC8vIDEsIDIsIDMgLi4uIGFyZSByZXBvcnRlZCBhcyBBLCBCLCBDIC4uLlxuICAgICAgICAgIGtleSA9IChfY2hyb21lTnVtS2V5UGFkTWFwIGFzIGFueSlba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfa2V5TWFwW2tleV0gfHwga2V5O1xuICB9XG4gIGdldEdsb2JhbEV2ZW50VGFyZ2V0KGRvYzogRG9jdW1lbnQsIHRhcmdldDogc3RyaW5nKTogRXZlbnRUYXJnZXR8bnVsbCB7XG4gICAgaWYgKHRhcmdldCA9PT0gJ3dpbmRvdycpIHtcbiAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgfVxuICAgIGlmICh0YXJnZXQgPT09ICdkb2N1bWVudCcpIHtcbiAgICAgIHJldHVybiBkb2M7XG4gICAgfVxuICAgIGlmICh0YXJnZXQgPT09ICdib2R5Jykge1xuICAgICAgcmV0dXJuIGRvYy5ib2R5O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBnZXRIaXN0b3J5KCk6IEhpc3RvcnkgeyByZXR1cm4gd2luZG93Lmhpc3Rvcnk7IH1cbiAgZ2V0TG9jYXRpb24oKTogTG9jYXRpb24geyByZXR1cm4gd2luZG93LmxvY2F0aW9uOyB9XG4gIGdldEJhc2VIcmVmKGRvYzogRG9jdW1lbnQpOiBzdHJpbmd8bnVsbCB7XG4gICAgY29uc3QgaHJlZiA9IGdldEJhc2VFbGVtZW50SHJlZigpO1xuICAgIHJldHVybiBocmVmID09IG51bGwgPyBudWxsIDogcmVsYXRpdmVQYXRoKGhyZWYpO1xuICB9XG4gIHJlc2V0QmFzZUVsZW1lbnQoKTogdm9pZCB7IGJhc2VFbGVtZW50ID0gbnVsbDsgfVxuICBnZXRVc2VyQWdlbnQoKTogc3RyaW5nIHsgcmV0dXJuIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50OyB9XG4gIHNldERhdGEoZWxlbWVudDogRWxlbWVudCwgbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUoZWxlbWVudCwgJ2RhdGEtJyArIG5hbWUsIHZhbHVlKTtcbiAgfVxuICBnZXREYXRhKGVsZW1lbnQ6IEVsZW1lbnQsIG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoZWxlbWVudCwgJ2RhdGEtJyArIG5hbWUpO1xuICB9XG4gIGdldENvbXB1dGVkU3R5bGUoZWxlbWVudDogYW55KTogYW55IHsgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7IH1cbiAgLy8gVE9ETyh0Ym9zY2gpOiBtb3ZlIHRoaXMgaW50byBhIHNlcGFyYXRlIGVudmlyb25tZW50IGNsYXNzIG9uY2Ugd2UgaGF2ZSBpdFxuICBzdXBwb3J0c1dlYkFuaW1hdGlvbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHlwZW9mKDxhbnk+RWxlbWVudCkucHJvdG90eXBlWydhbmltYXRlJ10gPT09ICdmdW5jdGlvbic7XG4gIH1cbiAgcGVyZm9ybWFuY2VOb3coKTogbnVtYmVyIHtcbiAgICAvLyBwZXJmb3JtYW5jZS5ub3coKSBpcyBub3QgYXZhaWxhYmxlIGluIGFsbCBicm93c2Vycywgc2VlXG4gICAgLy8gaHR0cDovL2Nhbml1c2UuY29tLyNzZWFyY2g9cGVyZm9ybWFuY2Uubm93XG4gICAgcmV0dXJuIHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID8gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuXG4gIHN1cHBvcnRzQ29va2llcygpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICBnZXRDb29raWUobmFtZTogc3RyaW5nKTogc3RyaW5nfG51bGwgeyByZXR1cm4gcGFyc2VDb29raWVWYWx1ZShkb2N1bWVudC5jb29raWUsIG5hbWUpOyB9XG5cbiAgc2V0Q29va2llKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIC8vIGRvY3VtZW50LmNvb2tpZSBpcyBtYWdpY2FsLCBhc3NpZ25pbmcgaW50byBpdCBhc3NpZ25zL292ZXJyaWRlcyBvbmUgY29va2llIHZhbHVlLCBidXQgZG9lc1xuICAgIC8vIG5vdCBjbGVhciBvdGhlciBjb29raWVzLlxuICAgIGRvY3VtZW50LmNvb2tpZSA9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gIH1cbn1cblxubGV0IGJhc2VFbGVtZW50OiBIVE1MRWxlbWVudHxudWxsID0gbnVsbDtcbmZ1bmN0aW9uIGdldEJhc2VFbGVtZW50SHJlZigpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICghYmFzZUVsZW1lbnQpIHtcbiAgICBiYXNlRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Jhc2UnKSAhO1xuICAgIGlmICghYmFzZUVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmFzZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG59XG5cbi8vIGJhc2VkIG9uIHVybFV0aWxzLmpzIGluIEFuZ3VsYXJKUyAxXG5sZXQgdXJsUGFyc2luZ05vZGU6IGFueTtcbmZ1bmN0aW9uIHJlbGF0aXZlUGF0aCh1cmw6IGFueSk6IHN0cmluZyB7XG4gIGlmICghdXJsUGFyc2luZ05vZGUpIHtcbiAgICB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgfVxuICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuICByZXR1cm4gKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/IHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZTtcbn1cbiJdfQ==