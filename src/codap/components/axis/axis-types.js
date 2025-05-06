"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.axisPlaceToAxisFn = exports.ScaleTypes = exports.AxisPlaces = exports.axisGap = void 0
exports.otherPlace = otherPlace
exports.isHorizontal = isHorizontal
exports.selectDragRects = selectDragRects
let d3_1 = require("d3")
exports.axisGap = 5
// "rightCat" and "top" can only be categorical axes. "rightNumeric" can only be numeric
exports.AxisPlaces = ["bottom", "left", "rightCat", "top", "rightNumeric"]
function otherPlace(aPlace) {
    return ['bottom', 'top'].includes(aPlace) ? 'left' : 'bottom'
}
exports.ScaleTypes = ["linear", "log", "ordinal", "band"]
let axisPlaceToAxisFn = function (place) {
    return {
        bottom: d3_1.axisBottom,
        left: d3_1.axisLeft,
        rightCat: d3_1.axisRight,
        rightNumeric: d3_1.axisRight,
        top: d3_1.axisTop
    }[place]
}
exports.axisPlaceToAxisFn = axisPlaceToAxisFn
function isHorizontal(place) {
    return ["bottom", "top"].includes(place)
}
// selects all `.dragRect` elements, optionally with additional classes, e.g. `.dragRect.additional.classes`
function selectDragRects(parent, additionalClasses) {
    if (additionalClasses === void 0) { additionalClasses = "" }
    return parent
        ? (0, d3_1.select)(parent).selectAll(".dragRect".concat(additionalClasses))
        : null
}
