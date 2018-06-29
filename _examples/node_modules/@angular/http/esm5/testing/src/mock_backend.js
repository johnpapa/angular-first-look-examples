/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { ReadyState, Request } from '@angular/http';
import { ReplaySubject, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 * @deprecated see https://angular.io/guide/http
 */
var MockConnection = /** @class */ (function () {
    function MockConnection(req) {
        this.response = new ReplaySubject(1).pipe(take(1));
        this.readyState = ReadyState.Open;
        this.request = req;
    }
    /**
     * Sends a mock response to the connection. This response is the value that is emitted to the
     * {@link EventEmitter} returned by {@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => console.log(res.text()));
     * connection.mockRespond(new Response(new ResponseOptions({ body: 'fake response' }))); //logs
     * 'fake response'
     * ```
     *
     */
    MockConnection.prototype.mockRespond = function (res) {
        if (this.readyState === ReadyState.Done || this.readyState === ReadyState.Cancelled) {
            throw new Error('Connection has already been resolved');
        }
        this.readyState = ReadyState.Done;
        this.response.next(res);
        this.response.complete();
    };
    /**
     * Not yet implemented!
     *
     * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     */
    MockConnection.prototype.mockDownload = function (res) {
        // this.request.downloadObserver.onNext(res);
        // if (res.bytesLoaded === res.totalBytes) {
        //   this.request.downloadObserver.onCompleted();
        // }
    };
    // TODO(jeffbcross): consider using Response type
    /**
     * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
     * returned
     * from {@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => res, err => console.log(err)));
     * connection.mockError(new Error('error'));
     * ```
     *
     */
    MockConnection.prototype.mockError = function (err) {
        // Matches ResourceLoader semantics
        this.readyState = ReadyState.Done;
        this.response.error(err);
    };
    return MockConnection;
}());
export { MockConnection };
/**
 * A mock backend for testing the {@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {@link XHRBackend}.
 *
 * ### Example
 *
 * ```
 * import {Injectable, Injector} from '@angular/core';
 * import {async, fakeAsync, tick} from '@angular/core/testing';
 * import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
 * import {Response, ResponseOptions} from '@angular/http';
 * import {MockBackend, MockConnection} from '@angular/http/testing';
 *
 * const HERO_ONE = 'HeroNrOne';
 * const HERO_TWO = 'WillBeAlwaysTheSecond';
 *
 * @Injectable()
 * class HeroService {
 *   constructor(private http: Http) {}
 *
 *   getHeroes(): Promise<String[]> {
 *     return this.http.get('myservices.de/api/heroes')
 *         .toPromise()
 *         .then(response => response.json().data)
 *         .catch(e => this.handleError(e));
 *   }
 *
 *   private handleError(error: any): Promise<any> {
 *     console.error('An error occurred', error);
 *     return Promise.reject(error.message || error);
 *   }
 * }
 *
 * describe('MockBackend HeroService Example', () => {
 *   beforeEach(() => {
 *     this.injector = Injector.create([
 *       {provide: ConnectionBackend, useClass: MockBackend},
 *       {provide: RequestOptions, useClass: BaseRequestOptions},
 *       Http,
 *       HeroService,
 *     ]);
 *     this.heroService = this.injector.get(HeroService);
 *     this.backend = this.injector.get(ConnectionBackend) as MockBackend;
 *     this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);
 *   });
 *
 *   it('getHeroes() should query current service url', () => {
 *     this.heroService.getHeroes();
 *     expect(this.lastConnection).toBeDefined('no http service connection at all?');
 *     expect(this.lastConnection.request.url).toMatch(/api\/heroes$/, 'url invalid');
 *   });
 *
 *   it('getHeroes() should return some heroes', fakeAsync(() => {
 *        let result: String[];
 *        this.heroService.getHeroes().then((heroes: String[]) => result = heroes);
 *        this.lastConnection.mockRespond(new Response(new ResponseOptions({
 *          body: JSON.stringify({data: [HERO_ONE, HERO_TWO]}),
 *        })));
 *        tick();
 *        expect(result.length).toEqual(2, 'should contain given amount of heroes');
 *        expect(result[0]).toEqual(HERO_ONE, ' HERO_ONE should be the first hero');
 *        expect(result[1]).toEqual(HERO_TWO, ' HERO_TWO should be the second hero');
 *      }));
 *
 *   it('getHeroes() while server is down', fakeAsync(() => {
 *        let result: String[];
 *        let catchedError: any;
 *        this.heroService.getHeroes()
 *            .then((heroes: String[]) => result = heroes)
 *            .catch((error: any) => catchedError = error);
 *        this.lastConnection.mockRespond(new Response(new ResponseOptions({
 *          status: 404,
 *          statusText: 'URL not Found',
 *        })));
 *        tick();
 *        expect(result).toBeUndefined();
 *        expect(catchedError).toBeDefined();
 *      }));
 * });
 * ```
 *
 * This method only exists in the mock implementation, not in real Backends.
 *
 * @deprecated see https://angular.io/guide/http
 */
var MockBackend = /** @class */ (function () {
    function MockBackend() {
        var _this = this;
        this.connectionsArray = [];
        this.connections = new Subject();
        this.connections.subscribe(function (connection) { return _this.connectionsArray.push(connection); });
        this.pendingConnections = new Subject();
    }
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.verifyNoPendingRequests = function () {
        var pending = 0;
        this.pendingConnections.subscribe(function (c) { return pending++; });
        if (pending > 0)
            throw new Error(pending + " pending connections to be resolved");
    };
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.resolveAllConnections = function () { this.connections.subscribe(function (c) { return c.readyState = 4; }); };
    /**
     * Creates a new {@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     */
    MockBackend.prototype.createConnection = function (req) {
        if (!req || !(req instanceof Request)) {
            throw new Error("createConnection requires an instance of Request, got " + req);
        }
        var connection = new MockConnection(req);
        this.connections.next(connection);
        return connection;
    };
    MockBackend.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    MockBackend.ctorParameters = function () { return []; };
    return MockBackend;
}());
export { MockBackend };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvaHR0cC90ZXN0aW5nL3NyYy9tb2NrX2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQWdDLFVBQVUsRUFBRSxPQUFPLEVBQVcsTUFBTSxlQUFlLENBQUM7QUFDM0YsT0FBTyxFQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDNUMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3BDOzs7OztHQUtHO0FBQ0g7SUFvQkUsd0JBQVksR0FBWTtRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFRLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0gsb0NBQVcsR0FBWCxVQUFZLEdBQWE7UUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxVQUFVLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxxQ0FBWSxHQUFaLFVBQWEsR0FBYTtRQUN4Qiw2Q0FBNkM7UUFDN0MsNENBQTRDO1FBQzVDLGlEQUFpRDtRQUNqRCxJQUFJO0lBQ04sQ0FBQztJQUVELGlEQUFpRDtJQUNqRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILGtDQUFTLEdBQVQsVUFBVSxHQUFXO1FBQ25CLG1DQUFtQztRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUNILHFCQUFDO0FBQUQsQ0FBQyxBQXBGRCxJQW9GQzs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzRkc7QUFDSDtJQXdERTtRQUFBLGlCQU1DO1FBTEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQ3RCLFVBQUMsVUFBMEIsSUFBSyxPQUFBLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQXRDLENBQXNDLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILDZDQUF1QixHQUF2QjtRQUNFLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFVBQUMsQ0FBaUIsSUFBSyxPQUFBLE9BQU8sRUFBRSxFQUFULENBQVMsQ0FBQyxDQUFDO1FBQ3BFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFBQyxNQUFNLElBQUksS0FBSyxDQUFJLE9BQU8sd0NBQXFDLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCwyQ0FBcUIsR0FBckIsY0FBMEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBQyxDQUFpQixJQUFLLE9BQUEsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFaEc7Ozs7O09BS0c7SUFDSCxzQ0FBZ0IsR0FBaEIsVUFBaUIsR0FBWTtRQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUF5RCxHQUFLLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBQ0QsSUFBTSxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUNwQixDQUFDOztnQkFoR0YsVUFBVTs7OztJQWlHWCxrQkFBQztDQUFBLEFBakdELElBaUdDO1NBaEdZLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nvbm5lY3Rpb24sIENvbm5lY3Rpb25CYWNrZW5kLCBSZWFkeVN0YXRlLCBSZXF1ZXN0LCBSZXNwb25zZX0gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG5pbXBvcnQge1JlcGxheVN1YmplY3QsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cblxuLyoqXG4gKlxuICogTW9jayBDb25uZWN0aW9uIHRvIHJlcHJlc2VudCBhIHtAbGluayBDb25uZWN0aW9ufSBmb3IgdGVzdHMuXG4gKlxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrQ29ubmVjdGlvbiBpbXBsZW1lbnRzIENvbm5lY3Rpb24ge1xuICAvLyBUT0RPOiBOYW1lIGByZWFkeVN0YXRlYCBzaG91bGQgY2hhbmdlIHRvIGJlIG1vcmUgZ2VuZXJpYywgYW5kIHN0YXRlcyBjb3VsZCBiZSBtYWRlIHRvIGJlIG1vcmVcbiAgLy8gZGVzY3JpcHRpdmUgdGhhbiBSZXNvdXJjZUxvYWRlciBzdGF0ZXMuXG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIHN0YXRlIG9mIHRoZSBjb25uZWN0aW9uLCBiYXNlZCBvbiBgWE1MSHR0cFJlcXVlc3QucmVhZHlTdGF0ZWAsIGJ1dCB3aXRoXG4gICAqIGFkZGl0aW9uYWwgc3RhdGVzLiBGb3IgZXhhbXBsZSwgc3RhdGUgNSBpbmRpY2F0ZXMgYW4gYWJvcnRlZCBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVhZHlTdGF0ZTogUmVhZHlTdGF0ZTtcblxuICAvKipcbiAgICoge0BsaW5rIFJlcXVlc3R9IGluc3RhbmNlIHVzZWQgdG8gY3JlYXRlIHRoZSBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdDogUmVxdWVzdDtcblxuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIFJlc3BvbnNlfS4gQ2FuIGJlIHN1YnNjcmliZWQgdG8gaW4gb3JkZXIgdG8gYmUgbm90aWZpZWQgd2hlbiBhXG4gICAqIHJlc3BvbnNlIGlzIGF2YWlsYWJsZS5cbiAgICovXG4gIHJlc3BvbnNlOiBSZXBsYXlTdWJqZWN0PFJlc3BvbnNlPjtcblxuICBjb25zdHJ1Y3RvcihyZXE6IFJlcXVlc3QpIHtcbiAgICB0aGlzLnJlc3BvbnNlID0gPGFueT5uZXcgUmVwbGF5U3ViamVjdCgxKS5waXBlKHRha2UoMSkpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuT3BlbjtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXE7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBtb2NrIHJlc3BvbnNlIHRvIHRoZSBjb25uZWN0aW9uLiBUaGlzIHJlc3BvbnNlIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIGVtaXR0ZWQgdG8gdGhlXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IHJldHVybmVkIGJ5IHtAbGluayBIdHRwfS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBjb25uZWN0aW9uO1xuICAgKiBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAgICogaHR0cC5yZXF1ZXN0KCdkYXRhLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IGNvbnNvbGUubG9nKHJlcy50ZXh0KCkpKTtcbiAgICogY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UobmV3IFJlc3BvbnNlT3B0aW9ucyh7IGJvZHk6ICdmYWtlIHJlc3BvbnNlJyB9KSkpOyAvL2xvZ3NcbiAgICogJ2Zha2UgcmVzcG9uc2UnXG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgbW9ja1Jlc3BvbmQocmVzOiBSZXNwb25zZSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuRG9uZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuQ2FuY2VsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZCcpO1xuICAgIH1cbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkRvbmU7XG4gICAgdGhpcy5yZXNwb25zZS5uZXh0KHJlcyk7XG4gICAgdGhpcy5yZXNwb25zZS5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdCB5ZXQgaW1wbGVtZW50ZWQhXG4gICAqXG4gICAqIFNlbmRzIHRoZSBwcm92aWRlZCB7QGxpbmsgUmVzcG9uc2V9IHRvIHRoZSBgZG93bmxvYWRPYnNlcnZlcmAgb2YgdGhlIGBSZXF1ZXN0YFxuICAgKiBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb25uZWN0aW9uLlxuICAgKi9cbiAgbW9ja0Rvd25sb2FkKHJlczogUmVzcG9uc2UpIHtcbiAgICAvLyB0aGlzLnJlcXVlc3QuZG93bmxvYWRPYnNlcnZlci5vbk5leHQocmVzKTtcbiAgICAvLyBpZiAocmVzLmJ5dGVzTG9hZGVkID09PSByZXMudG90YWxCeXRlcykge1xuICAgIC8vICAgdGhpcy5yZXF1ZXN0LmRvd25sb2FkT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICAvLyB9XG4gIH1cblxuICAvLyBUT0RPKGplZmZiY3Jvc3MpOiBjb25zaWRlciB1c2luZyBSZXNwb25zZSB0eXBlXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgcHJvdmlkZWQgZXJyb3Igb2JqZWN0IGFzIGFuIGVycm9yIHRvIHRoZSB7QGxpbmsgUmVzcG9uc2V9IHtAbGluayBFdmVudEVtaXR0ZXJ9XG4gICAqIHJldHVybmVkXG4gICAqIGZyb20ge0BsaW5rIEh0dHB9LlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIGNvbm5lY3Rpb247XG4gICAqIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gY29ubmVjdGlvbiA9IGMpO1xuICAgKiBodHRwLnJlcXVlc3QoJ2RhdGEuanNvbicpLnN1YnNjcmliZShyZXMgPT4gcmVzLCBlcnIgPT4gY29uc29sZS5sb2coZXJyKSkpO1xuICAgKiBjb25uZWN0aW9uLm1vY2tFcnJvcihuZXcgRXJyb3IoJ2Vycm9yJykpO1xuICAgKiBgYGBcbiAgICpcbiAgICovXG4gIG1vY2tFcnJvcihlcnI/OiBFcnJvcikge1xuICAgIC8vIE1hdGNoZXMgUmVzb3VyY2VMb2FkZXIgc2VtYW50aWNzXG4gICAgdGhpcy5yZWFkeVN0YXRlID0gUmVhZHlTdGF0ZS5Eb25lO1xuICAgIHRoaXMucmVzcG9uc2UuZXJyb3IoZXJyKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbW9jayBiYWNrZW5kIGZvciB0ZXN0aW5nIHRoZSB7QGxpbmsgSHR0cH0gc2VydmljZS5cbiAqXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSBpbmplY3RlZCBpbiB0ZXN0cywgYW5kIHNob3VsZCBiZSB1c2VkIHRvIG92ZXJyaWRlIHByb3ZpZGVyc1xuICogdG8gb3RoZXIgYmFja2VuZHMsIHN1Y2ggYXMge0BsaW5rIFhIUkJhY2tlbmR9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0luamVjdGFibGUsIEluamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7YXN5bmMsIGZha2VBc3luYywgdGlja30gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcbiAqIGltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBDb25uZWN0aW9uQmFja2VuZCwgSHR0cCwgUmVxdWVzdE9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuICogaW1wb3J0IHtSZXNwb25zZSwgUmVzcG9uc2VPcHRpb25zfSBmcm9tICdAYW5ndWxhci9odHRwJztcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmQsIE1vY2tDb25uZWN0aW9ufSBmcm9tICdAYW5ndWxhci9odHRwL3Rlc3RpbmcnO1xuICpcbiAqIGNvbnN0IEhFUk9fT05FID0gJ0hlcm9Ock9uZSc7XG4gKiBjb25zdCBIRVJPX1RXTyA9ICdXaWxsQmVBbHdheXNUaGVTZWNvbmQnO1xuICpcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIEhlcm9TZXJ2aWNlIHtcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwKSB7fVxuICpcbiAqICAgZ2V0SGVyb2VzKCk6IFByb21pc2U8U3RyaW5nW10+IHtcbiAqICAgICByZXR1cm4gdGhpcy5odHRwLmdldCgnbXlzZXJ2aWNlcy5kZS9hcGkvaGVyb2VzJylcbiAqICAgICAgICAgLnRvUHJvbWlzZSgpXG4gKiAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKS5kYXRhKVxuICogICAgICAgICAuY2F0Y2goZSA9PiB0aGlzLmhhbmRsZUVycm9yKGUpKTtcbiAqICAgfVxuICpcbiAqICAgcHJpdmF0ZSBoYW5kbGVFcnJvcihlcnJvcjogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAqICAgICBjb25zb2xlLmVycm9yKCdBbiBlcnJvciBvY2N1cnJlZCcsIGVycm9yKTtcbiAqICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IubWVzc2FnZSB8fCBlcnJvcik7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBkZXNjcmliZSgnTW9ja0JhY2tlbmQgSGVyb1NlcnZpY2UgRXhhbXBsZScsICgpID0+IHtcbiAqICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gKiAgICAgdGhpcy5pbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShbXG4gKiAgICAgICB7cHJvdmlkZTogQ29ubmVjdGlvbkJhY2tlbmQsIHVzZUNsYXNzOiBNb2NrQmFja2VuZH0sXG4gKiAgICAgICB7cHJvdmlkZTogUmVxdWVzdE9wdGlvbnMsIHVzZUNsYXNzOiBCYXNlUmVxdWVzdE9wdGlvbnN9LFxuICogICAgICAgSHR0cCxcbiAqICAgICAgIEhlcm9TZXJ2aWNlLFxuICogICAgIF0pO1xuICogICAgIHRoaXMuaGVyb1NlcnZpY2UgPSB0aGlzLmluamVjdG9yLmdldChIZXJvU2VydmljZSk7XG4gKiAgICAgdGhpcy5iYWNrZW5kID0gdGhpcy5pbmplY3Rvci5nZXQoQ29ubmVjdGlvbkJhY2tlbmQpIGFzIE1vY2tCYWNrZW5kO1xuICogICAgIHRoaXMuYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoKGNvbm5lY3Rpb246IGFueSkgPT4gdGhpcy5sYXN0Q29ubmVjdGlvbiA9IGNvbm5lY3Rpb24pO1xuICogICB9KTtcbiAqXG4gKiAgIGl0KCdnZXRIZXJvZXMoKSBzaG91bGQgcXVlcnkgY3VycmVudCBzZXJ2aWNlIHVybCcsICgpID0+IHtcbiAqICAgICB0aGlzLmhlcm9TZXJ2aWNlLmdldEhlcm9lcygpO1xuICogICAgIGV4cGVjdCh0aGlzLmxhc3RDb25uZWN0aW9uKS50b0JlRGVmaW5lZCgnbm8gaHR0cCBzZXJ2aWNlIGNvbm5lY3Rpb24gYXQgYWxsPycpO1xuICogICAgIGV4cGVjdCh0aGlzLmxhc3RDb25uZWN0aW9uLnJlcXVlc3QudXJsKS50b01hdGNoKC9hcGlcXC9oZXJvZXMkLywgJ3VybCBpbnZhbGlkJyk7XG4gKiAgIH0pO1xuICpcbiAqICAgaXQoJ2dldEhlcm9lcygpIHNob3VsZCByZXR1cm4gc29tZSBoZXJvZXMnLCBmYWtlQXN5bmMoKCkgPT4ge1xuICogICAgICAgIGxldCByZXN1bHQ6IFN0cmluZ1tdO1xuICogICAgICAgIHRoaXMuaGVyb1NlcnZpY2UuZ2V0SGVyb2VzKCkudGhlbigoaGVyb2VzOiBTdHJpbmdbXSkgPT4gcmVzdWx0ID0gaGVyb2VzKTtcbiAqICAgICAgICB0aGlzLmxhc3RDb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZShuZXcgUmVzcG9uc2VPcHRpb25zKHtcbiAqICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtkYXRhOiBbSEVST19PTkUsIEhFUk9fVFdPXX0pLFxuICogICAgICAgIH0pKSk7XG4gKiAgICAgICAgdGljaygpO1xuICogICAgICAgIGV4cGVjdChyZXN1bHQubGVuZ3RoKS50b0VxdWFsKDIsICdzaG91bGQgY29udGFpbiBnaXZlbiBhbW91bnQgb2YgaGVyb2VzJyk7XG4gKiAgICAgICAgZXhwZWN0KHJlc3VsdFswXSkudG9FcXVhbChIRVJPX09ORSwgJyBIRVJPX09ORSBzaG91bGQgYmUgdGhlIGZpcnN0IGhlcm8nKTtcbiAqICAgICAgICBleHBlY3QocmVzdWx0WzFdKS50b0VxdWFsKEhFUk9fVFdPLCAnIEhFUk9fVFdPIHNob3VsZCBiZSB0aGUgc2Vjb25kIGhlcm8nKTtcbiAqICAgICAgfSkpO1xuICpcbiAqICAgaXQoJ2dldEhlcm9lcygpIHdoaWxlIHNlcnZlciBpcyBkb3duJywgZmFrZUFzeW5jKCgpID0+IHtcbiAqICAgICAgICBsZXQgcmVzdWx0OiBTdHJpbmdbXTtcbiAqICAgICAgICBsZXQgY2F0Y2hlZEVycm9yOiBhbnk7XG4gKiAgICAgICAgdGhpcy5oZXJvU2VydmljZS5nZXRIZXJvZXMoKVxuICogICAgICAgICAgICAudGhlbigoaGVyb2VzOiBTdHJpbmdbXSkgPT4gcmVzdWx0ID0gaGVyb2VzKVxuICogICAgICAgICAgICAuY2F0Y2goKGVycm9yOiBhbnkpID0+IGNhdGNoZWRFcnJvciA9IGVycm9yKTtcbiAqICAgICAgICB0aGlzLmxhc3RDb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZShuZXcgUmVzcG9uc2VPcHRpb25zKHtcbiAqICAgICAgICAgIHN0YXR1czogNDA0LFxuICogICAgICAgICAgc3RhdHVzVGV4dDogJ1VSTCBub3QgRm91bmQnLFxuICogICAgICAgIH0pKSk7XG4gKiAgICAgICAgdGljaygpO1xuICogICAgICAgIGV4cGVjdChyZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAqICAgICAgICBleHBlY3QoY2F0Y2hlZEVycm9yKS50b0JlRGVmaW5lZCgpO1xuICogICAgICB9KSk7XG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAqXG4gKiBAZGVwcmVjYXRlZCBzZWUgaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2h0dHBcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tCYWNrZW5kIGltcGxlbWVudHMgQ29ubmVjdGlvbkJhY2tlbmQge1xuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogb2Yge0BsaW5rIE1vY2tDb25uZWN0aW9ufSBpbnN0YW5jZXMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCBieSB0aGlzIGJhY2tlbmQuIENhbiBiZSBzdWJzY3JpYmVkXG4gICAqIHRvIGluIG9yZGVyIHRvIHJlc3BvbmQgdG8gY29ubmVjdGlvbnMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBpbXBvcnQge0luamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAgICogaW1wb3J0IHtmYWtlQXN5bmMsIHRpY2t9IGZyb20gJ0Bhbmd1bGFyL2NvcmUvdGVzdGluZyc7XG4gICAqIGltcG9ydCB7QmFzZVJlcXVlc3RPcHRpb25zLCBDb25uZWN0aW9uQmFja2VuZCwgSHR0cCwgUmVxdWVzdE9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuICAgKiBpbXBvcnQge1Jlc3BvbnNlLCBSZXNwb25zZU9wdGlvbnN9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuICAgKiBpbXBvcnQge01vY2tCYWNrZW5kLCBNb2NrQ29ubmVjdGlvbn0gZnJvbSAnQGFuZ3VsYXIvaHR0cC90ZXN0aW5nJztcbiAgICpcbiAgICogaXQoJ3Nob3VsZCBnZXQgYSByZXNwb25zZScsIGZha2VBc3luYygoKSA9PiB7XG4gICAqICAgICAgbGV0IGNvbm5lY3Rpb246XG4gICAqICAgICAgICAgIE1vY2tDb25uZWN0aW9uOyAgLy8gdGhpcyB3aWxsIGJlIHNldCB3aGVuIGEgbmV3IGNvbm5lY3Rpb24gaXMgZW1pdHRlZCBmcm9tIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJhY2tlbmQuXG4gICAqICAgICAgbGV0IHRleHQ6IHN0cmluZzsgICAgLy8gdGhpcyB3aWxsIGJlIHNldCBmcm9tIG1vY2sgcmVzcG9uc2VcbiAgICogICAgICBsZXQgaW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoW1xuICAgKiAgICAgICAge3Byb3ZpZGU6IENvbm5lY3Rpb25CYWNrZW5kLCB1c2VDbGFzczogTW9ja0JhY2tlbmR9LFxuICAgKiAgICAgICAge3Byb3ZpZGU6IFJlcXVlc3RPcHRpb25zLCB1c2VDbGFzczogQmFzZVJlcXVlc3RPcHRpb25zfSxcbiAgICogICAgICAgIEh0dHAsXG4gICAqICAgICAgXSk7XG4gICAqICAgICAgbGV0IGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoQ29ubmVjdGlvbkJhY2tlbmQpO1xuICAgKiAgICAgIGxldCBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICAgKiAgICAgIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKChjOiBNb2NrQ29ubmVjdGlvbikgPT4gY29ubmVjdGlvbiA9IGMpO1xuICAgKiAgICAgIGh0dHAucmVxdWVzdCgnc29tZXRoaW5nLmpzb24nKS50b1Byb21pc2UoKS50aGVuKChyZXM6IGFueSkgPT4gdGV4dCA9IHJlcy50ZXh0KCkpO1xuICAgKiAgICAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKG5ldyBSZXNwb25zZU9wdGlvbnMoe2JvZHk6ICdTb21ldGhpbmcnfSkpKTtcbiAgICogICAgICB0aWNrKCk7XG4gICAqICAgICAgZXhwZWN0KHRleHQpLnRvQmUoJ1NvbWV0aGluZycpO1xuICAgKiAgICB9KSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIGNvbm5lY3Rpb25zOiBhbnk7ICAvLzxNb2NrQ29ubmVjdGlvbj5cblxuICAvKipcbiAgICogQW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgYGNvbm5lY3Rpb25zYC4gVGhpcyBhcnJheSB3aWxsIGJlIHVwZGF0ZWQgd2l0aCBlYWNoIGNvbm5lY3Rpb24gdGhhdFxuICAgKiBpcyBjcmVhdGVkIGJ5IHRoaXMgYmFja2VuZC5cbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBjb25uZWN0aW9uc0FycmF5OiBNb2NrQ29ubmVjdGlvbltdO1xuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIE1vY2tDb25uZWN0aW9ufSBpbnN0YW5jZXMgdGhhdCBoYXZlbid0IHlldCBiZWVuIHJlc29sdmVkIChpLmUuXG4gICAqIHdpdGggYSBgcmVhZHlTdGF0ZWBcbiAgICogbGVzcyB0aGFuIDQpLiBVc2VkIGludGVybmFsbHkgdG8gdmVyaWZ5IHRoYXQgbm8gY29ubmVjdGlvbnMgYXJlIHBlbmRpbmcgdmlhIHRoZVxuICAgKiBgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHNgIG1ldGhvZC5cbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBwZW5kaW5nQ29ubmVjdGlvbnM6IGFueTsgIC8vIFN1YmplY3Q8TW9ja0Nvbm5lY3Rpb24+XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbnNBcnJheSA9IFtdO1xuICAgIHRoaXMuY29ubmVjdGlvbnMgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuY29ubmVjdGlvbnMuc3Vic2NyaWJlKFxuICAgICAgICAoY29ubmVjdGlvbjogTW9ja0Nvbm5lY3Rpb24pID0+IHRoaXMuY29ubmVjdGlvbnNBcnJheS5wdXNoKGNvbm5lY3Rpb24pKTtcbiAgICB0aGlzLnBlbmRpbmdDb25uZWN0aW9ucyA9IG5ldyBTdWJqZWN0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGFsbCBjb25uZWN0aW9ucywgYW5kIHJhaXNlcyBhbiBleGNlcHRpb24gaWYgYW55IGNvbm5lY3Rpb24gaGFzIG5vdCByZWNlaXZlZCBhIHJlc3BvbnNlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cygpIHtcbiAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbnMuc3Vic2NyaWJlKChjOiBNb2NrQ29ubmVjdGlvbikgPT4gcGVuZGluZysrKTtcbiAgICBpZiAocGVuZGluZyA+IDApIHRocm93IG5ldyBFcnJvcihgJHtwZW5kaW5nfSBwZW5kaW5nIGNvbm5lY3Rpb25zIHRvIGJlIHJlc29sdmVkYCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHNgIHRvIHJlc29sdmUgYW55IG5vdC15ZXQtcmVzb2x2ZVxuICAgKiBjb25uZWN0aW9ucywgaWYgaXQncyBleHBlY3RlZCB0aGF0IHRoZXJlIGFyZSBjb25uZWN0aW9ucyB0aGF0IGhhdmUgbm90IHlldCByZWNlaXZlZCBhIHJlc3BvbnNlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICByZXNvbHZlQWxsQ29ubmVjdGlvbnMoKSB7IHRoaXMuY29ubmVjdGlvbnMuc3Vic2NyaWJlKChjOiBNb2NrQ29ubmVjdGlvbikgPT4gYy5yZWFkeVN0YXRlID0gNCk7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259LiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gY2FsbGluZyBgbmV3XG4gICAqIE1vY2tDb25uZWN0aW9uKClgLCBleGNlcHQgdGhhdCBpdCBhbHNvIHdpbGwgZW1pdCB0aGUgbmV3IGBDb25uZWN0aW9uYCB0byB0aGUgYGNvbm5lY3Rpb25zYFxuICAgKiBlbWl0dGVyIG9mIHRoaXMgYE1vY2tCYWNrZW5kYCBpbnN0YW5jZS4gVGhpcyBtZXRob2Qgd2lsbCB1c3VhbGx5IG9ubHkgYmUgdXNlZCBieSB0ZXN0c1xuICAgKiBhZ2FpbnN0IHRoZSBmcmFtZXdvcmsgaXRzZWxmLCBub3QgYnkgZW5kLXVzZXJzLlxuICAgKi9cbiAgY3JlYXRlQ29ubmVjdGlvbihyZXE6IFJlcXVlc3QpOiBNb2NrQ29ubmVjdGlvbiB7XG4gICAgaWYgKCFyZXEgfHwgIShyZXEgaW5zdGFuY2VvZiBSZXF1ZXN0KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBjcmVhdGVDb25uZWN0aW9uIHJlcXVpcmVzIGFuIGluc3RhbmNlIG9mIFJlcXVlc3QsIGdvdCAke3JlcX1gKTtcbiAgICB9XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IG5ldyBNb2NrQ29ubmVjdGlvbihyZXEpO1xuICAgIHRoaXMuY29ubmVjdGlvbnMubmV4dChjb25uZWN0aW9uKTtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxufVxuIl19