"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.t = void 0
exports.translate = translate
let languages_1 = require("./languages")
let locale_1 = require("./locale")
// supports named variables (e.g. %{foo}) and SproutCore numbered variables (e.g. %@1)
let varRegExp = /%({\s*([^}\s]*)\s*}|@(\d*))/g
function translate(key, options) {
    let _a, _b
    let lang = (options === null || options === void 0 ? void 0 : options.lang) || locale_1.gLocale.current
    let namedVars = Array.isArray(options === null || options === void 0 ? void 0 : options.vars) ? {} : (options === null || options === void 0 ? void 0 : options.vars) || {}
    let posVars = Array.isArray(options === null || options === void 0 ? void 0 : options.vars) ? (options === null || options === void 0 ? void 0 : options.vars) || [] : []
    // default to English if we don't have a translated string
    // default to the key if we don't have an English string
    let translation = ((_a = languages_1.translations[lang]) === null || _a === void 0 ? void 0 : _a[key]) || ((_b = languages_1.translations.en) === null || _b === void 0 ? void 0 : _b[key]) || key
    // match: full match (e.g. "%{foo}", "%@", "%@1")
    // param: full match without % (e.g. "{foo}", "@", "@1")
    // varName: name in case of named variables (e.g. "foo", null, null)
    // varPos: position in case of positional variables (e.g. null, null, "1")
    let matchIndex = -1
    function replaceFn(match, param, varName, varPos) {
        let valueStr = function (value) { return value == null ? "" : "".concat(value) }
        ++matchIndex
        if (varName) {
            !Object.prototype.hasOwnProperty.call(namedVars, varName) &&
                console.warn("translate: no replacement for \"".concat(varName, "\" in \"").concat(key, "\""))
            return valueStr(namedVars[varName])
        }
        if (varPos) {
            let varIndex = +varPos - 1;
            (varIndex >= posVars.length) &&
                console.warn("translate: no replacement for \"".concat(varPos, "\" in \"").concat(key, "\""))
            return valueStr(posVars[varIndex])
        }
        if (param === "@") {
            (matchIndex >= posVars.length) &&
                console.warn("translate: no replacement for \"@\" at index ".concat(matchIndex + 1, " in \"").concat(key, "\""))
            return valueStr(posVars[matchIndex])
        }
        // should only get here for pathological cases (e.g. "%{}")
        console.warn("translate: no replacement for variable match \"".concat(match, "\" in \"").concat(key, "\""))
        return ""
    }
    return translation.replace(varRegExp, replaceFn)
}
exports.t = translate
