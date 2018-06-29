/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * This helper class is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we must use one of three strategies for doing this.
 * Support: Safari 10.x -> XHR strategy
 * Support: Firefox -> DomParser strategy
 * Default: InertDocument strategy
 */
var InertBodyHelper = /** @class */ (function () {
    function InertBodyHelper(defaultDoc) {
        this.defaultDoc = defaultDoc;
        this.inertDocument = this.defaultDoc.implementation.createHTMLDocument('sanitization-inert');
        this.inertBodyElement = this.inertDocument.body;
        if (this.inertBodyElement == null) {
            // usually there should be only one body element in the document, but IE doesn't have any, so
            // we need to create one.
            var inertHtml = this.inertDocument.createElement('html');
            this.inertDocument.appendChild(inertHtml);
            this.inertBodyElement = this.inertDocument.createElement('body');
            inertHtml.appendChild(this.inertBodyElement);
        }
        this.inertBodyElement.innerHTML = '<svg><g onload="this.parentNode.remove()"></g></svg>';
        if (this.inertBodyElement.querySelector && !this.inertBodyElement.querySelector('svg')) {
            // We just hit the Safari 10.1 bug - which allows JS to run inside the SVG G element
            // so use the XHR strategy.
            this.getInertBodyElement = this.getInertBodyElement_XHR;
            return;
        }
        this.inertBodyElement.innerHTML =
            '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">';
        if (this.inertBodyElement.querySelector && this.inertBodyElement.querySelector('svg img')) {
            // We just hit the Firefox bug - which prevents the inner img JS from being sanitized
            // so use the DOMParser strategy, if it is available.
            // If the DOMParser is not available then we are not in Firefox (Server/WebWorker?) so we
            // fall through to the default strategy below.
            if (isDOMParserAvailable()) {
                this.getInertBodyElement = this.getInertBodyElement_DOMParser;
                return;
            }
        }
        // None of the bugs were hit so it is safe for us to use the default InertDocument strategy
        this.getInertBodyElement = this.getInertBodyElement_InertDocument;
    }
    /**
     * Use XHR to create and fill an inert body element (on Safari 10.1)
     * See
     * https://github.com/cure53/DOMPurify/blob/a992d3a75031cb8bb032e5ea8399ba972bdf9a65/src/purify.js#L439-L449
     */
    InertBodyHelper.prototype.getInertBodyElement_XHR = function (html) {
        // We add these extra elements to ensure that the rest of the content is parsed as expected
        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
        // `<head>` tag.
        html = '<body><remove></remove>' + html + '</body>';
        try {
            html = encodeURI(html);
        }
        catch (e) {
            return null;
        }
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', 'data:text/html;charset=utf-8,' + html, false);
        xhr.send(null);
        var body = xhr.response.body;
        body.removeChild(body.firstChild);
        return body;
    };
    /**
     * Use DOMParser to create and fill an inert body element (on Firefox)
     * See https://github.com/cure53/DOMPurify/releases/tag/0.6.7
     *
     */
    InertBodyHelper.prototype.getInertBodyElement_DOMParser = function (html) {
        // We add these extra elements to ensure that the rest of the content is parsed as expected
        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
        // `<head>` tag.
        html = '<body><remove></remove>' + html + '</body>';
        try {
            var body = new window
                .DOMParser()
                .parseFromString(html, 'text/html')
                .body;
            body.removeChild(body.firstChild);
            return body;
        }
        catch (e) {
            return null;
        }
    };
    /**
     * Use an HTML5 `template` element, if supported, or an inert body element created via
     * `createHtmlDocument` to create and fill an inert DOM element.
     * This is the default sane strategy to use if the browser does not require one of the specialised
     * strategies above.
     */
    InertBodyHelper.prototype.getInertBodyElement_InertDocument = function (html) {
        // Prefer using <template> element if supported.
        var templateEl = this.inertDocument.createElement('template');
        if ('content' in templateEl) {
            templateEl.innerHTML = html;
            return templateEl;
        }
        this.inertBodyElement.innerHTML = html;
        // Support: IE 9-11 only
        // strip custom-namespaced attributes on IE<=11
        if (this.defaultDoc.documentMode) {
            this.stripCustomNsAttrs(this.inertBodyElement);
        }
        return this.inertBodyElement;
    };
    /**
     * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
     * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
     * 'ns1:xlink:foo').
     *
     * This is undesirable since we don't want to allow any of these custom attributes. This method
     * strips them all.
     */
    InertBodyHelper.prototype.stripCustomNsAttrs = function (el) {
        var elAttrs = el.attributes;
        // loop backwards so that we can support removals.
        for (var i = elAttrs.length - 1; 0 < i; i--) {
            var attrib = elAttrs.item(i);
            var attrName = attrib.name;
            if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
                el.removeAttribute(attrName);
            }
        }
        var childNode = el.firstChild;
        while (childNode) {
            if (childNode.nodeType === Node.ELEMENT_NODE)
                this.stripCustomNsAttrs(childNode);
            childNode = childNode.nextSibling;
        }
    };
    return InertBodyHelper;
}());
export { InertBodyHelper };
/**
 * We need to determine whether the DOMParser exists in the global context.
 * The try-catch is because, on some browsers, trying to access this property
 * on window can actually throw an error.
 *
 * @suppress {uselessCode}
 */
