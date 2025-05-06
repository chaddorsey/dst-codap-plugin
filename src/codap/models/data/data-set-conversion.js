"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.LegacyCaseID = void 0
exports.isOriginalDataSetSnap = isOriginalDataSetSnap
exports.isTempDataSetSnap = isTempDataSetSnap
exports.isPreItemDataSetSnap = isPreItemDataSetSnap
exports.isInitialItemsDataSetSnap = isInitialItemsDataSetSnap
exports.isHiddenItemIdsDataSetSnap = isHiddenItemIdsDataSetSnap
exports.isLegacyDataSetSnap = isLegacyDataSetSnap
exports.createDataSet = createDataSet
let mobx_state_tree_1 = require("mobx-state-tree")
let codap_utils_1 = require("../../utilities/codap-utils")
// eslint-disable-next-line import/no-cycle
let data_set_1 = require("./data-set")
exports.LegacyCaseID = mobx_state_tree_1.types.model("CaseID", {
    __id__: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.string, function () { return (0, codap_utils_1.v3Id)(codap_utils_1.kItemIdPrefix) })
})
function isOriginalDataSetSnap(snap) {
    return (!("attributesMap" in snap) && "attributes" in snap &&
        Array.isArray(snap.attributes) && (typeof snap.attributes[0] === "object"))
}
function isTempDataSetSnap(snap) {
    return ("attributesMap" in snap && "attributes" in snap &&
        Array.isArray(snap.attributes) && (typeof snap.attributes[0] === "string"))
}
function isPreItemDataSetSnap(snap) {
    return !("attributes" in snap) && !("ungrouped" in snap) && ("cases" in snap)
}
function isInitialItemsDataSetSnap(snap) {
    return !("attributes" in snap) && !("ungrouped" in snap) && !("cases" in snap) && ("itemIds" in snap)
}
function isHiddenItemIdsDataSetSnap(snap) {
    return "hiddenItemIds" in snap
}
function isLegacyDataSetSnap(snap) {
    return isOriginalDataSetSnap(snap) || isTempDataSetSnap(snap) || isPreItemDataSetSnap(snap) ||
        isInitialItemsDataSetSnap(snap) || isHiddenItemIdsDataSetSnap(snap)
}
function createDataSet(snap, env) {
    // preProcessSnapshot handler will perform the necessary conversion internally
    return data_set_1.DataSet.create(snap, env)
}
