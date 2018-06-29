/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @enum {number} */
const RequestMethod = {
    Get: 0,
    Post: 1,
    Put: 2,
    Delete: 3,
    Options: 4,
    Head: 5,
    Patch: 6,
};
export { RequestMethod };
RequestMethod[RequestMethod.Get] = "Get";
RequestMethod[RequestMethod.Post] = "Post";
RequestMethod[RequestMethod.Put] = "Put";
RequestMethod[RequestMethod.Delete] = "Delete";
RequestMethod[RequestMethod.Options] = "Options";
RequestMethod[RequestMethod.Head] = "Head";
RequestMethod[RequestMethod.Patch] = "Patch";
/** @enum {number} */
const ReadyState = {
    Unsent: 0,
    Open: 1,
    HeadersReceived: 2,
    Loading: 3,
    Done: 4,
    Cancelled: 5,
};
export { ReadyState };
ReadyState[ReadyState.Unsent] = "Unsent";
ReadyState[ReadyState.Open] = "Open";
ReadyState[ReadyState.HeadersReceived] = "HeadersReceived";
ReadyState[ReadyState.Loading] = "Loading";
ReadyState[ReadyState.Done] = "Done";
ReadyState[ReadyState.Cancelled] = "Cancelled";
/** @enum {number} */
const ResponseType = {
    Basic: 0,
    Cors: 1,
    Default: 2,
    Error: 3,
    Opaque: 4,
};
export { ResponseType };
ResponseType[ResponseType.Basic] = "Basic";
ResponseType[ResponseType.Cors] = "Cors";
ResponseType[ResponseType.Default] = "Default";
ResponseType[ResponseType.Error] = "Error";
ResponseType[ResponseType.Opaque] = "Opaque";
/** @enum {number} */
const ContentType = {
    NONE: 0,
    JSON: 1,
    FORM: 2,
    FORM_DATA: 3,
    TEXT: 4,
    BLOB: 5,
    ARRAY_BUFFER: 6,
};
export { ContentType };
ContentType[ContentType.NONE] = "NONE";
ContentType[ContentType.JSON] = "JSON";
ContentType[ContentType.FORM] = "FORM";
ContentType[ContentType.FORM_DATA] = "FORM_DATA";
ContentType[ContentType.TEXT] = "TEXT";
ContentType[ContentType.BLOB] = "BLOB";
ContentType[ContentType.ARRAY_BUFFER] = "ARRAY_BUFFER";
/** @enum {number} */
const ResponseContentType = {
    Text: 0,
    Json: 1,
    ArrayBuffer: 2,
    Blob: 3,
};
export { ResponseContentType };
ResponseContentType[ResponseContentType.Text] = "Text";
ResponseContentType[ResponseContentType.Json] = "Json";
ResponseContentType[ResponseContentType.ArrayBuffer] = "ArrayBuffer";
ResponseContentType[ResponseContentType.Blob] = "Blob";

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9odHRwL3NyYy9lbnVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFN1cHBvcnRlZCBodHRwIG1ldGhvZHMuXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqL1xuZXhwb3J0IGVudW0gUmVxdWVzdE1ldGhvZCB7XG4gIEdldCxcbiAgUG9zdCxcbiAgUHV0LFxuICBEZWxldGUsXG4gIE9wdGlvbnMsXG4gIEhlYWQsXG4gIFBhdGNoXG59XG5cbi8qKlxuICogQWxsIHBvc3NpYmxlIHN0YXRlcyBpbiB3aGljaCBhIGNvbm5lY3Rpb24gY2FuIGJlLCBiYXNlZCBvblxuICogW1N0YXRlc10oaHR0cDovL3d3dy53My5vcmcvVFIvWE1MSHR0cFJlcXVlc3QvI3N0YXRlcykgZnJvbSB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBzcGVjLCBidXQgd2l0aCBhblxuICogYWRkaXRpb25hbCBcIkNBTkNFTExFRFwiIHN0YXRlLlxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKi9cbmV4cG9ydCBlbnVtIFJlYWR5U3RhdGUge1xuICBVbnNlbnQsXG4gIE9wZW4sXG4gIEhlYWRlcnNSZWNlaXZlZCxcbiAgTG9hZGluZyxcbiAgRG9uZSxcbiAgQ2FuY2VsbGVkXG59XG5cbi8qKlxuICogQWNjZXB0YWJsZSByZXNwb25zZSB0eXBlcyB0byBiZSBhc3NvY2lhdGVkIHdpdGggYSB7QGxpbmsgUmVzcG9uc2V9LCBiYXNlZCBvblxuICogW1Jlc3BvbnNlVHlwZV0oaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3Jlc3BvbnNldHlwZSkgZnJvbSB0aGUgRmV0Y2ggc3BlYy5cbiAqIEBkZXByZWNhdGVkIHNlZSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvaHR0cFxuICovXG5leHBvcnQgZW51bSBSZXNwb25zZVR5cGUge1xuICBCYXNpYyxcbiAgQ29ycyxcbiAgRGVmYXVsdCxcbiAgRXJyb3IsXG4gIE9wYXF1ZVxufVxuXG4vKipcbiAqIFN1cHBvcnRlZCBjb250ZW50IHR5cGUgdG8gYmUgYXV0b21hdGljYWxseSBhc3NvY2lhdGVkIHdpdGggYSB7QGxpbmsgUmVxdWVzdH0uXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqL1xuZXhwb3J0IGVudW0gQ29udGVudFR5cGUge1xuICBOT05FLFxuICBKU09OLFxuICBGT1JNLFxuICBGT1JNX0RBVEEsXG4gIFRFWFQsXG4gIEJMT0IsXG4gIEFSUkFZX0JVRkZFUlxufVxuXG4vKipcbiAqIERlZmluZSB3aGljaCBidWZmZXIgdG8gdXNlIHRvIHN0b3JlIHRoZSByZXNwb25zZVxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKi9cbmV4cG9ydCBlbnVtIFJlc3BvbnNlQ29udGVudFR5cGUge1xuICBUZXh0LFxuICBKc29uLFxuICBBcnJheUJ1ZmZlcixcbiAgQmxvYlxufVxuIl19