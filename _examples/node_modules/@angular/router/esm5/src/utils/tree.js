/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
var Tree = /** @class */ (function () {
    function Tree(root) {
        this._root = root;
    }
    Object.defineProperty(Tree.prototype, "root", {
        get: function () { return this._root.value; },
        enumerable: true,
        configurable: true
    });
    /**
     * @internal
     */
    Tree.prototype.parent = function (t) {
        var p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    };
    /**
     * @internal
     */
    Tree.prototype.children = function (t) {
        var n = findNode(t, this._root);
        return n ? n.children.map(function (t) { return t.value; }) : [];
    };
    /**
     * @internal
     */
    Tree.prototype.firstChild = function (t) {
        var n = findNode(t, this._root);
        return n && n.children.length > 0 ? n.children[0].value : null;
    };
    /**
     * @internal
     */
    Tree.prototype.siblings = function (t) {
        var p = findPath(t, this._root);
        if (p.length < 2)
            return [];
        var c = p[p.length - 2].children.map(function (c) { return c.value; });
        return c.filter(function (cc) { return cc !== t; });
    };
    /**
     * @internal
     */
    Tree.prototype.pathFromRoot = function (t) { return findPath(t, this._root).map(function (s) { return s.value; }); };
    return Tree;
}());
export { Tree };
// DFS for the node matching the value
function findNode(value, node) {
    if (value === node.value)
        return node;
    try {
        for (var _a = tslib_1.__values(node.children), _b = _a.next(); !_b.done; _b = _a.next()) {
            var child = _b.value;
            var node_1 = findNode(value, child);
            if (node_1)
                return node_1;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return null;
    var e_1, _c;
}
// Return the path to the node with the given value using DFS
function findPath(value, node) {
    if (value === node.value)
        return [node];
    try {
        for (var _a = tslib_1.__values(node.children), _b = _a.next(); !_b.done; _b = _a.next()) {
            var child = _b.value;
            var path = findPath(value, child);
            if (path.length) {
                path.unshift(node);
                return path;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return [];
    var e_2, _c;
}
var TreeNode = /** @class */ (function () {
    function TreeNode(value, children) {
        this.value = value;
        this.children = children;
    }
    TreeNode.prototype.toString = function () { return "TreeNode(" + this.value + ")"; };
    return TreeNode;
}());
export { TreeNode };
// Return the list of T indexed by outlet name
export function nodeChildrenAsMap(node) {
    var map = {};
    if (node) {
        node.children.forEach(function (child) { return map[child.value.outlet] = child; });
    }
    return map;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvdXRpbHMvdHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUg7SUFJRSxjQUFZLElBQWlCO1FBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFBQyxDQUFDO0lBRXJELHNCQUFJLHNCQUFJO2FBQVIsY0FBZ0IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFMUM7O09BRUc7SUFDSCxxQkFBTSxHQUFOLFVBQU8sQ0FBSTtRQUNULElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQy9DLENBQUM7SUFFRDs7T0FFRztJQUNILHVCQUFRLEdBQVIsVUFBUyxDQUFJO1FBQ1gsSUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsS0FBSyxFQUFQLENBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gseUJBQVUsR0FBVixVQUFXLENBQUk7UUFDYixJQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNs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QzlDLE1BQU0sNEJBQXVELElBQXVCO0lBQ2xGLElBQU0sR0FBRyxHQUFvQyxFQUFFLENBQUM7SUFFaEQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNULElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxFQUEvQixDQUErQixDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQgY2xhc3MgVHJlZTxUPiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jvb3Q6IFRyZWVOb2RlPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKHJvb3Q6IFRyZWVOb2RlPFQ+KSB7IHRoaXMuX3Jvb3QgPSByb290OyB9XG5cbiAgZ2V0IHJvb3QoKTogVCB7IHJldHVybiB0aGlzLl9yb290LnZhbHVlOyB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcGFyZW50KHQ6IFQpOiBUfG51bGwge1xuICAgIGNvbnN0IHAgPSB0aGlzLnBhdGhGcm9tUm9vdCh0KTtcbiAgICByZXR1cm4gcC5sZW5ndGggPiAxID8gcFtwLmxlbmd0aCAtIDJdIDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGNoaWxkcmVuKHQ6IFQpOiBUW10ge1xuICAgIGNvbnN0IG4gPSBmaW5kTm9kZSh0LCB0aGlzLl9yb290KTtcbiAgICByZXR1cm4gbiA/IG4uY2hpbGRyZW4ubWFwKHQgPT4gdC52YWx1ZSkgOiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGZpcnN0Q2hpbGQodDogVCk6IFR8bnVsbCB7XG4gICAgY29uc3QgbiA9IGZpbmROb2RlKHQsIHRoaXMuX3Jvb3QpO1xuICAgIHJldHVybiBuICYmIG4uY2hpbGRyZW4ubGVuZ3RoID4gMCA/IG4uY2hpbGRyZW5bMF0udmFsdWUgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgc2libGluZ3ModDogVCk6IFRbXSB7XG4gICAgY29uc3QgcCA9IGZpbmRQYXRoKHQsIHRoaXMuX3Jvb3QpO1xuICAgIGlmIChwLmxlbmd0aCA8IDIpIHJldHVybiBbXTtcblxuICAgIGNvbnN0IGMgPSBwW3AubGVuZ3RoIC0gMl0uY2hpbGRyZW4ubWFwKGMgPT4gYy52YWx1ZSk7XG4gICAgcmV0dXJuIGMuZmlsdGVyKGNjID0+IGNjICE9PSB0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHBhdGhGcm9tUm9vdCh0OiBUKTogVFtdIHsgcmV0dXJuIGZpbmRQYXRoKHQsIHRoaXMuX3Jvb3QpLm1hcChzID0+IHMudmFsdWUpOyB9XG59XG5cblxuLy8gREZTIGZvciB0aGUgbm9kZSBtYXRjaGluZyB0aGUgdmFsdWVcbmZ1bmN0aW9uIGZpbmROb2RlPFQ+KHZhbHVlOiBULCBub2RlOiBUcmVlTm9kZTxUPik6IFRyZWVOb2RlPFQ+fG51bGwge1xuICBpZiAodmFsdWUgPT09IG5vZGUudmFsdWUpIHJldHVybiBub2RlO1xuXG4gIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgIGNvbnN0IG5vZGUgPSBmaW5kTm9kZSh2YWx1ZSwgY2hpbGQpO1xuICAgIGlmIChub2RlKSByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBSZXR1cm4gdGhlIHBhdGggdG8gdGhlIG5vZGUgd2l0aCB0aGUgZ2l2ZW4gdmFsdWUgdXNpbmcgREZTXG5mdW5jdGlvbiBmaW5kUGF0aDxUPih2YWx1ZTogVCwgbm9kZTogVHJlZU5vZGU8VD4pOiBUcmVlTm9kZTxUPltdIHtcbiAgaWYgKHZhbHVlID09PSBub2RlLnZhbHVlKSByZXR1cm4gW25vZGVdO1xuXG4gIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5jaGlsZHJlbikge1xuICAgIGNvbnN0IHBhdGggPSBmaW5kUGF0aCh2YWx1ZSwgY2hpbGQpO1xuICAgIGlmIChwYXRoLmxlbmd0aCkge1xuICAgICAgcGF0aC51bnNoaWZ0KG5vZGUpO1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgY2xhc3MgVHJlZU5vZGU8VD4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWU6IFQsIHB1YmxpYyBjaGlsZHJlbjogVHJlZU5vZGU8VD5bXSkge31cblxuICB0b1N0cmluZygpOiBzdHJpbmcgeyByZXR1cm4gYFRyZWVOb2RlKCR7dGhpcy52YWx1ZX0pYDsgfVxufVxuXG4vLyBSZXR1cm4gdGhlIGxpc3Qgb2YgVCBpbmRleGVkIGJ5IG91dGxldCBuYW1lXG5leHBvcnQgZnVuY3Rpb24gbm9kZUNoaWxkcmVuQXNNYXA8VCBleHRlbmRze291dGxldDogc3RyaW5nfT4obm9kZTogVHJlZU5vZGU8VD58IG51bGwpIHtcbiAgY29uc3QgbWFwOiB7W291dGxldDogc3RyaW5nXTogVHJlZU5vZGU8VD59ID0ge307XG5cbiAgaWYgKG5vZGUpIHtcbiAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gbWFwW2NoaWxkLnZhbHVlLm91dGxldF0gPSBjaGlsZCk7XG4gIH1cblxuICByZXR1cm4gbWFwO1xufSJdfQ==