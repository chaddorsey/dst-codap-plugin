"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.hasOwnProperty = hasOwnProperty
exports.castArrayCopy = castArrayCopy
exports.safeDecodeURI = safeDecodeURI
exports.safeJsonParse = safeJsonParse
exports.typedId = typedId
exports.uniqueId = uniqueId
exports.uniqueName = uniqueName
exports.safeDomIdentifier = safeDomIdentifier
exports.isEquivalentArray = isEquivalentArray
exports.isEquivalentSet = isEquivalentSet
exports.hashString = hashString
exports.hashStringSet = hashStringSet
exports.hashStringSets = hashStringSets
exports.hashOrderedStringSet = hashOrderedStringSet
let nanoid_1 = require("nanoid")
// Use custom alphabet to avoid ambiguous characters, especially during mathematical formula evaluations.
// By default, nanoid uses "-" sign, which is used in formulas for subtraction.
let nanoid = (0, nanoid_1.customAlphabet)("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz", 21)
/*
 * hasOwnProperty()
 *
 * Replacement for Object.hasOwn -- returns true if the specified property is present
 * on the specified object, even if its value is `undefined`. See
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn and
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
 * for some of the subtleties here.
 */
function hasOwnProperty(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property)
}
/*
 * castArrayCopy()
 *
 * returns an array for simple items, and a copy of the array for arrays
 */
function castArrayCopy(itemOrArray) {
    return Array.isArray(itemOrArray)
        ? itemOrArray.slice()
        : [itemOrArray]
}
/*
 * safeDecodeURI()
 *
 * returns the original string on error rather than throwing an exception
 */
function safeDecodeURI(uriOrComponent) {
    let decoded
    try {
        decoded = decodeURIComponent(uriOrComponent)
    }
    catch (e) {
        // swallow errors
    }
    return decoded || uriOrComponent
}
/*
 * safeJsonParse()
 *
 * returns undefined on error rather than throwing an exception
 */
function safeJsonParse(json) {
    let parsed
    try {
        parsed = json ? JSON.parse(json) : undefined
    }
    catch (e) {
        // swallow errors
    }
    return parsed
}
/*
 * typedId()
 *
 * returns a unique id string prepended with a supplied prefix
 */
function typedId(type, idLength) {
    if (idLength === void 0) { idLength = 12 }
    // cf. https://zelark.github.io/nano-id-cc/
    return "".concat(type).concat(nanoid(idLength))
}
/*
 * uniqueId()
 *
 * returns a unique id string
 */
function uniqueId(idLength) {
    if (idLength === void 0) { idLength = 16 }
    // cf. https://zelark.github.io/nano-id-cc/
    return nanoid(idLength)
}
/*
 * uniqueName()
 *
 * returns a unique name from a given base name, adding a numeric suffix if necessary
 */
function uniqueName(base, isValid, space) {
    if (space === void 0) { space = "" }
    if (isValid(base))
        {return base}
    let name
    for (let i = 2; !isValid(name = "".concat(base).concat(space).concat(i)); ++i) {
        // nothing to do
    }
    return name
}
/*
 * safeDomIdentifier()
 *
 * returns a value that can safely be used for an HTML ID or class name from a given value
 */
function safeDomIdentifier(value) {
    // Replace spaces and non-alphanumeric characters with dashes
    let sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "-")
    // Ensure value doesn't start with a number
    let validId = sanitizedValue.replace(/^([0-9])/, "_$1")
    return validId
}
/*
 * isEquivalentArray()
 *
 * returns true if the contents of the arrays are identical according to ===
 */
function isEquivalentArray(array1, array2) {
    return array1.length === array2.length &&
        array1.every(function (value, index) { return value === array2[index] })
}
/*
 * isEquivalentSet()
 *
 * returns true if the contents of the sets are identical
 */
function isEquivalentSet(set1, set2) {
    if (set1.size !== set2.size)
        {return false}
    for (let _i = 0, set1_1 = set1; _i < set1_1.length; _i++) {
        let elem = set1_1[_i]
        if (!set2.has(elem))
            {return false}
    }
    return true
}
/*
 * hashString()
 *
 * Returns a 32-bit hash value for a string.
 * Provided by ChatGPT, but apparently originally developed by Daniel J. Bernstein.
 */
function hashString(str) {
    // Simple hash function for a single string (e.g., DJB2)
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        // eslint-disable-next-line no-bitwise
        hash = (hash * 33) ^ str.charCodeAt(i)
    }
    // eslint-disable-next-line no-bitwise
    return hash >>> 0 // Convert to unsigned 32-bit integer
}
/*
 * hashStringSet()
 *
 * returns an order-invariant hash value for a set of strings (e.g. ids).
 * developed with the help of ChatGPT.
 */
function hashStringSet(strings) {
    return strings
        .map(hashString)
        // eslint-disable-next-line no-bitwise
        .reduce(function (acc, hash) { return acc ^ hash }, 0) // XOR all individual hashes
}
/*
 * hashStringSets()
 *
 * returns an order-invariant hash value for a set of string arrays (e.g. ids).
 * developed with the help of ChatGPT.
 */
function hashStringSets(stringSets) {
    return stringSets
        .map(hashStringSet)
        // eslint-disable-next-line no-bitwise
        .reduce(function (acc, hash) { return acc ^ hash }, 0) // XOR all individual hashes
}
/*
 * hashOrderedStringSet()
 *
 * returns an order-dependent hash value for a set of strings (e.g. ids).
 * developed with the help of ChatGPT.
 */
function hashOrderedStringSet(strings) {
    return strings
        .map(function (str, index) { return hashString(str) * (index + 1) }) // Multiply hash by index + 1 to reflect position
        .reduce(function (acc, hash) { return acc + hash }, 0) // sum all individual hashes
}
