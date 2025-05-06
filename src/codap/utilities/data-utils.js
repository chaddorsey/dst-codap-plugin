"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.kTypeUnknown = exports.kTypeDate = exports.kTypeNumber = exports.kTypeBoolean = exports.kTypeString = exports.kTypeNull = exports.kTypeNaN = exports.kTypeError = exports.numericSortComparator = exports.valueToString = void 0
exports.typeCode = typeCode
exports.sortableValue = sortableValue
exports.compareValues = compareValues
let date_parser_1 = require("./date-parser")
let date_utils_1 = require("./date-utils")
let valueToString = function (iValue) {
    let valType = typeof iValue, value = iValue
    if ((0, date_utils_1.isDate)(iValue)) {
        // treat dates as strings
        // todo: value = formatDate(iValue)
        value = String(iValue)
        valType = "string"
    }
    else if (iValue instanceof Error) {
        value = "".concat(iValue.name, " ").concat(iValue.message)
        valType = "string"
    } /* todo: handle map
    else if (iValue instanceof SimpleMap) {
      // map has its own toString() function
      valType = "map"
    }*/
    switch (valType) {
        case "string":
            return value
        case "number":
        case "boolean":
        case "map":
            return String(iValue)
    }
    return ""
}
exports.valueToString = valueToString
let numericSortComparator = function (_a) {
    let a = _a.a, b = _a.b, order = _a.order
    let aIsNaN = isNaN(a)
    let bIsNaN = isNaN(b)
    if (aIsNaN && bIsNaN)
        {return 0}
    if (bIsNaN)
        {return order === "asc" ? 1 : -1}
    if (aIsNaN)
        {return order === "asc" ? -1 : 1}
    return order === "asc" ? a - b : b - a
}
exports.numericSortComparator = numericSortComparator
exports.kTypeError = 1, exports.kTypeNaN = 2, exports.kTypeNull = 3, exports.kTypeString = 4, exports.kTypeBoolean = 5, exports.kTypeNumber = 6, exports.kTypeDate = 7, 
// kTypeSimpleMap = 8, // e.g. boundaries
exports.kTypeUnknown = 9
function typeCode(value) {
    if (value == null)
        {return exports.kTypeNull}
    if (value instanceof Error)
        {return exports.kTypeError}
    if ((0, date_utils_1.isDate)(value) || (0, date_parser_1.isDateString)(value))
        {return exports.kTypeDate}
    // if (value instanceof DG.SimpleMap) return kTypeSimpleMap;
    switch (typeof value) {
        case 'number': return isNaN(value) ? exports.kTypeNaN : exports.kTypeNumber
        case 'boolean': return exports.kTypeBoolean
        case 'string': return exports.kTypeString
        /* istanbul ignore next */
        default: return exports.kTypeUnknown
    }
}
function sortableValue(value) {
    let type = typeCode(value)
    let num = type === exports.kTypeNumber ? value : NaN
    // strings convertible to numbers are treated numerically
    if (type === exports.kTypeString && value.length) {
        num = Number(value)
        if (!isNaN(num))
            {return { type: exports.kTypeNumber, value: num }}
    }
    // booleans are treated as strings
    else if (type === exports.kTypeBoolean) {
        return { type: exports.kTypeString, value }
    }
    // dates are treated numerically
    else if (type === exports.kTypeDate) {
        let date = (0, date_utils_1.isDate)(value) ? value : (0, date_parser_1.parseDate)(value)
        if (!date)
            {return { type: exports.kTypeNull, value: null }}
        return { type: exports.kTypeNumber, value: date.getTime() / 1000 }
    }
    // other values are treated according to their type
    return { type, value }
}
// Ascending comparator; negate the result for descending
function compareValues(value1, value2, strCompare) {
    let v1 = sortableValue(value1)
    let v2 = sortableValue(value2)
    // if types differ, then sort by type
    if (v1.type !== v2.type)
        {return v1.type - v2.type}
    // if types are the same, then sort by value
    switch (v1.type) {
        case exports.kTypeNumber: return v1.value - v2.value
        case exports.kTypeString:
        case exports.kTypeError: return strCompare(String(v1.value), String(v2.value))
        default: return 0 // other types are not ordered within type
    }
}
