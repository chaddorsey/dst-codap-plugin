"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.attributeTypes = exports.isProduction = exports.isDevelopment = exports.kDefaultNumFormatStr = exports.kDefaultNumPrecision = void 0
exports.importValueToString = importValueToString
exports.isAttributeType = isAttributeType
let date_iso_utils_1 = require("../../utilities/date-iso-utils")
exports.kDefaultNumPrecision = 2
exports.kDefaultNumFormatStr = ".".concat(exports.kDefaultNumPrecision, "~f")
let isDevelopment = function () { return process.env.NODE_ENV !== "production" }
exports.isDevelopment = isDevelopment
let isProduction = function () { return process.env.NODE_ENV === "production" }
exports.isProduction = isProduction
function importValueToString(value) {
    if (value == null) {
        return ""
    }
    if (typeof value === "string") {
        return value.trim()
    }
    if (value instanceof Date) {
        return (0, date_iso_utils_1.formatStdISODateString)(value)
    }
    if (typeof value === "object") {
        return JSON.stringify(value)
    }
    return value.toString()
}
exports.attributeTypes = [
    "categorical", "numeric", "date", "qualitative", "boundary", "checkbox", "color"
]
function isAttributeType(type) {
    return type != null && exports.attributeTypes.includes(type)
}
