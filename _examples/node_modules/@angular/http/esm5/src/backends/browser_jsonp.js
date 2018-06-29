/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
var _nextRequestId = 0;
export var JSONP_HOME = '__ng_jsonp__';
var _jsonpConnections = null;
function _getJsonpConnections() {
    var w = typeof window == 'object' ? window : {};
    if (_jsonpConnections === null) {
        _jsonpConnections = w[JSONP_HOME] = {};
    }
    return _jsonpConnections;
}
// Make sure not to evaluate this in a non-browser environment!
var BrowserJsonp = /** @class */ (function () {
    function BrowserJsonp() {
    }
    // Construct a <script> element with the specified URL
    BrowserJsonp.prototype.build = function (url) {
        var node = document.createElement('script');
        node.src = url;
        return node;
    };
    BrowserJsonp.prototype.nextRequestID = function () { return "__req" + _nextRequestId++; };
    BrowserJsonp.prototype.requestCallback = function (id) { return JSONP_HOME + "." + id + ".finished"; };
    BrowserJsonp.prototype.exposeConnection = function (id, connection) {
        var connections = _getJsonpConnections();
        connections[id] = connection;
    };
    BrowserJsonp.prototype.removeConnection = function (id) {
        var connections = _getJsonpConnections();
        connections[id] = null;
    };
    // Attach the <script> element to the DOM
    BrowserJsonp.prototype.send = function (node) { document.body.appendChild((node)); };
    // Remove <script> element from the DOM
    BrowserJsonp.prototype.cleanup = function (node) {
        if (node.parentNode) {
            node.parentNode.removeChild((node));
        }
    };
    BrowserJsonp.decorators = [
        { type: Injectable }
    ];
    return BrowserJsonp;
}());
export { BrowserJsonp };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9qc29ucC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2h0dHAvc3JjL2JhY2tlbmRzL2Jyb3dzZXJfanNvbnAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDdkIsTUFBTSxDQUFDLElBQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQztBQUN6QyxJQUFJLGlCQUFpQixHQUE4QixJQUFJLENBQUM7QUFFeEQ7SUFDRSxJQUFNLENBQUMsR0FBeUIsT0FBTyxNQUFNLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUN4RSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9CLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekMsQ0FBQztJQUNELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztBQUMzQixDQUFDO0FBRUQsK0RBQStEO0FBQy9EO0lBQUE7SUFnQ0EsQ0FBQztJQTlCQyxzREFBc0Q7SUFDdEQsNEJBQUssR0FBTCxVQUFNLEdBQVc7UUFDZixJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxvQ0FBYSxHQUFiLGNBQTBCLE1BQU0sQ0FBQyxVQUFRLGNBQWMsRUFBSSxDQUFDLENBQUMsQ0FBQztJQUU5RCxzQ0FBZSxHQUFmLFVBQWdCLEVBQVUsSUFBWSxNQUFNLENBQUksVUFBVSxTQUFJLEVBQUUsY0FBVyxDQUFDLENBQUMsQ0FBQztJQUU5RSx1Q0FBZ0IsR0FBaEIsVUFBaUIsRUFBVSxFQUFFLFVBQWU7UUFDMUMsSUFBTSxXQUFXLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztRQUMzQyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRCx1Q0FBZ0IsR0FBaEIsVUFBaUIsRUFBVTtRQUN6QixJQUFNLFdBQVcsR0FBRyxvQkFBb0IsRUFBRSxDQUFDO1FBQzNDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVELHlDQUF5QztJQUN6QywyQkFBSSxHQUFKLFVBQUssSUFBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFNUQsdUNBQXVDO0lBQ3ZDLDhCQUFPLEdBQVAsVUFBUSxJQUFTO1FBQ2YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDSCxDQUFDOztnQkEvQkYsVUFBVTs7SUFnQ1gsbUJBQUM7Q0FBQSxBQWhDRCxJQWdDQztTQS9CWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5sZXQgX25leHRSZXF1ZXN0SWQgPSAwO1xuZXhwb3J0IGNvbnN0IEpTT05QX0hPTUUgPSAnX19uZ19qc29ucF9fJztcbmxldCBfanNvbnBDb25uZWN0aW9uczoge1trZXk6IHN0cmluZ106IGFueX18bnVsbCA9IG51bGw7XG5cbmZ1bmN0aW9uIF9nZXRKc29ucENvbm5lY3Rpb25zKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgY29uc3Qgdzoge1trZXk6IHN0cmluZ106IGFueX0gPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnID8gd2luZG93IDoge307XG4gIGlmIChfanNvbnBDb25uZWN0aW9ucyA9PT0gbnVsbCkge1xuICAgIF9qc29ucENvbm5lY3Rpb25zID0gd1tKU09OUF9IT01FXSA9IHt9O1xuICB9XG4gIHJldHVybiBfanNvbnBDb25uZWN0aW9ucztcbn1cblxuLy8gTWFrZSBzdXJlIG5vdCB0byBldmFsdWF0ZSB0aGlzIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQhXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3Nlckpzb25wIHtcbiAgLy8gQ29uc3RydWN0IGEgPHNjcmlwdD4gZWxlbWVudCB3aXRoIHRoZSBzcGVjaWZpZWQgVVJMXG4gIGJ1aWxkKHVybDogc3RyaW5nKTogYW55IHtcbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgbm9kZS5zcmMgPSB1cmw7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBuZXh0UmVxdWVzdElEKCk6IHN0cmluZyB7IHJldHVybiBgX19yZXEke19uZXh0UmVxdWVzdElkKyt9YDsgfVxuXG4gIHJlcXVlc3RDYWxsYmFjayhpZDogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIGAke0pTT05QX0hPTUV9LiR7aWR9LmZpbmlzaGVkYDsgfVxuXG4gIGV4cG9zZUNvbm5lY3Rpb24oaWQ6IHN0cmluZywgY29ubmVjdGlvbjogYW55KSB7XG4gICAgY29uc3QgY29ubmVjdGlvbnMgPSBfZ2V0SnNvbnBDb25uZWN0aW9ucygpO1xuICAgIGNvbm5lY3Rpb25zW2lkXSA9IGNvbm5lY3Rpb247XG4gIH1cblxuICByZW1vdmVDb25uZWN0aW9uKGlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb25uZWN0aW9ucyA9IF9nZXRKc29ucENvbm5lY3Rpb25zKCk7XG4gICAgY29ubmVjdGlvbnNbaWRdID0gbnVsbDtcbiAgfVxuXG4gIC8vIEF0dGFjaCB0aGUgPHNjcmlwdD4gZWxlbWVudCB0byB0aGUgRE9NXG4gIHNlbmQobm9kZTogYW55KSB7IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoPE5vZGU+KG5vZGUpKTsgfVxuXG4gIC8vIFJlbW92ZSA8c2NyaXB0PiBlbGVtZW50IGZyb20gdGhlIERPTVxuICBjbGVhbnVwKG5vZGU6IGFueSkge1xuICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCg8Tm9kZT4obm9kZSkpO1xuICAgIH1cbiAgfVxufVxuIl19