function isDOMParserAvailable() {
    try {
        return !!window.DOMParser;
    }
    catch (e) {
        return false;
    }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5lcnRfYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3Nhbml0aXphdGlvbi9pbmVydF9ib2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7O0dBT0c7QUFDSDtJQUlFLHlCQUFvQixVQUFvQjtRQUFwQixlQUFVLEdBQVYsVUFBVSxDQUFVO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUM3RixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7UUFFaEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEMsNkZBQTZGO1lBQzdGLHlCQUF5QjtZQUN6QixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMxQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsR0FBRyxzREFBc0QsQ0FBQztRQUN6RixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkYs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QyxDQUFDO0lBQ0gsQ0FBQztJQUNILHNCQUFDO0FBQUQsQ0FBQyxBQS9JRCxJQStJQzs7QUFFRDs7Ozs7O0dBTUc7QUFDSDtJQUNFLElBQUksQ0FBQztRQUNILE1BQU0sQ0FBQyxDQUFDLENBQUUsTUFBYyxDQUFDLFNBQVMsQ0FBQztJQUNyQyxDQUFDO0lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDZixDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBUaGlzIGhlbHBlciBjbGFzcyBpcyB1c2VkIHRvIGdldCBob2xkIG9mIGFuIGluZXJ0IHRyZWUgb2YgRE9NIGVsZW1lbnRzIGNvbnRhaW5pbmcgZGlydHkgSFRNTFxuICogdGhhdCBuZWVkcyBzYW5pdGl6aW5nLlxuICogRGVwZW5kaW5nIHVwb24gYnJvd3NlciBzdXBwb3J0IHdlIG11c3QgdXNlIG9uZSBvZiB0aHJlZSBzdHJhdGVnaWVzIGZvciBkb2luZyB0aGlzLlxuICogU3VwcG9ydDogU2FmYXJpIDEwLnggLT4gWEhSIHN0cmF0ZWd5XG4gKiBTdXBwb3J0OiBGaXJlZm94IC0+IERvbVBhcnNlciBzdHJhdGVneVxuICogRGVmYXVsdDogSW5lcnREb2N1bWVudCBzdHJhdGVneVxuICovXG5leHBvcnQgY2xhc3MgSW5lcnRCb2R5SGVscGVyIHtcbiAgcHJpdmF0ZSBpbmVydEJvZHlFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBpbmVydERvY3VtZW50OiBEb2N1bWVudDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRlZmF1bHREb2M6IERvY3VtZW50KSB7XG4gICAgdGhpcy5pbmVydERvY3VtZW50ID0gdGhpcy5kZWZhdWx0RG9jLmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCgnc2FuaXRpemF0aW9uLWluZXJ0Jyk7XG4gICAgdGhpcy5pbmVydEJvZHlFbGVtZW50ID0gdGhpcy5pbmVydERvY3VtZW50LmJvZHk7XG5cbiAgICBpZiAodGhpcy5pbmVydEJvZHlFbGVtZW50ID09IG51bGwpIHtcbiAgICAgIC8vIHVzdWFsbHkgdGhlcmUgc2hvdWxkIGJlIG9ubHkgb25lIGJvZHkgZWxlbWVudCBpbiB0aGUgZG9jdW1lbnQsIGJ1dCBJRSBkb2Vzbid0IGhhdmUgYW55LCBzb1xuICAgICAgLy8gd2UgbmVlZCB0byBjcmVhdGUgb25lLlxuICAgICAgY29uc3QgaW5lcnRIdG1sID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKTtcbiAgICAgIHRoaXMuaW5lcnREb2N1bWVudC5hcHBlbmRDaGlsZChpbmVydEh0bWwpO1xuICAgICAgdGhpcy5pbmVydEJvZHlFbGVtZW50ID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JvZHknKTtcbiAgICAgIGluZXJ0SHRtbC5hcHBlbmRDaGlsZCh0aGlzLmluZXJ0Qm9keUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHRoaXMuaW5lcnRCb2R5RWxlbWVudC5pbm5lckhUTUwgPSAnPHN2Zz48ZyBvbmxvYWQ9XCJ0aGlzLnBhcmVudE5vZGUucmVtb3ZlKClcIj48L2c+PC9zdmc+JztcbiAgICBpZiAodGhpcy5pbmVydEJvZHlFbGVtZW50LnF1ZXJ5U2VsZWN0b3IgJiYgIXRoaXMuaW5lcnRCb2R5RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdzdmcnKSkge1xuICAgICAgLy8gV2UganVzdCBoaXQgdGhlIFNhZmFyaSAxMC4xIGJ1ZyAtIHdoaWNoIGFsbG93cyBKUyB0byBydW4gaW5zaWRlIHRoZSBTVkcgRyBlbGVtZW50XG4gICAgICAvLyBzbyB1c2UgdGhlIFhIUiBzdHJhdGVneS5cbiAgICAgIHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudF9YSFI7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5pbmVydEJvZHlFbGVtZW50LmlubmVySFRNTCA9XG4gICAgICAgICc8c3ZnPjxwPjxzdHlsZT48aW1nIHNyYz1cIjwvc3R5bGU+PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpLy9cIj4nO1xuICAgIGlmICh0aGlzLmluZXJ0Qm9keUVsZW1lbnQucXVlcnlTZWxlY3RvciAmJiB0aGlzLmluZXJ0Qm9keUVsZW1lbnQucXVlcnlTZWxlY3Rvcignc3ZnIGltZycpKSB7XG4gICAgICAvLyBXZSBqdXN0IGhpdCB0aGUgRmlyZWZveCBidWcgLSB3aGljaCBwcmV2ZW50cyB0aGUgaW5uZXIgaW1nIEpTIGZyb20gYmVpbmcgc2FuaXRpemVkXG4gICAgICAvLyBzbyB1c2UgdGhlIERPTVBhcnNlciBzdHJhdGVneSwgaWYgaXQgaXMgYXZhaWxhYmxlLlxuICAgICAgLy8gSWYgdGhlIERPTVBhcnNlciBpcyBub3QgYXZhaWxhYmxlIHRoZW4gd2UgYXJlIG5vdCBpbiBGaXJlZm94IChTZXJ2ZXIvV2ViV29ya2VyPykgc28gd2VcbiAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgZGVmYXVsdCBzdHJhdGVneSBiZWxvdy5cbiAgICAgIGlmIChpc0RPTVBhcnNlckF2YWlsYWJsZSgpKSB7XG4gICAgICAgIHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuZ2V0SW5lcnRCb2R5RWxlbWVudF9ET01QYXJzZXI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBOb25lIG9mIHRoZSBidWdzIHdlcmUgaGl0IHNvIGl0IGlzIHNhZmUgZm9yIHVzIHRvIHVzZSB0aGUgZGVmYXVsdCBJbmVydERvY3VtZW50IHN0cmF0ZWd5XG4gICAgdGhpcy5nZXRJbmVydEJvZHlFbGVtZW50ID0gdGhpcy5nZXRJbmVydEJvZHlFbGVtZW50X0luZXJ0RG9jdW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFuIGluZXJ0IERPTSBlbGVtZW50IGNvbnRhaW5pbmcgRE9NIGNyZWF0ZWQgZnJvbSB0aGUgZGlydHkgSFRNTCBzdHJpbmcgcHJvdmlkZWQuXG4gICAqIFRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIGlzIGRldGVybWluZWQgaW4gdGhlIGNvbnN0cnVjdG9yLCB3aGVuIHRoZSBjbGFzcyBpcyBpbnN0YW50aWF0ZWQuXG4gICAqL1xuICBnZXRJbmVydEJvZHlFbGVtZW50OiAoaHRtbDogc3RyaW5nKSA9PiBIVE1MRWxlbWVudCB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFVzZSBYSFIgdG8gY3JlYXRlIGFuZCBmaWxsIGFuIGluZXJ0IGJvZHkgZWxlbWVudCAob24gU2FmYXJpIDEwLjEpXG4gICAqIFNlZVxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vY3VyZTUzL0RPTVB1cmlmeS9ibG9iL2E5OTJkM2E3NTAzMWNiOGJiMDMyZTVlYTgzOTliYTk3MmJkZjlhNjUvc3JjL3B1cmlmeS5qcyNMNDM5LUw0NDlcbiAgICovXG4gIHByaXZhdGUgZ2V0SW5lcnRCb2R5RWxlbWVudF9YSFIoaHRtbDogc3RyaW5nKSB7XG4gICAgLy8gV2UgYWRkIHRoZXNlIGV4dHJhIGVsZW1lbnRzIHRvIGVuc3VyZSB0aGF0IHRoZSByZXN0IG9mIHRoZSBjb250ZW50IGlzIHBhcnNlZCBhcyBleHBlY3RlZFxuICAgIC8vIGUuZy4gbGVhZGluZyB3aGl0ZXNwYWNlIGlzIG1haW50YWluZWQgYW5kIHRhZ3MgbGlrZSBgPG1ldGE+YCBkbyBub3QgZ2V0IGhvaXN0ZWQgdG8gdGhlXG4gICAgLy8gYDxoZWFkPmAgdGFnLlxuICAgIGh0bWwgPSAnPGJvZHk+PHJlbW92ZT48L3JlbW92ZT4nICsgaHRtbCArICc8L2JvZHk+JztcbiAgICB0cnkge1xuICAgICAgaHRtbCA9IGVuY29kZVVSSShodG1sKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdkb2N1bWVudCc7XG4gICAgeGhyLm9wZW4oJ0dFVCcsICdkYXRhOnRleHQvaHRtbDtjaGFyc2V0PXV0Zi04LCcgKyBodG1sLCBmYWxzZSk7XG4gICAgeGhyLnNlbmQobnVsbCk7XG4gICAgY29uc3QgYm9keTogSFRNTEJvZHlFbGVtZW50ID0geGhyLnJlc3BvbnNlLmJvZHk7XG4gICAgYm9keS5yZW1vdmVDaGlsZChib2R5LmZpcnN0Q2hpbGQgISk7XG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cblxuICAvKipcbiAgICogVXNlIERPTVBhcnNlciB0byBjcmVhdGUgYW5kIGZpbGwgYW4gaW5lcnQgYm9keSBlbGVtZW50IChvbiBGaXJlZm94KVxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2N1cmU1My9ET01QdXJpZnkvcmVsZWFzZXMvdGFnLzAuNi43XG4gICAqXG4gICAqL1xuICBwcml2YXRlIGdldEluZXJ0Qm9keUVsZW1lbnRfRE9NUGFyc2VyKGh0bWw6IHN0cmluZykge1xuICAgIC8vIFdlIGFkZCB0aGVzZSBleHRyYSBlbGVtZW50cyB0byBlbnN1cmUgdGhhdCB0aGUgcmVzdCBvZiB0aGUgY29udGVudCBpcyBwYXJzZWQgYXMgZXhwZWN0ZWRcbiAgICAvLyBlLmcuIGxlYWRpbmcgd2hpdGVzcGFjZSBpcyBtYWludGFpbmVkIGFuZCB0YWdzIGxpa2UgYDxtZXRhPmAgZG8gbm90IGdldCBob2lzdGVkIHRvIHRoZVxuICAgIC8vIGA8aGVhZD5gIHRhZy5cbiAgICBodG1sID0gJzxib2R5PjxyZW1vdmU+PC9yZW1vdmU+JyArIGh0bWwgKyAnPC9ib2R5Pic7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGJvZHkgPSBuZXcgKHdpbmRvdyBhcyBhbnkpXG4gICAgICAgICAgICAgICAgICAgICAgIC5ET01QYXJzZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAucGFyc2VGcm9tU3RyaW5nKGh0bWwsICd0ZXh0L2h0bWwnKVxuICAgICAgICAgICAgICAgICAgICAgICAuYm9keSBhcyBIVE1MQm9keUVsZW1lbnQ7XG4gICAgICBib2R5LnJlbW92ZUNoaWxkKGJvZHkuZmlyc3RDaGlsZCAhKTtcbiAgICAgIHJldHVybiBib2R5O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgYW4gSFRNTDUgYHRlbXBsYXRlYCBlbGVtZW50LCBpZiBzdXBwb3J0ZWQsIG9yIGFuIGluZXJ0IGJvZHkgZWxlbWVudCBjcmVhdGVkIHZpYVxuICAgKiBgY3JlYXRlSHRtbERvY3VtZW50YCB0byBjcmVhdGUgYW5kIGZpbGwgYW4gaW5lcnQgRE9NIGVsZW1lbnQuXG4gICAqIFRoaXMgaXMgdGhlIGRlZmF1bHQgc2FuZSBzdHJhdGVneSB0byB1c2UgaWYgdGhlIGJyb3dzZXIgZG9lcyBub3QgcmVxdWlyZSBvbmUgb2YgdGhlIHNwZWNpYWxpc2VkXG4gICAqIHN0cmF0ZWdpZXMgYWJvdmUuXG4gICAqL1xuICBwcml2YXRlIGdldEluZXJ0Qm9keUVsZW1lbnRfSW5lcnREb2N1bWVudChodG1sOiBzdHJpbmcpIHtcbiAgICAvLyBQcmVmZXIgdXNpbmcgPHRlbXBsYXRlPiBlbGVtZW50IGlmIHN1cHBvcnRlZC5cbiAgICBjb25zdCB0ZW1wbGF0ZUVsID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgaWYgKCdjb250ZW50JyBpbiB0ZW1wbGF0ZUVsKSB7XG4gICAgICB0ZW1wbGF0ZUVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICByZXR1cm4gdGVtcGxhdGVFbDtcbiAgICB9XG5cbiAgICB0aGlzLmluZXJ0Qm9keUVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIC8vIFN1cHBvcnQ6IElFIDktMTEgb25seVxuICAgIC8vIHN0cmlwIGN1c3RvbS1uYW1lc3BhY2VkIGF0dHJpYnV0ZXMgb24gSUU8PTExXG4gICAgaWYgKCh0aGlzLmRlZmF1bHREb2MgYXMgYW55KS5kb2N1bWVudE1vZGUpIHtcbiAgICAgIHRoaXMuc3RyaXBDdXN0b21Oc0F0dHJzKHRoaXMuaW5lcnRCb2R5RWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW5lcnRCb2R5RWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIElFOS0xMSBjb21lcyBhY3Jvc3MgYW4gdW5rbm93biBuYW1lc3BhY2VkIGF0dHJpYnV0ZSBlLmcuICd4bGluazpmb28nIGl0IGFkZHMgJ3htbG5zOm5zMSdcbiAgICogYXR0cmlidXRlIHRvIGRlY2xhcmUgbnMxIG5hbWVzcGFjZSBhbmQgcHJlZml4ZXMgdGhlIGF0dHJpYnV0ZSB3aXRoICduczEnIChlLmcuXG4gICAqICduczE6eGxpbms6Zm9vJykuXG4gICAqXG4gICAqIFRoaXMgaXMgdW5kZXNpcmFibGUgc2luY2Ugd2UgZG9uJ3Qgd2FudCB0byBhbGxvdyBhbnkgb2YgdGhlc2UgY3VzdG9tIGF0dHJpYnV0ZXMuIFRoaXMgbWV0aG9kXG4gICAqIHN0cmlwcyB0aGVtIGFsbC5cbiAgICovXG4gIHByaXZhdGUgc3RyaXBDdXN0b21Oc0F0dHJzKGVsOiBFbGVtZW50KSB7XG4gICAgY29uc3QgZWxBdHRycyA9IGVsLmF0dHJpYnV0ZXM7XG4gICAgLy8gbG9vcCBiYWNrd2FyZHMgc28gdGhhdCB3ZSBjYW4gc3VwcG9ydCByZW1vdmFscy5cbiAgICBmb3IgKGxldCBpID0gZWxBdHRycy5sZW5ndGggLSAxOyAwIDwgaTsgaS0tKSB7XG4gICAgICBjb25zdCBhdHRyaWIgPSBlbEF0dHJzLml0ZW0oaSk7XG4gICAgICBjb25zdCBhdHRyTmFtZSA9IGF0dHJpYi5uYW1lO1xuICAgICAgaWYgKGF0dHJOYW1lID09PSAneG1sbnM6bnMxJyB8fCBhdHRyTmFtZS5pbmRleE9mKCduczE6JykgPT09IDApIHtcbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGNoaWxkTm9kZSA9IGVsLmZpcnN0Q2hpbGQ7XG4gICAgd2hpbGUgKGNoaWxkTm9kZSkge1xuICAgICAgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHRoaXMuc3RyaXBDdXN0b21Oc0F0dHJzKGNoaWxkTm9kZSBhcyBFbGVtZW50KTtcbiAgICAgIGNoaWxkTm9kZSA9IGNoaWxkTm9kZS5uZXh0U2libGluZztcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXZSBuZWVkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBET01QYXJzZXIgZXhpc3RzIGluIHRoZSBnbG9iYWwgY29udGV4dC5cbiAqIFRoZSB0cnktY2F0Y2ggaXMgYmVjYXVzZSwgb24gc29tZSBicm93c2VycywgdHJ5aW5nIHRvIGFjY2VzcyB0aGlzIHByb3BlcnR5XG4gKiBvbiB3aW5kb3cgY2FuIGFjdHVhbGx5IHRocm93IGFuIGVycm9yLlxuICpcbiAqIEBzdXBwcmVzcyB7dXNlbGVzc0NvZGV9XG4gKi9cbmZ1bmN0aW9uIGlzRE9NUGFyc2VyQXZhaWxhYmxlKCkge1xuICB0cnkge1xuICAgIHJldHVybiAhISh3aW5kb3cgYXMgYW55KS5ET01QYXJzZXI7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==