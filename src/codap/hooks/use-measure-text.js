"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.useMeasureText = exports.measureText = exports.measureTextExtent = void 0
let react_1 = require("react")
let constants_1 = require("../components/constants")
let canvas = document.createElement("canvas")
let cache = {}
let measureTextExtent = function (text, font) {
    let _a
    if (font === void 0) { font = constants_1.defaultFont }
    let context = canvas.getContext("2d")
    context && font && (context.font = font)
    let metrics = (_a = context === null || context === void 0 ? void 0 : context.measureText(text)) !== null && _a !== void 0 ? _a : { width: 0, fontBoundingBoxAscent: 0, fontBoundingBoxDescent: 0 }
    return { width: metrics.width, height: metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent }
}
exports.measureTextExtent = measureTextExtent
let measureText = function (text, font) {
    if (font === void 0) { font = constants_1.defaultFont }
    cache[font] = cache[font] || {}
    cache[font][text] = cache[font][text] || Math.ceil(10 * (0, exports.measureTextExtent)(text, font).width) / 10
    return cache[font][text]
}
exports.measureText = measureText
let useMeasureText = function (font) {
    if (font === void 0) { font = constants_1.defaultFont }
    return (0, react_1.useCallback)(function (text) {
        return (0, exports.measureText)(text, font)
    }, [font])
}
exports.useMeasureText = useMeasureText
