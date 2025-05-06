"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getSharedDataSets = getSharedDataSets
exports.getDataSetByNameOrId = getDataSetByNameOrId
exports.getSharedDataSetFromDataSetId = getSharedDataSetFromDataSetId
exports.getDataSetFromId = getDataSetFromId
exports.getSharedCaseMetadataFromDataset = getSharedCaseMetadataFromDataset
exports.getTileSharedModels = getTileSharedModels
exports.getTileDataSet = getTileDataSet
exports.getAllTileDataSets = getAllTileDataSets
exports.getTileCaseMetadata = getTileCaseMetadata
exports.getAllTileCaseMetadata = getAllTileCaseMetadata
let codap_utils_1 = require("../../utilities/codap-utils")
let tile_environment_1 = require("../tiles/tile-environment")
let shared_case_metadata_1 = require("./shared-case-metadata")
let shared_data_set_1 = require("./shared-data-set")
function getSharedDataSets(node) {
    let _a
    let sharedModelManager = (0, tile_environment_1.getSharedModelManager)(node)
    return (_a = sharedModelManager === null || sharedModelManager === void 0 ? void 0 : sharedModelManager.getSharedModelsByType(shared_data_set_1.kSharedDataSetType)) !== null && _a !== void 0 ? _a : []
}
function getDataSetByNameOrId(node, nameOrId) {
    let _a
    return (_a = getSharedDataSets(node).find(function (_a) {
        let dataSet = _a.dataSet
        return dataSet.id === nameOrId || dataSet.name === nameOrId || "".concat((0, codap_utils_1.toV2Id)(dataSet.id)) === nameOrId
    })) === null || _a === void 0 ? void 0 : _a.dataSet
}
function getSharedDataSetFromDataSetId(node, id) {
    let sharedDataSets = getSharedDataSets(node)
    return sharedDataSets.find(function (model) { return model.dataSet.id === id })
}
function getDataSetFromId(node, id) {
    let sharedDataSets = getSharedDataSets(node)
    let sharedDataSet = sharedDataSets.find(function (model) { return model.dataSet.id === id })
    return sharedDataSet === null || sharedDataSet === void 0 ? void 0 : sharedDataSet.dataSet
}
function getSharedCaseMetadataFromDataset(dataset) {
    let sharedModelManager = (0, tile_environment_1.getSharedModelManager)(dataset)
    let sharedCaseMetadata = sharedModelManager === null || sharedModelManager === void 0 ? void 0 : sharedModelManager.getSharedModelsByType(shared_case_metadata_1.kSharedCaseMetadataType).find(function (model) { let _a; return ((_a = model.data) === null || _a === void 0 ? void 0 : _a.id) === dataset.id })
    return sharedCaseMetadata
}
function getTileSharedModels(tile) {
    let _a
    let sharedModelManager = (0, tile_environment_1.getSharedModelManager)(tile)
    return (_a = sharedModelManager === null || sharedModelManager === void 0 ? void 0 : sharedModelManager.getTileSharedModels(tile)) !== null && _a !== void 0 ? _a : []
}
function getTileDataSet(tile) {
    let sharedDataSet = getTileSharedModels(tile).find(function (m) { return (0, shared_data_set_1.isSharedDataSet)(m) })
    return (0, shared_data_set_1.isSharedDataSet)(sharedDataSet) ? sharedDataSet.dataSet : undefined
}
function getAllTileDataSets(tile) {
    return getTileSharedModels(tile).filter(function (m) { return (0, shared_data_set_1.isSharedDataSet)(m) })
}
function getTileCaseMetadata(tile) {
    let sharedCaseMetadata = getTileSharedModels(tile).find(function (m) { return (0, shared_case_metadata_1.isSharedCaseMetadata)(m) })
    return (0, shared_case_metadata_1.isSharedCaseMetadata)(sharedCaseMetadata) ? sharedCaseMetadata : undefined
}
function getAllTileCaseMetadata(tile) {
    return getTileSharedModels(tile).filter(function (m) { return (0, shared_case_metadata_1.isSharedCaseMetadata)(m) })
}
