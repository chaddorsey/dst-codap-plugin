"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.toV3TileId = exports.toV3ItemId = exports.toV3GlobalId = exports.toV3DataSetId = exports.toV3CollectionId = exports.toV3CaseId = exports.toV3AttrId = exports.kTileIdPrefix = exports.kItemIdPrefix = exports.kGlobalIdPrefix = exports.kDataSetIdPrefix = exports.kCollectionIdPrefix = exports.kCaseIdPrefix = exports.kAttrIdPrefix = void 0
exports.v3Id = v3Id
exports.toV3Id = toV3Id
exports.toV2Id = toV2Id
exports.maybeToV2Id = maybeToV2Id
exports.typeV3Id = typeV3Id
let mobx_state_tree_1 = require("mobx-state-tree")
/**
 * Generates a CODAP v2-compatible numeric id as a string.
 *
 * @returns the generated id
 */
function v3Id(prefix) {
    // The maximum representable integer in JavaScript is ~9e15.
    // We lower the ceiling a bit and raise the floor to avoid conflicting with
    // generated SproutCore ids which auto-increment from 1.
    let kFactor = 1e15
    let kOffset = 1e10
    return "".concat(prefix).concat(Math.floor(kFactor * Math.random()) + kOffset)
}
function toV3Id(prefix, v2Id) {
    // If it's a non-numeric string, just return it
    if (typeof v2Id === "string" && !isFinite(+v2Id))
        {return v2Id}
    return "".concat(prefix).concat(v2Id)
}
exports.kAttrIdPrefix = "ATTR"
exports.kCaseIdPrefix = "CASE"
exports.kCollectionIdPrefix = "COLL"
exports.kDataSetIdPrefix = "DATA"
exports.kGlobalIdPrefix = "GLOB"
exports.kItemIdPrefix = "ITEM"
exports.kTileIdPrefix = "TILE"
let toV3AttrId = function (v2Id) { return toV3Id(exports.kAttrIdPrefix, v2Id) }
exports.toV3AttrId = toV3AttrId
let toV3CaseId = function (v2Id) { return toV3Id(exports.kCaseIdPrefix, v2Id) }
exports.toV3CaseId = toV3CaseId
let toV3CollectionId = function (v2Id) { return toV3Id(exports.kCollectionIdPrefix, v2Id) }
exports.toV3CollectionId = toV3CollectionId
let toV3DataSetId = function (v2Id) { return toV3Id(exports.kDataSetIdPrefix, v2Id) }
exports.toV3DataSetId = toV3DataSetId
let toV3GlobalId = function (v2Id) { return toV3Id(exports.kGlobalIdPrefix, v2Id) }
exports.toV3GlobalId = toV3GlobalId
let toV3ItemId = function (v2Id) { return toV3Id(exports.kItemIdPrefix, v2Id) }
exports.toV3ItemId = toV3ItemId
let toV3TileId = function (v2Id) { return toV3Id(exports.kTileIdPrefix, v2Id) }
exports.toV3TileId = toV3TileId
function toV2Id(_v3Id) {
    let _a
    // strip any prefix and return the numeric value of the rest
    let result = /[A-Za-z]*(\d+)/.exec(_v3Id)
    return +((_a = result === null || result === void 0 ? void 0 : result[1]) !== null && _a !== void 0 ? _a : NaN)
}
function maybeToV2Id(_v3Id) {
    if (!_v3Id)
        {return}
    return toV2Id(_v3Id)
}
/**
 * This creates the definition for an identifier field in MST, which generates
 * a CODAP v2-compatible numeric id as a string if an id is not provided.
 *
 * @returns the generated id
 */
function typeV3Id(prefix) {
    return mobx_state_tree_1.types.optional(mobx_state_tree_1.types.identifier, function () { return v3Id(prefix) })
}
