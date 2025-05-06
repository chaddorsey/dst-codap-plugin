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
let __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) {for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i)
            ar[i] = from[i]
        }
    }}
    return to.concat(ar || Array.prototype.slice.call(from))
}
Object.defineProperty(exports, "__esModule", { value: true })
exports.gLocale = exports.Locale = void 0
exports.getDefaultLanguage = getDefaultLanguage
let mobx_1 = require("mobx")
let url_params_1 = require("../url-params")
let languages_1 = require("./languages")
let urlLanguage = url_params_1.urlParams.lang || url_params_1.urlParams["lang-override"] || ""
let candidates = __spreadArray([urlLanguage], window.navigator.languages, true)
let defaultLang = "en-US"
for (let _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
    let lang = candidates_1[_i]
    if (lang && languages_1.translations[lang]) {
        defaultLang = lang
        break
    }
    if (lang && languages_1.translations[(0, languages_1.getBaseLanguage)(lang)]) {
        defaultLang = (0, languages_1.getBaseLanguage)(lang)
        break
    }
}
function getDefaultLanguage() {
    return defaultLang
}
let Locale = function () {
    let _a
    let _instanceExtraInitializers = []
    let _current_decorators
    let _current_initializers = []
    let _current_extraInitializers = []
    let _get_currentBaseLanguage_decorators
    let _setCurrent_decorators
    return _a = /** @class */ (function () {
            function Locale() {
                let _this = this
                this.current = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _current_initializers, void 0))
                this.collator = __runInitializers(this, _current_extraInitializers)
                this.dateTimeFormats = new Map()
                this.numberFormats = new Map()
                this.compareStrings = function (str1, str2) {
                    let _b, _c
                    return (_c = (_b = _this.collator) === null || _b === void 0 ? void 0 : _b.compare(str1, str2)) !== null && _c !== void 0 ? _c : 0
                }
                this.formatDate = function (date, options) {
                    if (options === void 0) { options = {} }
                    let optionsStr = JSON.stringify(options)
                    let formatter = _this.dateTimeFormats.get(optionsStr)
                    if (!formatter) {
                        formatter = new Intl.DateTimeFormat(_this.current, options)
                        _this.dateTimeFormats.set(optionsStr, formatter)
                    }
                    return formatter === null || formatter === void 0 ? void 0 : formatter.format(date)
                }
                this.formatNumber = function (value, options) {
                    if (options === void 0) { options = {} }
                    let optionsStr = JSON.stringify(options)
                    let formatter = _this.numberFormats.get(optionsStr)
                    if (!formatter) {
                        formatter = new Intl.NumberFormat(_this.current, options)
                        _this.numberFormats.set(optionsStr, formatter)
                    }
                    return formatter === null || formatter === void 0 ? void 0 : formatter.format(value)
                }
                this.current = getDefaultLanguage()
                this.setCurrent(this.current);
                (0, mobx_1.makeObservable)(this)
            }
            Object.defineProperty(Locale.prototype, "currentBaseLanguage", {
                get () {
                    return (0, languages_1.getBaseLanguage)(this.current)
                },
                enumerable: false,
                configurable: true
            })
            Locale.prototype.setCurrent = function (_current) {
                this.collator = new Intl.Collator(_current, { sensitivity: "base" })
                this.dateTimeFormats.clear()
                this.numberFormats.clear()
                this.current = _current
            }
            return Locale
        }()),
        (function () {
            let _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0
            _current_decorators = [mobx_1.observable]
            _get_currentBaseLanguage_decorators = [mobx_1.computed]
            _setCurrent_decorators = [mobx_1.action]
            __esDecorate(_a, null, _get_currentBaseLanguage_decorators, { kind: "getter", name: "currentBaseLanguage", static: false, private: false, access: { has (obj) { return "currentBaseLanguage" in obj }, get (obj) { return obj.currentBaseLanguage } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(_a, null, _setCurrent_decorators, { kind: "method", name: "setCurrent", static: false, private: false, access: { has (obj) { return "setCurrent" in obj }, get (obj) { return obj.setCurrent } }, metadata: _metadata }, null, _instanceExtraInitializers)
            __esDecorate(null, null, _current_decorators, { kind: "field", name: "current", static: false, private: false, access: { has (obj) { return "current" in obj }, get (obj) { return obj.current }, set (obj, value) { obj.current = value } }, metadata: _metadata }, _current_initializers, _current_extraInitializers)
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata })
        })(),
        _a
}()
exports.Locale = Locale
exports.gLocale = new Locale()
