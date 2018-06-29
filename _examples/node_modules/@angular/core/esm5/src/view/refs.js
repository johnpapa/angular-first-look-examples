/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Injector } from '../di/injector';
import { ComponentFactory, ComponentRef } from '../linker/component_factory';
import { ComponentFactoryBoundToModule, ComponentFactoryResolver } from '../linker/component_factory_resolver';
import { ElementRef } from '../linker/element_ref';
import { NgModuleRef } from '../linker/ng_module_factory';
import { TemplateRef } from '../linker/template_ref';
import { stringify } from '../util';
import { VERSION } from '../version';
import { callNgModuleLifecycle, initNgModule, resolveNgModuleDep } from './ng_module';
import { Services, asElementData, asProviderData, asTextData } from './types';
import { markParentViewsForCheck, resolveDefinition, rootRenderNodes, splitNamespace, tokenKey, viewParentEl } from './util';
import { attachEmbeddedView, detachEmbeddedView, moveEmbeddedView, renderDetachView } from './view_attach';
var EMPTY_CONTEXT = new Object();
// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
export function createComponentFactory(selector, componentType, viewDefFactory, inputs, outputs, ngContentSelectors) {
    return new ComponentFactory_(selector, componentType, viewDefFactory, inputs, outputs, ngContentSelectors);
}
export function getComponentViewDefinitionFactory(componentFactory) {
    return componentFactory.viewDefFactory;
}
var ComponentFactory_ = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentFactory_, _super);
    function ComponentFactory_(selector, componentType, viewDefFactory, _inputs, _outputs, ngContentSelectors) {
        var _this = 
        // Attention: this ctor is called as top level function.
        // Putting any logic in here will destroy closure tree shaking!
        _super.call(this) || this;
        _this.selector = selector;
        _this.componentType = componentType;
        _this._inputs = _inputs;
        _this._outputs = _outputs;
        _this.ngContentSelectors = ngContentSelectors;
        _this.viewDefFactory = viewDefFactory;
        return _this;
    }
    Object.defineProperty(ComponentFactory_.prototype, "inputs", {
        get: function () {
            var inputsArr = [];
            var inputs = this._inputs;
            for (var propName in inputs) {
                var templateName = inputs[propName];
                inputsArr.push({ propName: propName, templateName: templateName });
            }
            return inputsArr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentFactory_.prototype, "outputs", {
        get: function () {
            var outputsArr = [];
            for (var propName in this._outputs) {
                var templateName = this._outputs[propName];
                outputsArr.push({ propName: propName, templateName: templateName });
            }
            return outputsArr;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a new component.
     */
    ComponentFactory_.prototype.create = function (injector, projectableNodes, rootSelectorOrNode, ngModule) {
        if (!ngModule) {
            throw new Error('ngModule should be provided');
        }
        var viewDef = resolveDefinition(this.viewDefFactory);
        var componentNodeIndex = viewDef.nodes[0].element.componentProvider.nodeIndex;
        var view = Services.createRootView(injector, projectableNodes || [], rootSelectorOrNode, viewDef, ngModule, EMPTY_CONTEXT);
        var component = asProviderData(view, componentNodeIndex).instance;
        if (rootSelectorOrNode) {
            view.renderer.setAttribute(asElementData(view, 0).renderElement, 'ng-version', VERSION.full);
        }
        return new ComponentRef_(view, new ViewRef_(view), component);
    };
    return ComponentFactory_;
}(ComponentFactory));
var ComponentRef_ = /** @class */ (function (_super) {
    tslib_1.__extends(ComponentRef_, _super);
    function ComponentRef_(_view, _viewRef, _component) {
        var _this = _super.call(this) || this;
        _this._view = _view;
        _this._viewRef = _viewRef;
        _this._component = _component;
        _this._elDef = _this._view.def.nodes[0];
        _this.hostView = _viewRef;
        _this.changeDetectorRef = _viewRef;
        _this.instance = _component;
        return _this;
    }
    Object.defineProperty(ComponentRef_.prototype, "location", {
        get: function () {
            return new ElementRef(asElementData(this._view, this._elDef.nodeIndex).renderElement);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef_.prototype, "injector", {
        get: function () { return new Injector_(this._view, this._elDef); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentRef_.prototype, "componentType", {
        get: function () { return this._component.constructor; },
        enumerable: true,
        configurable: true
    });
    ComponentRef_.prototype.destroy = function () { this._viewRef.destroy(); };
    ComponentRef_.prototype.onDestroy = function (callback) { this._viewRef.onDestroy(callback); };
    return ComponentRef_;
}(ComponentRef));
export function createViewContainerData(view, elDef, elData) {
    return new ViewContainerRef_(view, elDef, elData);
}
var ViewContainerRef_ = /** @class */ (function () {
    function ViewContainerRef_(_view, _elDef, _data) {
        this._view = _view;
        this._elDef = _elDef;
        this._data = _data;
        /**
         * @internal
         */
        this._embeddedViews = [];
    }
    Object.defineProperty(ViewContainerRef_.prototype, "element", {
        get: function () { return new ElementRef(this._data.renderElement); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef_.prototype, "injector", {
        get: function () { return new Injector_(this._view, this._elDef); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewContainerRef_.prototype, "parentInjector", {
        get: function () {
            var view = this._view;
            var elDef = this._elDef.parent;
            while (!elDef && view) {
                elDef = viewParentEl(view);
                view = view.parent;
            }
            return view ? new Injector_(view, elDef) : new Injector_(this._view, null);
        },
        enumerable: true,
        configurable: true
    });
    ViewContainerRef_.prototype.clear = function () {
        var len = this._embeddedViews.length;
        for (var i = len - 1; i >= 0; i--) {
            var view = detachEmbeddedView(this._data, i);
            Services.destroyView(view);
        }
    };
    ViewContainerRef_.prototype.get = function (index) {
        var view = this._embeddedViews[index];
        if (view) {
            var ref = new ViewRef_(view);
            ref.attachToViewContainerRef(this);
            return ref;
        }
        return null;
    };
    Object.defineProperty(ViewContainerRef_.prototype, "length", {
        get: function () { return this._embeddedViews.length; },
        enumerable: true,
        configurable: true
    });
    ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, context, index) {
        var viewRef = templateRef.createEmbeddedView(context || {});
        this.insert(viewRef, index);
        return viewRef;
    };
    ViewContainerRef_.prototype.createComponent = function (componentFactory, index, injector, projectableNodes, ngModuleRef) {
        var contextInjector = injector || this.parentInjector;
        if (!ngModuleRef && !(componentFactory instanceof ComponentFactoryBoundToModule)) {
            ngModuleRef = contextInjector.get(NgModuleRef);
        }
        var componentRef = componentFactory.create(contextInjector, projectableNodes, undefined, ngModuleRef);
        this.insert(componentRef.hostView, index);
        return componentRef;
    };
    ViewContainerRef_.prototype.insert = function (viewRef, index) {
        if (viewRef.destroyed) {
            throw new Error('Cannot insert a destroyed View in a ViewContainer!');
        }
        var viewRef_ = viewRef;
        var viewData = viewRef_._view;
        attachEmbeddedView(this._view, this._data, index, viewData);
        viewRef_.attachToViewContainerRef(this);
        return viewRef;
    };
    ViewContainerRef_.prototype.move = function (viewRef, currentIndex) {
        if (viewRef.destroyed) {
            throw new Error('Cannot move a destroyed View in a ViewContainer!');
        }
        var previousIndex = this._embeddedViews.indexOf(viewRef._view);
        moveEmbeddedView(this._data, previousIndex, currentIndex);
        return viewRef;
    };
    ViewContainerRef_.prototype.indexOf = function (viewRef) {
        return this._embeddedViews.indexOf(viewRef._view);
    };
    ViewContainerRef_.prototype.remove = function (index) {
        var viewData = detachEmbeddedView(this._data, index);
        if (viewData) {
            Services.destroyView(viewData);
        }
    };
    ViewContainerRef_.prototype.detach = function (index) {
        var view = detachEmbeddedView(this._data, index);
        return view ? new ViewRef_(view) : null;
    };
    return ViewContainerRef_;
}());
export function createChangeDetectorRef(view) {
    return new ViewRef_(view);
}
var ViewRef_ = /** @class */ (function () {
    function ViewRef_(_view) {
        this._view = _view;
        this._viewContainerRef = null;
        this._appRef = null;
    }
    Object.defineProperty(ViewRef_.prototype, "rootNodes", {
        get: function () { return rootRenderNodes(this._view); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "context", {
        get: function () { return this._view.context; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewRef_.prototype, "destroyed", {
        get: function () { return (this._view.state & 128 /* Destroyed */) !== 0; },
        enumerable: true,
        configurable: true
    });
    ViewRef_.prototype.markForCheck = function () { markParentViewsForCheck(this._view); };
    ViewRef_.prototype.detach = function () { this._view.state &= ~4 /* Attached */; };
    ViewRef_.prototype.detectChanges = function () {
        var fs = this._view.root.rendererFactory;
        if (fs.begin) {
            fs.begin();
        }
        try {
            Services.checkAndUpdateView(this._view);
        }
        finally {
            if (fs.end) {
                fs.end();
            }
        }
    };
    ViewRef_.prototype.checkNoChanges = function () { Services.checkNoChangesView(this._view); };
    ViewRef_.prototype.reattach = function () { this._view.state |= 4 /* Attached */; };
    ViewRef_.prototype.onDestroy = function (callback) {
        if (!this._view.disposables) {
            this._view.disposables = [];
        }
        this._view.disposables.push(callback);
    };
    ViewRef_.prototype.destroy = function () {
        if (this._appRef) {
            this._appRef.detachView(this);
        }
        else if (this._viewContainerRef) {
            this._viewContainerRef.detach(this._viewContainerRef.indexOf(this));
        }
        Services.destroyView(this._view);
    };
    ViewRef_.prototype.detachFromAppRef = function () {
        this._appRef = null;
        renderDetachView(this._view);
        Services.dirtyParentQueries(this._view);
    };
    ViewRef_.prototype.attachToAppRef = function (appRef) {
        if (this._viewContainerRef) {
            throw new Error('This view is already attached to a ViewContainer!');
        }
        this._appRef = appRef;
    };
    ViewRef_.prototype.attachToViewContainerRef = function (vcRef) {
        if (this._appRef) {
            throw new Error('This view is already attached directly to the ApplicationRef!');
        }
        this._viewContainerRef = vcRef;
    };
    return ViewRef_;
}());
export { ViewRef_ };
export function createTemplateData(view, def) {
    return new TemplateRef_(view, def);
}
var TemplateRef_ = /** @class */ (function (_super) {
    tslib_1.__extends(TemplateRef_, _super);
    function TemplateRef_(_parentView, _def) {
        var _this = _super.call(this) || this;
        _this._parentView = _parentView;
        _this._def = _def;
        return _this;
    }
    TemplateRef_.prototype.createEmbeddedView = function (context) {
        return new ViewRef_(Services.createEmbeddedView(this._parentView, this._def, this._def.element.template, context));
    };
    Object.defineProperty(TemplateRef_.prototype, "elementRef", {
        get: function () {
            return new ElementRef(asElementData(this._parentView, this._def.nodeIndex).renderElement);
        },
        enumerable: true,
        configurable: true
    });
    return TemplateRef_;
}(TemplateRef));
export function createInjector(view, elDef) {
    return new Injector_(view, elDef);
}
var Injector_ = /** @class */ (function () {
    function Injector_(view, elDef) {
        this.view = view;
        this.elDef = elDef;
    }
    Injector_.prototype.get = function (token, notFoundValue) {
        if (notFoundValue === void 0) { notFoundValue = Injector.THROW_IF_NOT_FOUND; }
        var allowPrivateServices = this.elDef ? (this.elDef.flags & 33554432 /* ComponentView */) !== 0 : false;
        return Services.resolveDep(this.view, this.elDef, allowPrivateServices, { flags: 0 /* None */, token: token, tokenKey: tokenKey(token) }, notFoundValue);
    };
    return Injector_;
}());
export function nodeValue(view, index) {
    var def = view.def.nodes[index];
    if (def.flags & 1 /* TypeElement */) {
        var elData = asElementData(view, def.nodeIndex);
        return def.element.template ? elData.template : elData.renderElement;
    }
    else if (def.flags & 2 /* TypeText */) {
        return asTextData(view, def.nodeIndex).renderText;
    }
    else if (def.flags & (20224 /* CatProvider */ | 16 /* TypePipe */)) {
        return asProviderData(view, def.nodeIndex).instance;
    }
    throw new Error("Illegal state: read nodeValue for node index " + index);
}
export function createRendererV1(view) {
    return new RendererAdapter(view.renderer);
}
var RendererAdapter = /** @class */ (function () {
    function RendererAdapter(delegate) {
        this.delegate = delegate;
    }
    RendererAdapter.prototype.selectRootElement = function (selectorOrNode) {
        return this.delegate.selectRootElement(selectorOrNode);
    };
    RendererAdapter.prototype.createElement = function (parent, namespaceAndName) {
        var _a = tslib_1.__read(splitNamespace(namespaceAndName), 2), ns = _a[0], name = _a[1];
        var el = this.delegate.createElement(name, ns);
        if (parent) {
            this.delegate.appendChild(parent, el);
        }
        return el;
    };
    RendererAdapter.prototype.createViewRoot = function (hostElement) { return hostElement; };
    RendererAdapter.prototype.createTemplateAnchor = function (parentElement) {
        var comment = this.delegate.createComment('');
        if (parentElement) {
            this.delegate.appendChild(parentElement, comment);
        }
        return comment;
    };
    RendererAdapter.prototype.createText = function (parentElement, value) {
        var node = this.delegate.createText(value);
        if (parentElement) {
            this.delegate.appendChild(parentElement, node);
        }
        return node;
    };
    RendererAdapter.prototype.projectNodes = function (parentElement, nodes) {
        for (var i = 0; i < nodes.length; i++) {
            this.delegate.appendChild(parentElement, nodes[i]);
        }
    };
    RendererAdapter.prototype.attachViewAfter = function (node, viewRootNodes) {
        var parentElement = this.delegate.parentNode(node);
        var nextSibling = this.delegate.nextSibling(node);
        for (var i = 0; i < viewRootNodes.length; i++) {
            this.delegate.insertBefore(parentElement, viewRootNodes[i], nextSibling);
        }
    };
    RendererAdapter.prototype.detachView = function (viewRootNodes) {
        for (var i = 0; i < viewRootNodes.length; i++) {
            var node = viewRootNodes[i];
            var parentElement = this.delegate.parentNode(node);
            this.delegate.removeChild(parentElement, node);
        }
    };
    RendererAdapter.prototype.destroyView = function (hostElement, viewAllNodes) {
        for (var i = 0; i < viewAllNodes.length; i++) {
            this.delegate.destroyNode(viewAllNodes[i]);
        }
    };
    RendererAdapter.prototype.listen = function (renderElement, name, callback) {
        return this.delegate.listen(renderElement, name, callback);
    };
    RendererAdapter.prototype.listenGlobal = function (target, name, callback) {
        return this.delegate.listen(target, name, callback);
    };
    RendererAdapter.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
        this.delegate.setProperty(renderElement, propertyName, propertyValue);
    };
    RendererAdapter.prototype.setElementAttribute = function (renderElement, namespaceAndName, attributeValue) {
        var _a = tslib_1.__read(splitNamespace(namespaceAndName), 2), ns = _a[0], name = _a[1];
        if (attributeValue != null) {
            this.delegate.setAttribute(renderElement, name, attributeValue, ns);
        }
        else {
            this.delegate.removeAttribute(renderElement, name, ns);
        }
    };
    RendererAdapter.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) { };
    RendererAdapter.prototype.setElementClass = function (renderElement, className, isAdd) {
        if (isAdd) {
            this.delegate.addClass(renderElement, className);
        }
        else {
            this.delegate.removeClass(renderElement, className);
        }
    };
    RendererAdapter.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
        if (styleValue != null) {
            this.delegate.setStyle(renderElement, styleName, styleValue);
        }
        else {
            this.delegate.removeStyle(renderElement, styleName);
        }
    };
    RendererAdapter.prototype.invokeElementMethod = function (renderElement, methodName, args) {
        renderElement[methodName].apply(renderElement, args);
    };
    RendererAdapter.prototype.setText = function (renderNode, text) { this.delegate.setValue(renderNode, text); };
    RendererAdapter.prototype.animate = function () { throw new Error('Renderer.animate is no longer supported!'); };
    return RendererAdapter;
}());
export function createNgModuleRef(moduleType, parent, bootstrapComponents, def) {
    return new NgModuleRef_(moduleType, parent, bootstrapComponents, def);
}
var NgModuleRef_ = /** @class */ (function () {
    function NgModuleRef_(_moduleType, _parent, _bootstrapComponents, _def) {
        this._moduleType = _moduleType;
        this._parent = _parent;
        this._bootstrapComponents = _bootstrapComponents;
        this._def = _def;
        this._destroyListeners = [];
        this._destroyed = false;
        this.injector = this;
        initNgModule(this);
    }
    NgModuleRef_.prototype.get = function (token, notFoundValue, injectFlags) {
        if (notFoundValue === void 0) { notFoundValue = Injector.THROW_IF_NOT_FOUND; }
        if (injectFlags === void 0) { injectFlags = 0 /* Default */; }
        var flags = 0 /* None */;
        if (injectFlags & 4 /* SkipSelf */) {
            flags |= 1 /* SkipSelf */;
        }
        else if (injectFlags & 2 /* Self */) {
            flags |= 4 /* Self */;
        }
        return resolveNgModuleDep(this, { token: token, tokenKey: tokenKey(token), flags: flags }, notFoundValue);
    };
    Object.defineProperty(NgModuleRef_.prototype, "instance", {
        get: function () { return this.get(this._moduleType); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgModuleRef_.prototype, "componentFactoryResolver", {
        get: function () { return this.get(ComponentFactoryResolver); },
        enumerable: true,
        configurable: true
    });
    NgModuleRef_.prototype.destroy = function () {
        if (this._destroyed) {
            throw new Error("The ng module " + stringify(this.instance.constructor) + " has already been destroyed.");
        }
        this._destroyed = true;
        callNgModuleLifecycle(this, 131072 /* OnDestroy */);
        this._destroyListeners.forEach(function (listener) { return listener(); });
    };
    NgModuleRef_.prototype.onDestroy = function (callback) { this._destroyListeners.push(callback); };
    return NgModuleRef_;
}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvcmVmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBSUgsT0FBTyxFQUFjLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRSxPQUFPLEVBQUMsNkJBQTZCLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUM3RyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDakQsT0FBTyxFQUFzQixXQUFXLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RSxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFLbkQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNsQyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRW5DLE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDcEYsT0FBTyxFQUE4RSxRQUFRLEVBQStFLGFBQWEsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBQ3RPLE9BQU8sRUFBQyx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDM0gsT0FBTyxFQUFDLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpHLElBQU0sYUFBYSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7QUFFbkMsNERBQTREO0FBQzVELCtE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Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmfSBmcm9tICcuLi9hcHBsaWNhdGlvbl9yZWYnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnLi4vY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0RmxhZ3MsIEluamVjdG9yfSBmcm9tICcuLi9kaS9pbmplY3Rvcic7XG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFJlZn0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeUJvdW5kVG9Nb2R1bGUsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcn0gZnJvbSAnLi4vbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5X3Jlc29sdmVyJztcbmltcG9ydCB7RWxlbWVudFJlZn0gZnJvbSAnLi4vbGlua2VyL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7SW50ZXJuYWxOZ01vZHVsZVJlZiwgTmdNb2R1bGVSZWZ9IGZyb20gJy4uL2xpbmtlci9uZ19tb2R1bGVfZmFjdG9yeSc7XG5pbXBvcnQge1RlbXBsYXRlUmVmfSBmcm9tICcuLi9saW5rZXIvdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZn0gZnJvbSAnLi4vbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZic7XG5pbXBvcnQge0VtYmVkZGVkVmlld1JlZiwgSW50ZXJuYWxWaWV3UmVmLCBWaWV3UmVmfSBmcm9tICcuLi9saW5rZXIvdmlld19yZWYnO1xuaW1wb3J0IHtSZW5kZXJlciBhcyBSZW5kZXJlclYxLCBSZW5kZXJlcjJ9IGZyb20gJy4uL3JlbmRlci9hcGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcbmltcG9ydCB7c3RyaW5naWZ5fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7VkVSU0lPTn0gZnJvbSAnLi4vdmVyc2lvbic7XG5cbmltcG9ydCB7Y2FsbE5nTW9kdWxlTGlmZWN5Y2xlLCBpbml0TmdNb2R1bGUsIHJlc29sdmVOZ01vZHVsZURlcH0gZnJvbSAnLi9uZ19tb2R1bGUnO1xuaW1wb3J0IHtEZXBGbGFncywgRWxlbWVudERhdGEsIE5nTW9kdWxlRGF0YSwgTmdNb2R1bGVEZWZpbml0aW9uLCBOb2RlRGVmLCBOb2RlRmxhZ3MsIFNlcnZpY2VzLCBUZW1wbGF0ZURhdGEsIFZpZXdDb250YWluZXJEYXRhLCBWaWV3RGF0YSwgVmlld0RlZmluaXRpb25GYWN0b3J5LCBWaWV3U3RhdGUsIGFzRWxlbWVudERhdGEsIGFzUHJvdmlkZXJEYXRhLCBhc1RleHREYXRhfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7bWFya1BhcmVudFZpZXdzRm9yQ2hlY2ssIHJlc29sdmVEZWZpbml0aW9uLCByb290UmVuZGVyTm9kZXMsIHNwbGl0TmFtZXNwYWNlLCB0b2tlbktleSwgdmlld1BhcmVudEVsfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHthdHRhY2hFbWJlZGRlZFZpZXcsIGRldGFjaEVtYmVkZGVkVmlldywgbW92ZUVtYmVkZGVkVmlldywgcmVuZGVyRGV0YWNoVmlld30gZnJvbSAnLi92aWV3X2F0dGFjaCc7XG5cbmNvbnN0IEVNUFRZX0NPTlRFWFQgPSBuZXcgT2JqZWN0KCk7XG5cbi8vIEF0dGVudGlvbjogdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYXMgdG9wIGxldmVsIGZ1bmN0aW9uLlxuLy8gUHV0dGluZyBhbnkgbG9naWMgaW4gaGVyZSB3aWxsIGRlc3Ryb3kgY2xvc3VyZSB0cmVlIHNoYWtpbmchXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50RmFjdG9yeShcbiAgICBzZWxlY3Rvcjogc3RyaW5nLCBjb21wb25lbnRUeXBlOiBUeXBlPGFueT4sIHZpZXdEZWZGYWN0b3J5OiBWaWV3RGVmaW5pdGlvbkZhY3RvcnksXG4gICAgaW5wdXRzOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9IHwgbnVsbCwgb3V0cHV0czoge1twcm9wTmFtZTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdKTogQ29tcG9uZW50RmFjdG9yeTxhbnk+IHtcbiAgcmV0dXJuIG5ldyBDb21wb25lbnRGYWN0b3J5XyhcbiAgICAgIHNlbGVjdG9yLCBjb21wb25lbnRUeXBlLCB2aWV3RGVmRmFjdG9yeSwgaW5wdXRzLCBvdXRwdXRzLCBuZ0NvbnRlbnRTZWxlY3RvcnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50Vmlld0RlZmluaXRpb25GYWN0b3J5KGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55Pik6XG4gICAgVmlld0RlZmluaXRpb25GYWN0b3J5IHtcbiAgcmV0dXJuIChjb21wb25lbnRGYWN0b3J5IGFzIENvbXBvbmVudEZhY3RvcnlfKS52aWV3RGVmRmFjdG9yeTtcbn1cblxuY2xhc3MgQ29tcG9uZW50RmFjdG9yeV8gZXh0ZW5kcyBDb21wb25lbnRGYWN0b3J5PGFueT4ge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICB2aWV3RGVmRmFjdG9yeTogVmlld0RlZmluaXRpb25GYWN0b3J5O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHNlbGVjdG9yOiBzdHJpbmcsIHB1YmxpYyBjb21wb25lbnRUeXBlOiBUeXBlPGFueT4sXG4gICAgICB2aWV3RGVmRmFjdG9yeTogVmlld0RlZmluaXRpb25GYWN0b3J5LCBwcml2YXRlIF9pbnB1dHM6IHtbcHJvcE5hbWU6IHN0cmluZ106IHN0cmluZ318bnVsbCxcbiAgICAgIHByaXZhdGUgX291dHB1dHM6IHtbcHJvcE5hbWU6IHN0cmluZ106IHN0cmluZ30sIHB1YmxpYyBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdKSB7XG4gICAgLy8gQXR0ZW50aW9uOiB0aGlzIGN0b3IgaXMgY2FsbGVkIGFzIHRvcCBsZXZlbCBmdW5jdGlvbi5cbiAgICAvLyBQdXR0aW5nIGFueSBsb2dpYyBpbiBoZXJlIHdpbGwgZGVzdHJveSBjbG9zdXJlIHRyZWUgc2hha2luZyFcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudmlld0RlZkZhY3RvcnkgPSB2aWV3RGVmRmFjdG9yeTtcbiAgfVxuXG4gIGdldCBpbnB1dHMoKSB7XG4gICAgY29uc3QgaW5wdXRzQXJyOiB7cHJvcE5hbWU6IHN0cmluZywgdGVtcGxhdGVOYW1lOiBzdHJpbmd9W10gPSBbXTtcbiAgICBjb25zdCBpbnB1dHMgPSB0aGlzLl9pbnB1dHMgITtcbiAgICBmb3IgKGxldCBwcm9wTmFtZSBpbiBpbnB1dHMpIHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlTmFtZSA9IGlucHV0c1twcm9wTmFtZV07XG4gICAgICBpbnB1dHNBcnIucHVzaCh7cHJvcE5hbWUsIHRlbXBsYXRlTmFtZX0pO1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXRzQXJyO1xuICB9XG5cbiAgZ2V0IG91dHB1dHMoKSB7XG4gICAgY29uc3Qgb3V0cHV0c0Fycjoge3Byb3BOYW1lOiBzdHJpbmcsIHRlbXBsYXRlTmFtZTogc3RyaW5nfVtdID0gW107XG4gICAgZm9yIChsZXQgcHJvcE5hbWUgaW4gdGhpcy5fb3V0cHV0cykge1xuICAgICAgY29uc3QgdGVtcGxhdGVOYW1lID0gdGhpcy5fb3V0cHV0c1twcm9wTmFtZV07XG4gICAgICBvdXRwdXRzQXJyLnB1c2goe3Byb3BOYW1lLCB0ZW1wbGF0ZU5hbWV9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dHNBcnI7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBjb21wb25lbnQuXG4gICAqL1xuICBjcmVhdGUoXG4gICAgICBpbmplY3RvcjogSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXM/OiBhbnlbXVtdLCByb290U2VsZWN0b3JPck5vZGU/OiBzdHJpbmd8YW55LFxuICAgICAgbmdNb2R1bGU/OiBOZ01vZHVsZVJlZjxhbnk+KTogQ29tcG9uZW50UmVmPGFueT4ge1xuICAgIGlmICghbmdNb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbmdNb2R1bGUgc2hvdWxkIGJlIHByb3ZpZGVkJyk7XG4gICAgfVxuICAgIGNvbnN0IHZpZXdEZWYgPSByZXNvbHZlRGVmaW5pdGlvbih0aGlzLnZpZXdEZWZGYWN0b3J5KTtcbiAgICBjb25zdCBjb21wb25lbnROb2RlSW5kZXggPSB2aWV3RGVmLm5vZGVzWzBdLmVsZW1lbnQgIS5jb21wb25lbnRQcm92aWRlciAhLm5vZGVJbmRleDtcbiAgICBjb25zdCB2aWV3ID0gU2VydmljZXMuY3JlYXRlUm9vdFZpZXcoXG4gICAgICAgIGluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzIHx8IFtdLCByb290U2VsZWN0b3JPck5vZGUsIHZpZXdEZWYsIG5nTW9kdWxlLCBFTVBUWV9DT05URVhUKTtcbiAgICBjb25zdCBjb21wb25lbnQgPSBhc1Byb3ZpZGVyRGF0YSh2aWV3LCBjb21wb25lbnROb2RlSW5kZXgpLmluc3RhbmNlO1xuICAgIGlmIChyb290U2VsZWN0b3JPck5vZGUpIHtcbiAgICAgIHZpZXcucmVuZGVyZXIuc2V0QXR0cmlidXRlKGFzRWxlbWVudERhdGEodmlldywgMCkucmVuZGVyRWxlbWVudCwgJ25nLXZlcnNpb24nLCBWRVJTSU9OLmZ1bGwpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50UmVmXyh2aWV3LCBuZXcgVmlld1JlZl8odmlldyksIGNvbXBvbmVudCk7XG4gIH1cbn1cblxuY2xhc3MgQ29tcG9uZW50UmVmXyBleHRlbmRzIENvbXBvbmVudFJlZjxhbnk+IHtcbiAgcHVibGljIHJlYWRvbmx5IGhvc3RWaWV3OiBWaWV3UmVmO1xuICBwdWJsaWMgcmVhZG9ubHkgaW5zdGFuY2U6IGFueTtcbiAgcHVibGljIHJlYWRvbmx5IGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZjtcbiAgcHJpdmF0ZSBfZWxEZWY6IE5vZGVEZWY7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXc6IFZpZXdEYXRhLCBwcml2YXRlIF92aWV3UmVmOiBWaWV3UmVmLCBwcml2YXRlIF9jb21wb25lbnQ6IGFueSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZWxEZWYgPSB0aGlzLl92aWV3LmRlZi5ub2Rlc1swXTtcbiAgICB0aGlzLmhvc3RWaWV3ID0gX3ZpZXdSZWY7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZiA9IF92aWV3UmVmO1xuICAgIHRoaXMuaW5zdGFuY2UgPSBfY29tcG9uZW50O1xuICB9XG4gIGdldCBsb2NhdGlvbigpOiBFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRSZWYoYXNFbGVtZW50RGF0YSh0aGlzLl92aWV3LCB0aGlzLl9lbERlZi5ub2RlSW5kZXgpLnJlbmRlckVsZW1lbnQpO1xuICB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiBuZXcgSW5qZWN0b3JfKHRoaXMuX3ZpZXcsIHRoaXMuX2VsRGVmKTsgfVxuICBnZXQgY29tcG9uZW50VHlwZSgpOiBUeXBlPGFueT4geyByZXR1cm4gPGFueT50aGlzLl9jb21wb25lbnQuY29uc3RydWN0b3I7IH1cblxuICBkZXN0cm95KCk6IHZvaWQgeyB0aGlzLl92aWV3UmVmLmRlc3Ryb3koKTsgfVxuICBvbkRlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZCB7IHRoaXMuX3ZpZXdSZWYub25EZXN0cm95KGNhbGxiYWNrKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVmlld0NvbnRhaW5lckRhdGEoXG4gICAgdmlldzogVmlld0RhdGEsIGVsRGVmOiBOb2RlRGVmLCBlbERhdGE6IEVsZW1lbnREYXRhKTogVmlld0NvbnRhaW5lckRhdGEge1xuICByZXR1cm4gbmV3IFZpZXdDb250YWluZXJSZWZfKHZpZXcsIGVsRGVmLCBlbERhdGEpO1xufVxuXG5jbGFzcyBWaWV3Q29udGFpbmVyUmVmXyBpbXBsZW1lbnRzIFZpZXdDb250YWluZXJEYXRhIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2VtYmVkZGVkVmlld3M6IFZpZXdEYXRhW10gPSBbXTtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlldzogVmlld0RhdGEsIHByaXZhdGUgX2VsRGVmOiBOb2RlRGVmLCBwcml2YXRlIF9kYXRhOiBFbGVtZW50RGF0YSkge31cblxuICBnZXQgZWxlbWVudCgpOiBFbGVtZW50UmVmIHsgcmV0dXJuIG5ldyBFbGVtZW50UmVmKHRoaXMuX2RhdGEucmVuZGVyRWxlbWVudCk7IH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gbmV3IEluamVjdG9yXyh0aGlzLl92aWV3LCB0aGlzLl9lbERlZik7IH1cblxuICBnZXQgcGFyZW50SW5qZWN0b3IoKTogSW5qZWN0b3Ige1xuICAgIGxldCB2aWV3ID0gdGhpcy5fdmlldztcbiAgICBsZXQgZWxEZWYgPSB0aGlzLl9lbERlZi5wYXJlbnQ7XG4gICAgd2hpbGUgKCFlbERlZiAmJiB2aWV3KSB7XG4gICAgICBlbERlZiA9IHZpZXdQYXJlbnRFbCh2aWV3KTtcbiAgICAgIHZpZXcgPSB2aWV3LnBhcmVudCAhO1xuICAgIH1cblxuICAgIHJldHVybiB2aWV3ID8gbmV3IEluamVjdG9yXyh2aWV3LCBlbERlZikgOiBuZXcgSW5qZWN0b3JfKHRoaXMuX3ZpZXcsIG51bGwpO1xuICB9XG5cbiAgY2xlYXIoKTogdm9pZCB7XG4gICAgY29uc3QgbGVuID0gdGhpcy5fZW1iZWRkZWRWaWV3cy5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IGxlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCB2aWV3ID0gZGV0YWNoRW1iZWRkZWRWaWV3KHRoaXMuX2RhdGEsIGkpICE7XG4gICAgICBTZXJ2aWNlcy5kZXN0cm95Vmlldyh2aWV3KTtcbiAgICB9XG4gIH1cblxuICBnZXQoaW5kZXg6IG51bWJlcik6IFZpZXdSZWZ8bnVsbCB7XG4gICAgY29uc3QgdmlldyA9IHRoaXMuX2VtYmVkZGVkVmlld3NbaW5kZXhdO1xuICAgIGlmICh2aWV3KSB7XG4gICAgICBjb25zdCByZWYgPSBuZXcgVmlld1JlZl8odmlldyk7XG4gICAgICByZWYuYXR0YWNoVG9WaWV3Q29udGFpbmVyUmVmKHRoaXMpO1xuICAgICAgcmV0dXJuIHJlZjtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9lbWJlZGRlZFZpZXdzLmxlbmd0aDsgfVxuXG4gIGNyZWF0ZUVtYmVkZGVkVmlldzxDPih0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8Qz4sIGNvbnRleHQ/OiBDLCBpbmRleD86IG51bWJlcik6XG4gICAgICBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xuICAgIGNvbnN0IHZpZXdSZWYgPSB0ZW1wbGF0ZVJlZi5jcmVhdGVFbWJlZGRlZFZpZXcoY29udGV4dCB8fCA8YW55Pnt9KTtcbiAgICB0aGlzLmluc2VydCh2aWV3UmVmLCBpbmRleCk7XG4gICAgcmV0dXJuIHZpZXdSZWY7XG4gIH1cblxuICBjcmVhdGVDb21wb25lbnQ8Qz4oXG4gICAgICBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEM+LCBpbmRleD86IG51bWJlciwgaW5qZWN0b3I/OiBJbmplY3RvcixcbiAgICAgIHByb2plY3RhYmxlTm9kZXM/OiBhbnlbXVtdLCBuZ01vZHVsZVJlZj86IE5nTW9kdWxlUmVmPGFueT4pOiBDb21wb25lbnRSZWY8Qz4ge1xuICAgIGNvbnN0IGNvbnRleHRJbmplY3RvciA9IGluamVjdG9yIHx8IHRoaXMucGFyZW50SW5qZWN0b3I7XG4gICAgaWYgKCFuZ01vZHVsZVJlZiAmJiAhKGNvbXBvbmVudEZhY3RvcnkgaW5zdGFuY2VvZiBDb21wb25lbnRGYWN0b3J5Qm91bmRUb01vZHVsZSkpIHtcbiAgICAgIG5nTW9kdWxlUmVmID0gY29udGV4dEluamVjdG9yLmdldChOZ01vZHVsZVJlZik7XG4gICAgfVxuICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9XG4gICAgICAgIGNvbXBvbmVudEZhY3RvcnkuY3JlYXRlKGNvbnRleHRJbmplY3RvciwgcHJvamVjdGFibGVOb2RlcywgdW5kZWZpbmVkLCBuZ01vZHVsZVJlZik7XG4gICAgdGhpcy5pbnNlcnQoY29tcG9uZW50UmVmLmhvc3RWaWV3LCBpbmRleCk7XG4gICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgfVxuXG4gIGluc2VydCh2aWV3UmVmOiBWaWV3UmVmLCBpbmRleD86IG51bWJlcik6IFZpZXdSZWYge1xuICAgIGlmICh2aWV3UmVmLmRlc3Ryb3llZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgaW5zZXJ0IGEgZGVzdHJveWVkIFZpZXcgaW4gYSBWaWV3Q29udGFpbmVyIScpO1xuICAgIH1cbiAgICBjb25zdCB2aWV3UmVmXyA9IDxWaWV3UmVmXz52aWV3UmVmO1xuICAgIGNvbnN0IHZpZXdEYXRhID0gdmlld1JlZl8uX3ZpZXc7XG4gICAgYXR0YWNoRW1iZWRkZWRWaWV3KHRoaXMuX3ZpZXcsIHRoaXMuX2RhdGEsIGluZGV4LCB2aWV3RGF0YSk7XG4gICAgdmlld1JlZl8uYXR0YWNoVG9WaWV3Q29udGFpbmVyUmVmKHRoaXMpO1xuICAgIHJldHVybiB2aWV3UmVmO1xuICB9XG5cbiAgbW92ZSh2aWV3UmVmOiBWaWV3UmVmXywgY3VycmVudEluZGV4OiBudW1iZXIpOiBWaWV3UmVmIHtcbiAgICBpZiAodmlld1JlZi5kZXN0cm95ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IG1vdmUgYSBkZXN0cm95ZWQgVmlldyBpbiBhIFZpZXdDb250YWluZXIhJyk7XG4gICAgfVxuICAgIGNvbnN0IHByZXZpb3VzSW5kZXggPSB0aGlzLl9lbWJlZGRlZFZpZXdzLmluZGV4T2Yodmlld1JlZi5fdmlldyk7XG4gICAgbW92ZUVtYmVkZGVkVmlldyh0aGlzLl9kYXRhLCBwcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xuICAgIHJldHVybiB2aWV3UmVmO1xuICB9XG5cbiAgaW5kZXhPZih2aWV3UmVmOiBWaWV3UmVmKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fZW1iZWRkZWRWaWV3cy5pbmRleE9mKCg8Vmlld1JlZl8+dmlld1JlZikuX3ZpZXcpO1xuICB9XG5cbiAgcmVtb3ZlKGluZGV4PzogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3Qgdmlld0RhdGEgPSBkZXRhY2hFbWJlZGRlZFZpZXcodGhpcy5fZGF0YSwgaW5kZXgpO1xuICAgIGlmICh2aWV3RGF0YSkge1xuICAgICAgU2VydmljZXMuZGVzdHJveVZpZXcodmlld0RhdGEpO1xuICAgIH1cbiAgfVxuXG4gIGRldGFjaChpbmRleD86IG51bWJlcik6IFZpZXdSZWZ8bnVsbCB7XG4gICAgY29uc3QgdmlldyA9IGRldGFjaEVtYmVkZGVkVmlldyh0aGlzLl9kYXRhLCBpbmRleCk7XG4gICAgcmV0dXJuIHZpZXcgPyBuZXcgVmlld1JlZl8odmlldykgOiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDaGFuZ2VEZXRlY3RvclJlZih2aWV3OiBWaWV3RGF0YSk6IENoYW5nZURldGVjdG9yUmVmIHtcbiAgcmV0dXJuIG5ldyBWaWV3UmVmXyh2aWV3KTtcbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdSZWZfIGltcGxlbWVudHMgRW1iZWRkZWRWaWV3UmVmPGFueT4sIEludGVybmFsVmlld1JlZiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZpZXc6IFZpZXdEYXRhO1xuICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmfG51bGw7XG4gIHByaXZhdGUgX2FwcFJlZjogQXBwbGljYXRpb25SZWZ8bnVsbDtcblxuICBjb25zdHJ1Y3RvcihfdmlldzogVmlld0RhdGEpIHtcbiAgICB0aGlzLl92aWV3ID0gX3ZpZXc7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZiA9IG51bGw7XG4gICAgdGhpcy5fYXBwUmVmID0gbnVsbDtcbiAgfVxuXG4gIGdldCByb290Tm9kZXMoKTogYW55W10geyByZXR1cm4gcm9vdFJlbmRlck5vZGVzKHRoaXMuX3ZpZXcpOyB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLl92aWV3LmNvbnRleHQ7IH1cblxuICBnZXQgZGVzdHJveWVkKCk6IGJvb2xlYW4geyByZXR1cm4gKHRoaXMuX3ZpZXcuc3RhdGUgJiBWaWV3U3RhdGUuRGVzdHJveWVkKSAhPT0gMDsgfVxuXG4gIG1hcmtGb3JDaGVjaygpOiB2b2lkIHsgbWFya1BhcmVudFZpZXdzRm9yQ2hlY2sodGhpcy5fdmlldyk7IH1cbiAgZGV0YWNoKCk6IHZvaWQgeyB0aGlzLl92aWV3LnN0YXRlICY9IH5WaWV3U3RhdGUuQXR0YWNoZWQ7IH1cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICBjb25zdCBmcyA9IHRoaXMuX3ZpZXcucm9vdC5yZW5kZXJlckZhY3Rvcnk7XG4gICAgaWYgKGZzLmJlZ2luKSB7XG4gICAgICBmcy5iZWdpbigpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgU2VydmljZXMuY2hlY2tBbmRVcGRhdGVWaWV3KHRoaXMuX3ZpZXcpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoZnMuZW5kKSB7XG4gICAgICAgIGZzLmVuZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgU2VydmljZXMuY2hlY2tOb0NoYW5nZXNWaWV3KHRoaXMuX3ZpZXcpOyB9XG5cbiAgcmVhdHRhY2goKTogdm9pZCB7IHRoaXMuX3ZpZXcuc3RhdGUgfD0gVmlld1N0YXRlLkF0dGFjaGVkOyB9XG4gIG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICBpZiAoIXRoaXMuX3ZpZXcuZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX3ZpZXcuZGlzcG9zYWJsZXMgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5fdmlldy5kaXNwb3NhYmxlcy5wdXNoKDxhbnk+Y2FsbGJhY2spO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fYXBwUmVmKSB7XG4gICAgICB0aGlzLl9hcHBSZWYuZGV0YWNoVmlldyh0aGlzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXdDb250YWluZXJSZWYpIHtcbiAgICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYuZGV0YWNoKHRoaXMuX3ZpZXdDb250YWluZXJSZWYuaW5kZXhPZih0aGlzKSk7XG4gICAgfVxuICAgIFNlcnZpY2VzLmRlc3Ryb3lWaWV3KHRoaXMuX3ZpZXcpO1xuICB9XG5cbiAgZGV0YWNoRnJvbUFwcFJlZigpIHtcbiAgICB0aGlzLl9hcHBSZWYgPSBudWxsO1xuICAgIHJlbmRlckRldGFjaFZpZXcodGhpcy5fdmlldyk7XG4gICAgU2VydmljZXMuZGlydHlQYXJlbnRRdWVyaWVzKHRoaXMuX3ZpZXcpO1xuICB9XG5cbiAgYXR0YWNoVG9BcHBSZWYoYXBwUmVmOiBBcHBsaWNhdGlvblJlZikge1xuICAgIGlmICh0aGlzLl92aWV3Q29udGFpbmVyUmVmKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdmlldyBpcyBhbHJlYWR5IGF0dGFjaGVkIHRvIGEgVmlld0NvbnRhaW5lciEnKTtcbiAgICB9XG4gICAgdGhpcy5fYXBwUmVmID0gYXBwUmVmO1xuICB9XG5cbiAgYXR0YWNoVG9WaWV3Q29udGFpbmVyUmVmKHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XG4gICAgaWYgKHRoaXMuX2FwcFJlZikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIHZpZXcgaXMgYWxyZWFkeSBhdHRhY2hlZCBkaXJlY3RseSB0byB0aGUgQXBwbGljYXRpb25SZWYhJyk7XG4gICAgfVxuICAgIHRoaXMuX3ZpZXdDb250YWluZXJSZWYgPSB2Y1JlZjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGVtcGxhdGVEYXRhKHZpZXc6IFZpZXdEYXRhLCBkZWY6IE5vZGVEZWYpOiBUZW1wbGF0ZURhdGEge1xuICByZXR1cm4gbmV3IFRlbXBsYXRlUmVmXyh2aWV3LCBkZWYpO1xufVxuXG5jbGFzcyBUZW1wbGF0ZVJlZl8gZXh0ZW5kcyBUZW1wbGF0ZVJlZjxhbnk+IGltcGxlbWVudHMgVGVtcGxhdGVEYXRhIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3Byb2plY3RlZFZpZXdzOiBWaWV3RGF0YVtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BhcmVudFZpZXc6IFZpZXdEYXRhLCBwcml2YXRlIF9kZWY6IE5vZGVEZWYpIHsgc3VwZXIoKTsgfVxuXG4gIGNyZWF0ZUVtYmVkZGVkVmlldyhjb250ZXh0OiBhbnkpOiBFbWJlZGRlZFZpZXdSZWY8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBWaWV3UmVmXyhTZXJ2aWNlcy5jcmVhdGVFbWJlZGRlZFZpZXcoXG4gICAgICAgIHRoaXMuX3BhcmVudFZpZXcsIHRoaXMuX2RlZiwgdGhpcy5fZGVmLmVsZW1lbnQgIS50ZW1wbGF0ZSAhLCBjb250ZXh0KSk7XG4gIH1cblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRSZWYoYXNFbGVtZW50RGF0YSh0aGlzLl9wYXJlbnRWaWV3LCB0aGlzLl9kZWYubm9kZUluZGV4KS5yZW5kZXJFbGVtZW50KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5qZWN0b3IodmlldzogVmlld0RhdGEsIGVsRGVmOiBOb2RlRGVmKTogSW5qZWN0b3Ige1xuICByZXR1cm4gbmV3IEluamVjdG9yXyh2aWV3LCBlbERlZik7XG59XG5cbmNsYXNzIEluamVjdG9yXyBpbXBsZW1lbnRzIEluamVjdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB2aWV3OiBWaWV3RGF0YSwgcHJpdmF0ZSBlbERlZjogTm9kZURlZnxudWxsKSB7fVxuICBnZXQodG9rZW46IGFueSwgbm90Rm91bmRWYWx1ZTogYW55ID0gSW5qZWN0b3IuVEhST1dfSUZfTk9UX0ZPVU5EKTogYW55IHtcbiAgICBjb25zdCBhbGxvd1ByaXZhdGVTZXJ2aWNlcyA9XG4gICAgICAgIHRoaXMuZWxEZWYgPyAodGhpcy5lbERlZi5mbGFncyAmIE5vZGVGbGFncy5Db21wb25lbnRWaWV3KSAhPT0gMCA6IGZhbHNlO1xuICAgIHJldHVybiBTZXJ2aWNlcy5yZXNvbHZlRGVwKFxuICAgICAgICB0aGlzLnZpZXcsIHRoaXMuZWxEZWYsIGFsbG93UHJpdmF0ZVNlcnZpY2VzLFxuICAgICAgICB7ZmxhZ3M6IERlcEZsYWdzLk5vbmUsIHRva2VuLCB0b2tlbktleTogdG9rZW5LZXkodG9rZW4pfSwgbm90Rm91bmRWYWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVWYWx1ZSh2aWV3OiBWaWV3RGF0YSwgaW5kZXg6IG51bWJlcik6IGFueSB7XG4gIGNvbnN0IGRlZiA9IHZpZXcuZGVmLm5vZGVzW2luZGV4XTtcbiAgaWYgKGRlZi5mbGFncyAmIE5vZGVGbGFncy5UeXBlRWxlbWVudCkge1xuICAgIGNvbnN0IGVsRGF0YSA9IGFzRWxlbWVudERhdGEodmlldywgZGVmLm5vZGVJbmRleCk7XG4gICAgcmV0dXJuIGRlZi5lbGVtZW50ICEudGVtcGxhdGUgPyBlbERhdGEudGVtcGxhdGUgOiBlbERhdGEucmVuZGVyRWxlbWVudDtcbiAgfSBlbHNlIGlmIChkZWYuZmxhZ3MgJiBOb2RlRmxhZ3MuVHlwZVRleHQpIHtcbiAgICByZXR1cm4gYXNUZXh0RGF0YSh2aWV3LCBkZWYubm9kZUluZGV4KS5yZW5kZXJUZXh0O1xuICB9IGVsc2UgaWYgKGRlZi5mbGFncyAmIChOb2RlRmxhZ3MuQ2F0UHJvdmlkZXIgfCBOb2RlRmxhZ3MuVHlwZVBpcGUpKSB7XG4gICAgcmV0dXJuIGFzUHJvdmlkZXJEYXRhKHZpZXcsIGRlZi5ub2RlSW5kZXgpLmluc3RhbmNlO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgSWxsZWdhbCBzdGF0ZTogcmVhZCBub2RlVmFsdWUgZm9yIG5vZGUgaW5kZXggJHtpbmRleH1gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlbmRlcmVyVjEodmlldzogVmlld0RhdGEpOiBSZW5kZXJlclYxIHtcbiAgcmV0dXJuIG5ldyBSZW5kZXJlckFkYXB0ZXIodmlldy5yZW5kZXJlcik7XG59XG5cbmNsYXNzIFJlbmRlcmVyQWRhcHRlciBpbXBsZW1lbnRzIFJlbmRlcmVyVjEge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRlbGVnYXRlOiBSZW5kZXJlcjIpIHt9XG4gIHNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yT3JOb2RlOiBzdHJpbmd8RWxlbWVudCk6IEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLnNlbGVjdFJvb3RFbGVtZW50KHNlbGVjdG9yT3JOb2RlKTtcbiAgfVxuXG4gIGNyZWF0ZUVsZW1lbnQocGFyZW50OiBFbGVtZW50fERvY3VtZW50RnJhZ21lbnQsIG5hbWVzcGFjZUFuZE5hbWU6IHN0cmluZyk6IEVsZW1lbnQge1xuICAgIGNvbnN0IFtucywgbmFtZV0gPSBzcGxpdE5hbWVzcGFjZShuYW1lc3BhY2VBbmROYW1lKTtcbiAgICBjb25zdCBlbCA9IHRoaXMuZGVsZWdhdGUuY3JlYXRlRWxlbWVudChuYW1lLCBucyk7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5hcHBlbmRDaGlsZChwYXJlbnQsIGVsKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsO1xuICB9XG5cbiAgY3JlYXRlVmlld1Jvb3QoaG9zdEVsZW1lbnQ6IEVsZW1lbnQpOiBFbGVtZW50fERvY3VtZW50RnJhZ21lbnQgeyByZXR1cm4gaG9zdEVsZW1lbnQ7IH1cblxuICBjcmVhdGVUZW1wbGF0ZUFuY2hvcihwYXJlbnRFbGVtZW50OiBFbGVtZW50fERvY3VtZW50RnJhZ21lbnQpOiBDb21tZW50IHtcbiAgICBjb25zdCBjb21tZW50ID0gdGhpcy5kZWxlZ2F0ZS5jcmVhdGVDb21tZW50KCcnKTtcbiAgICBpZiAocGFyZW50RWxlbWVudCkge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5hcHBlbmRDaGlsZChwYXJlbnRFbGVtZW50LCBjb21tZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbW1lbnQ7XG4gIH1cblxuICBjcmVhdGVUZXh0KHBhcmVudEVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnRGcmFnbWVudCwgdmFsdWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZGVsZWdhdGUuY3JlYXRlVGV4dCh2YWx1ZSk7XG4gICAgaWYgKHBhcmVudEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuYXBwZW5kQ2hpbGQocGFyZW50RWxlbWVudCwgbm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgcHJvamVjdE5vZGVzKHBhcmVudEVsZW1lbnQ6IEVsZW1lbnR8RG9jdW1lbnRGcmFnbWVudCwgbm9kZXM6IE5vZGVbXSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuYXBwZW5kQ2hpbGQocGFyZW50RWxlbWVudCwgbm9kZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaFZpZXdBZnRlcihub2RlOiBOb2RlLCB2aWV3Um9vdE5vZGVzOiBOb2RlW10pIHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gdGhpcy5kZWxlZ2F0ZS5wYXJlbnROb2RlKG5vZGUpO1xuICAgIGNvbnN0IG5leHRTaWJsaW5nID0gdGhpcy5kZWxlZ2F0ZS5uZXh0U2libGluZyhub2RlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZpZXdSb290Tm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuaW5zZXJ0QmVmb3JlKHBhcmVudEVsZW1lbnQsIHZpZXdSb290Tm9kZXNbaV0sIG5leHRTaWJsaW5nKTtcbiAgICB9XG4gIH1cblxuICBkZXRhY2hWaWV3KHZpZXdSb290Tm9kZXM6IChFbGVtZW50fFRleHR8Q29tbWVudClbXSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmlld1Jvb3ROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgbm9kZSA9IHZpZXdSb290Tm9kZXNbaV07XG4gICAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gdGhpcy5kZWxlZ2F0ZS5wYXJlbnROb2RlKG5vZGUpO1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVDaGlsZChwYXJlbnRFbGVtZW50LCBub2RlKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95Vmlldyhob3N0RWxlbWVudDogRWxlbWVudHxEb2N1bWVudEZyYWdtZW50LCB2aWV3QWxsTm9kZXM6IE5vZGVbXSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmlld0FsbE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLmRlc3Ryb3lOb2RlICEodmlld0FsbE5vZGVzW2ldKTtcbiAgICB9XG4gIH1cblxuICBsaXN0ZW4ocmVuZGVyRWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5saXN0ZW4ocmVuZGVyRWxlbWVudCwgbmFtZSwgPGFueT5jYWxsYmFjayk7XG4gIH1cblxuICBsaXN0ZW5HbG9iYWwodGFyZ2V0OiBzdHJpbmcsIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLmxpc3Rlbih0YXJnZXQsIG5hbWUsIDxhbnk+Y2FsbGJhY2spO1xuICB9XG5cbiAgc2V0RWxlbWVudFByb3BlcnR5KFxuICAgICAgcmVuZGVyRWxlbWVudDogRWxlbWVudHxEb2N1bWVudEZyYWdtZW50LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5kZWxlZ2F0ZS5zZXRQcm9wZXJ0eShyZW5kZXJFbGVtZW50LCBwcm9wZXJ0eU5hbWUsIHByb3BlcnR5VmFsdWUpO1xuICB9XG5cbiAgc2V0RWxlbWVudEF0dHJpYnV0ZShyZW5kZXJFbGVtZW50OiBFbGVtZW50LCBuYW1lc3BhY2VBbmROYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZVZhbHVlOiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgW25zLCBuYW1lXSA9IHNwbGl0TmFtZXNwYWNlKG5hbWVzcGFjZUFuZE5hbWUpO1xuICAgIGlmIChhdHRyaWJ1dGVWYWx1ZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLnNldEF0dHJpYnV0ZShyZW5kZXJFbGVtZW50LCBuYW1lLCBhdHRyaWJ1dGVWYWx1ZSwgbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlbGVnYXRlLnJlbW92ZUF0dHJpYnV0ZShyZW5kZXJFbGVtZW50LCBuYW1lLCBucyk7XG4gICAgfVxuICB9XG5cbiAgc2V0QmluZGluZ0RlYnVnSW5mbyhyZW5kZXJFbGVtZW50OiBFbGVtZW50LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogc3RyaW5nKTogdm9pZCB7fVxuXG4gIHNldEVsZW1lbnRDbGFzcyhyZW5kZXJFbGVtZW50OiBFbGVtZW50LCBjbGFzc05hbWU6IHN0cmluZywgaXNBZGQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXNBZGQpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuYWRkQ2xhc3MocmVuZGVyRWxlbWVudCwgY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVDbGFzcyhyZW5kZXJFbGVtZW50LCBjbGFzc05hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHNldEVsZW1lbnRTdHlsZShyZW5kZXJFbGVtZW50OiBIVE1MRWxlbWVudCwgc3R5bGVOYW1lOiBzdHJpbmcsIHN0eWxlVmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChzdHlsZVZhbHVlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUuc2V0U3R5bGUocmVuZGVyRWxlbWVudCwgc3R5bGVOYW1lLCBzdHlsZVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWxlZ2F0ZS5yZW1vdmVTdHlsZShyZW5kZXJFbGVtZW50LCBzdHlsZU5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGludm9rZUVsZW1lbnRNZXRob2QocmVuZGVyRWxlbWVudDogRWxlbWVudCwgbWV0aG9kTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSk6IHZvaWQge1xuICAgIChyZW5kZXJFbGVtZW50IGFzIGFueSlbbWV0aG9kTmFtZV0uYXBwbHkocmVuZGVyRWxlbWVudCwgYXJncyk7XG4gIH1cblxuICBzZXRUZXh0KHJlbmRlck5vZGU6IFRleHQsIHRleHQ6IHN0cmluZyk6IHZvaWQgeyB0aGlzLmRlbGVnYXRlLnNldFZhbHVlKHJlbmRlck5vZGUsIHRleHQpOyB9XG5cbiAgYW5pbWF0ZSgpOiBhbnkgeyB0aHJvdyBuZXcgRXJyb3IoJ1JlbmRlcmVyLmFuaW1hdGUgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCEnKTsgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ01vZHVsZVJlZihcbiAgICBtb2R1bGVUeXBlOiBUeXBlPGFueT4sIHBhcmVudDogSW5qZWN0b3IsIGJvb3RzdHJhcENvbXBvbmVudHM6IFR5cGU8YW55PltdLFxuICAgIGRlZjogTmdNb2R1bGVEZWZpbml0aW9uKTogTmdNb2R1bGVSZWY8YW55PiB7XG4gIHJldHVybiBuZXcgTmdNb2R1bGVSZWZfKG1vZHVsZVR5cGUsIHBhcmVudCwgYm9vdHN0cmFwQ29tcG9uZW50cywgZGVmKTtcbn1cblxuY2xhc3MgTmdNb2R1bGVSZWZfIGltcGxlbWVudHMgTmdNb2R1bGVEYXRhLCBJbnRlcm5hbE5nTW9kdWxlUmVmPGFueT4ge1xuICBwcml2YXRlIF9kZXN0cm95TGlzdGVuZXJzOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xuICBwcml2YXRlIF9kZXN0cm95ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJvdmlkZXJzOiBhbnlbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbW9kdWxlczogYW55W107XG5cbiAgcmVhZG9ubHkgaW5qZWN0b3I6IEluamVjdG9yID0gdGhpcztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX21vZHVsZVR5cGU6IFR5cGU8YW55PiwgcHVibGljIF9wYXJlbnQ6IEluamVjdG9yLFxuICAgICAgcHVibGljIF9ib290c3RyYXBDb21wb25lbnRzOiBUeXBlPGFueT5bXSwgcHVibGljIF9kZWY6IE5nTW9kdWxlRGVmaW5pdGlvbikge1xuICAgIGluaXROZ01vZHVsZSh0aGlzKTtcbiAgfVxuXG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlOiBhbnkgPSBJbmplY3Rvci5USFJPV19JRl9OT1RfRk9VTkQsXG4gICAgICBpbmplY3RGbGFnczogSW5qZWN0RmxhZ3MgPSBJbmplY3RGbGFncy5EZWZhdWx0KTogYW55IHtcbiAgICBsZXQgZmxhZ3MgPSBEZXBGbGFncy5Ob25lO1xuICAgIGlmIChpbmplY3RGbGFncyAmIEluamVjdEZsYWdzLlNraXBTZWxmKSB7XG4gICAgICBmbGFncyB8PSBEZXBGbGFncy5Ta2lwU2VsZjtcbiAgICB9IGVsc2UgaWYgKGluamVjdEZsYWdzICYgSW5qZWN0RmxhZ3MuU2VsZikge1xuICAgICAgZmxhZ3MgfD0gRGVwRmxhZ3MuU2VsZjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc29sdmVOZ01vZHVsZURlcChcbiAgICAgICAgdGhpcywge3Rva2VuOiB0b2tlbiwgdG9rZW5LZXk6IHRva2VuS2V5KHRva2VuKSwgZmxhZ3M6IGZsYWdzfSwgbm90Rm91bmRWYWx1ZSk7XG4gIH1cblxuICBnZXQgaW5zdGFuY2UoKSB7IHJldHVybiB0aGlzLmdldCh0aGlzLl9tb2R1bGVUeXBlKTsgfVxuXG4gIGdldCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIoKSB7IHJldHVybiB0aGlzLmdldChDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpOyB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFRoZSBuZyBtb2R1bGUgJHtzdHJpbmdpZnkodGhpcy5pbnN0YW5jZS5jb25zdHJ1Y3Rvcil9IGhhcyBhbHJlYWR5IGJlZW4gZGVzdHJveWVkLmApO1xuICAgIH1cbiAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgIGNhbGxOZ01vZHVsZUxpZmVjeWNsZSh0aGlzLCBOb2RlRmxhZ3MuT25EZXN0cm95KTtcbiAgICB0aGlzLl9kZXN0cm95TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcigpKTtcbiAgfVxuXG4gIG9uRGVzdHJveShjYWxsYmFjazogKCkgPT4gdm9pZCk6IHZvaWQgeyB0aGlzLl9kZXN0cm95TGlzdGVuZXJzLnB1c2goY2FsbGJhY2spOyB9XG59XG4iXX0=