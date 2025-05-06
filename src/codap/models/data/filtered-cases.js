"use strict"
let __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    let useValue = arguments.length > 2
    for (let i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg)
    }
    return useValue ? value : void 0
}
let __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f }
    let kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value"
    let target = !descriptorIn && ctor ? contextIn.static ? ctor : ctor.prototype : null
    let descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {})
    let _, done = false
    for (let i = decorators.length - 1; i >= 0; i--) {
        let context = {}
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p]
        for (var p in contextIn.access) context.access[p] = contextIn.access[p]
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)) }
        let result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context)
        if (kind === "accessor") {
            if (result === void 0) continue
            if (result === null || typeof result !== "object") throw new TypeError("Object expected")
            if (_ = accept(result.get)) descriptor.get = _
            if (_ = accept(result.set)) descriptor.set = _
            if (_ = accept(result.init)) initializers.unshift(_)
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_)
            else descriptor[key] = _
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor)
    done = true
}
Object.defineProperty(exports, "__esModule", { value: true })
exports.FilteredCases = void 0
let mobx_1 = require("mobx")
let mobx_state_tree_1 = require("mobx-state-tree")
let js_utils_1 = require("../../utilities/js-utils")
let mst_utils_1 = require("../../utilities/mst-utils")
let data_set_actions_1 = require("./data-set-actions")
let FilteredCases = function () {
    let _a
    let _instanceExtraInitializers = []
    let _filter_decorators
    let _filter_initializers = []
    let _filter_extraInitializers = []
    let _get_rawCaseIds_decorators
    let _get_caseIds_decorators
    let _get_caseIdSet_decorators
    let _setCaseFilter_decorators
    let _setCasesArrayNumber_decorators
    let _setCollectionID_decorators
    let _invalidateCases_decorators
    return _a = /** @class */ (function () {
            function FilteredCases(_b) {
                let source = _b.source, collectionID = _b.collectionID, _c = _b.casesArrayNumber, casesArrayNumber = _c === void 0 ? 0 : _c, filter = _b.filter, onSetCaseValues = _b.onSetCaseValues
                let _this = this
                this.id = (__runInitializers(this, _instanceExtraInitializers), (0, js_utils_1.typedId)("FICA"))
                this.filter = __runInitializers(this, _filter_initializers, void 0)
                this.onSetCaseValues = __runInitializers(this, _filter_extraInitializers)
                this.prevCaseIdSet = new Set()
                this.hasCaseId = function (caseId) {
                    return _this.caseIdSet.has(caseId)
                }
                this.handleBeforeAction = function (actionCall) {
                    if ((0, data_set_actions_1.isSetCaseValuesAction)(actionCall)) {
                        // cache the pre-change filter state of the affected cases
                        _this.prevCaseIdSet.clear()
                        let cases = actionCall.args[0]
                        cases.forEach(function (aCase) {
                            if (_this.hasCaseId(aCase.__id__)) {
                                _this.prevCaseIdSet.add(aCase.__id__)
                            }
                        })
                    }
                }
                this.handleAction = function (actionCall) {
                    let _b
                    if ((0, data_set_actions_1.isSetCaseValuesAction)(actionCall)) {
                        let cases = actionCall.args[0]
                        let added_1 = []
                        let changed_1 = []
                        let removed_1 = []
                        cases.forEach(function (aCase) {
                            // compare the pre-/post-change filter state of the affected cases
                            let wasIncluded = _this.prevCaseIdSet.has(aCase.__id__)
                            let nowIncluded = !_this.filter || (_this.source && _this.filter(_this.source, aCase.__id__))
                            if (wasIncluded === nowIncluded) {
                                changed_1.push(aCase.__id__)
                            }
                            else if (nowIncluded) {
                                added_1.push(aCase.__id__)
                            }
                            else {
                                removed_1.push(aCase.__id__)
                            }
                        })
                        // if any cases changed filter state, invalidate the cached results
                        if (added_1.length || removed_1.length) {
                            _this.invalidateCases()
                        }
                        // let listeners know how the change affects the filtered cases
                        (_b = _this.onSetCaseValues) === null || _b === void 0 ? void 0 : _b.call(_this, actionCall, { added: added_1, changed: changed_1, removed: removed_1 })
                    }
                }
                this.source = source
                this.collectionID = collectionID
                this.casesArrayNumber = casesArrayNumber
                this.filter = filter
                this.onSetCaseValues = onSetCaseValues;
                (0, mobx_1.makeObservable)(this)
                this.disposers = [
                    (0, mobx_state_tree_1.addDisposer)(source, function () { return _this.source = undefined }),
                    (0, mst_utils_1.onAnyAction)(this.source, this.handleBeforeAction, { attachAfter: false }), // runs before the action
                    (0, mst_utils_1.onAnyAction)(this.source, this.handleAction, { attachAfter: true }), // runs after the action
                ]
            }
            FilteredCases.prototype.destroy = function () {
                this.disposers.forEach(function (disposer) { return disposer() })
            }
            Object.defineProperty(FilteredCases.prototype, "rawCaseIds", {
                get () {
                    let _b, _c, _d, _e
                    let rawCases = this.collectionID
                        ? (_c = (_b = this.source) === null || _b === void 0 ? void 0 : _b.getCasesForCollection(this.collectionID)) !== null && _c !== void 0 ? _c : []
                        : (_e = (_d = this.source) === null || _d === void 0 ? void 0 : _d.items) !== null && _e !== void 0 ? _e : []
                    return rawCases.map(function (aCase) { return aCase.__id__ })
                },
                enumerable: false,
                configurable: true
            })
            Object.defineProperty(FilteredCases.prototype, "caseIds", {
                get () {
                    let _this = this
                    // MobX will cache the resulting array until either the source's `cases` array changes or the
                    // filter function changes, at which point it will run the filter function over all the cases.
                    // We could be more efficient if we handled the caching ourselves, e.g. by only filtering new
                    // cases when cases are inserted, but that would be more code to write/maintain and running
                    // the filter function over an array of cases should be quick so rather than succumb to the
                    // temptation of premature optimization, let's wait to see whether it becomes a bottleneck.
                    return this.rawCaseIds
                        .filter(function (id) { return !_this.filter || (_this.source && _this.filter(_this.source, id, _this.casesArrayNumber)) })
                },
                enumerable: false,
                configurable: true
            })
            Object.defineProperty(FilteredCases.prototype, "caseIdSet", {
                get () {
                    return new Set(this.caseIds)
                },
                enumerable: false,
                configurable: true
            })
            FilteredCases.prototype.setCaseFilter = function (caseFilter) {
                this.filter = caseFilter
            }
            FilteredCases.prototype.setCasesArrayNumber = function (casesArrayNumber) {
                if (this.casesArrayNumber === casesArrayNumber)
                    {return}
                this.casesArrayNumber = casesArrayNumber
            }
            FilteredCases.prototype.setCollectionID = function (collectionID) {
                if (this.collectionID === collectionID)
                    {return}
                this.collectionID = collectionID
                this.invalidateCases()
            }
            FilteredCases.prototype.invalidateCases = function () {
                // invalidate the case caches
                let _caseFilter = this.filter
                this.setCaseFilter()
                this.setCaseFilter(_caseFilter)
            }
            return FilteredCases
        }()),
        (function () {
            let _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0
            _filter_decorators = [mobx_1.observable]
            _get_rawCaseIds_decorators = [mobx_1.computed]
            _get_caseIds_decorators = [mobx_1.computed]
            _get_caseIdSet_decorators = [mobx_1.computed]
            _setCaseFilter_decorators = [mobx_1.action]
            _setCasesArrayNumber_decorators = [mobx_1.action]
            _setCollectionID_decorators = [mobx_1.action]
            _invalidateCases_decorators = [mobx_1.action]
            __esDecorate(_a, null, _get_rawCaseIds_decorators, { kind: "getter", name: "rawCaseIds", static: false, private: false, access: { has (obj) { return "rawCaseIds" in obj }, get (obj) { return obj.rawCaseIds } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(_a, null, _get_caseIds_decorators, { kind: "getter", name: "caseIds", static: false, private: false, access: { has (obj) { return "caseIds" in obj }, get (obj) { return obj.caseIds } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(_a, null, _get_caseIdSet_decorators, { kind: "getter", name: "caseIdSet", static: false, private: false, access: { has (obj) { return "caseIdSet" in obj }, get (obj) { return obj.caseIdSet } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(_a, null, _setCaseFilter_decorators, { kind: "method", name: "setCaseFilter", static: false, private: false, access: { has (obj) { return "setCaseFilter" in obj }, get (obj) { return obj.setCaseFilter } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(_a, null, _setCasesArrayNumber_decorators, { kind: "method", name: "setCasesArrayNumber", static: false, private: false, access: { has (obj) { return "setCasesArrayNumber" in obj }, get (obj) { return obj.setCasesArrayNumber } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(_a, null, _setCollectionID_decorators, { kind: "method", name: "setCollectionID", static: false, private: false, access: { has (obj) { return "setCollectionID" in obj }, get (obj) { return obj.setCollectionID } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(_a, null, _invalidateCases_decorators, { kind: "method", name: "invalidateCases", static: false, private: false, access: { has (obj) { return "invalidateCases" in obj }, get (obj) { return obj.invalidateCases } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(null, null, _filter_decorators, { kind: "field", name: "filter", static: false, private: false, access: { has (obj) { return "filter" in obj }, get (obj) { return obj.filter }, set (obj, value) { obj.filter = value } }, metadata: _metadata }, _filter_initializers, _filter_extraInitializers)
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata })
        })(),
        _a
}()
exports.FilteredCases = FilteredCases
