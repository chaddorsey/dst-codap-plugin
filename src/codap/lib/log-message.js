"use strict"
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i]
            for (let p in s) {if (Object.prototype.hasOwnProperty.call(s, p))
                {t[p] = s[p]}}
        }
        return t
    }
    return __assign.apply(this, arguments)
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
exports.logMessageWithReplacement = logMessageWithReplacement
exports.stringify = stringify
exports.logStringifiedObjectMessage = logStringifiedObjectMessage
exports.logModelChangeFn = logModelChangeFn
let translate_1 = require("../utilities/translation/translate")
// e.g. logMessageWithReplacement("Moved category %@ into position of %@", { movedCat: string, targetCat: string })
function logMessageWithReplacement(message, args, category) {
    return { message: (0, translate_1.t)(message, { vars: Object.values(args) }), args, category }
}
function stringify(obj) {
    let values = Object.entries(obj).map(function (_a) {
        let key = _a[0], value = _a[1]
        return "".concat(key, ": ").concat(value)
    }).join(", ")
    return "{ ".concat(values, " }")
}
// e.g. logStringifiedObjectMessage("dragEnd: %@", { lower: number, upper: number })
function logStringifiedObjectMessage(message, args, category) {
    return { message: (0, translate_1.t)(message, { vars: [stringify(args)] }), args, category }
}
function logModelChangeFn(message, modelStateFn, options, category) {
    let _a = options || {}, initialArg = _a.initialArg, _b = _a.initialKeyFn, initialKeyFn = _b === void 0 ? (function (key) { return "".concat(key, "Initial") }) : _b
    // capture the relevant initial state of the model
    let initial = modelStateFn(initialArg)
    return function (finalArg) {
        // capture the relevant final state of the model
        let final = modelStateFn(finalArg)
        // combine initial and final values as replacement string values
        let vars = __spreadArray(__spreadArray([], Object.values(initial), true), Object.values(final), true)
        // append `Initial` to property names of initial values
        let argsInitial = Object.fromEntries(Object.entries(initial).map(function (_a) {
            let key = _a[0], value = _a[1]
            return [initialKeyFn(key), value]
        }))
        // final logged object contains initial and final values
        let args = {...argsInitial, ...final}
        return { message: (0, translate_1.t)(message, { vars }), args, category }
    }
}
