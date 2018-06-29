/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertEqual, assertNotNull } from './assert';
export function assertNodeType(node, type) {
    assertNotNull(node, 'should be called with a node');
    assertEqual(node.type, type, "should be a " + typeName(type));
}
export function assertNodeOfPossibleTypes(node) {
    var types = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        types[_i - 1] = arguments[_i];
    }
    assertNotNull(node, 'should be called with a node');
    var found = types.some(function (type) { return node.type === type; });
    assertEqual(found, true, "Should be one of " + types.map(typeName).join(', '));
}
function typeName(type) {
    if (type == 1 /* Projection */)
        return 'Projection';
    if (type == 0 /* Container */)
        return 'Container';
    if (type == 2 /* View */)
        return 'View';
    if (type == 3 /* Element */)
        return 'Element';
    return '<unknown>';
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9hc3NlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL25vZGVfYXNzZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxXQUFXLEVBQUUsYUFBYSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBR3BELE1BQU0seUJBQXlCLElBQVcsRUFBRSxJQUFlO0lBQ3pELGFBQWEsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLENBQUMsQ0FBQztJQUNwRCxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsaUJBQWUsUUFBUSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELE1BQU0sb0NBQW9DLElBQVc7SUFBRSxlQUFxQjtTQUFyQixVQUFxQixFQUFyQixxQkFBcUIsRUFBckIsSUFBcUI7UUFBckIsOEJBQXFCOztJQUMxRSxhQUFhLENBQUMsSUFBSSxFQUFFLDhCQUE4QixDQUFDLENBQUM7SUFDcEQsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFsQixDQUFrQixDQUFDLENBQUM7SUFDckQsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsc0JBQW9CLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7QUFDakYsQ0FBQztBQUVELGtCQUFrQixJQUFlO0lBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksc0JBQXdCLENBQUM7UUFBQyxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQ3RELEVBQUUsQ0FBQyxDQUFDLElBQUkscUJBQXVCLENBQUM7UUFBQyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3BELEVBQUUsQ0FBQyxDQUFDLElBQUksZ0JBQWtCLENBQUM7UUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQzFDLEVBQUUsQ0FBQyxDQUFDLElBQUksbUJBQXFCLENBQUM7UUFBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ2hELE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDckIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRFcXVhbCwgYXNzZXJ0Tm90TnVsbH0gZnJvbSAnLi9hc3NlcnQnO1xuaW1wb3J0IHtMTm9kZSwgTE5vZGVUeXBlfSBmcm9tICcuL2ludGVyZmFjZXMvbm9kZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb2RlVHlwZShub2RlOiBMTm9kZSwgdHlwZTogTE5vZGVUeXBlKSB7XG4gIGFzc2VydE5vdE51bGwobm9kZSwgJ3Nob3VsZCBiZSBjYWxsZWQgd2l0aCBhIG5vZGUnKTtcbiAgYXNzZXJ0RXF1YWwobm9kZS50eXBlLCB0eXBlLCBgc2hvdWxkIGJlIGEgJHt0eXBlTmFtZSh0eXBlKX1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vZGVPZlBvc3NpYmxlVHlwZXMobm9kZTogTE5vZGUsIC4uLnR5cGVzOiBMTm9kZVR5cGVbXSkge1xuICBhc3NlcnROb3ROdWxsKG5vZGUsICdzaG91bGQgYmUgY2FsbGVkIHdpdGggYSBub2RlJyk7XG4gIGNvbnN0IGZvdW5kID0gdHlwZXMuc29tZSh0eXBlID0+IG5vZGUudHlwZSA9PT0gdHlwZSk7XG4gIGFzc2VydEVxdWFsKGZvdW5kLCB0cnVlLCBgU2hvdWxkIGJlIG9uZSBvZiAke3R5cGVzLm1hcCh0eXBlTmFtZSkuam9pbignLCAnKX1gKTtcbn1cblxuZnVuY3Rpb24gdHlwZU5hbWUodHlwZTogTE5vZGVUeXBlKTogc3RyaW5nIHtcbiAgaWYgKHR5cGUgPT0gTE5vZGVUeXBlLlByb2plY3Rpb24pIHJldHVybiAnUHJvamVjdGlvbic7XG4gIGlmICh0eXBlID09IExOb2RlVHlwZS5Db250YWluZXIpIHJldHVybiAnQ29udGFpbmVyJztcbiAgaWYgKHR5cGUgPT0gTE5vZGVUeXBlLlZpZXcpIHJldHVybiAnVmlldyc7XG4gIGlmICh0eXBlID09IExOb2RlVHlwZS5FbGVtZW50KSByZXR1cm4gJ0VsZW1lbnQnO1xuICByZXR1cm4gJzx1bmtub3duPic7XG59XG4iXX0=