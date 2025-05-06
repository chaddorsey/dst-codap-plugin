"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.isV2SetAsideItem = exports.v3TypeFromV2TypeIndex = void 0
exports.v3TypeFromV2TypeString = v3TypeFromV2TypeString
exports.v3TypeFromV2TypeIndex = [
    // indices are numeric values of v2 types
    undefined, "numeric", "categorical", "date", "boundary", "color"
    // v2 type eNone === 0 which v3 codes as undefined
]
function v3TypeFromV2TypeString(v2Type) {
    if (v2Type == null || v2Type === "none")
        {return undefined}
    if (v2Type === "nominal")
        {return "categorical"}
    return v2Type
}
let isV2SetAsideItem = function (item) {
    return !!(item && typeof item === "object" && "id" in item && "values" in item)
}
exports.isV2SetAsideItem = isV2SetAsideItem
