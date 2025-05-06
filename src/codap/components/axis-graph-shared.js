"use strict"
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
exports.GraphPlaces = void 0
exports.isVertical = isVertical
let axis_types_1 = require("./axis/axis-types")
exports.GraphPlaces = __spreadArray(__spreadArray([], axis_types_1.AxisPlaces, true), ["yPlus", "plot", "legend"], false)
function isVertical(place) {
    return ["left", "rightCat", "rightNumeric", "yPlus"].includes(place)
}
