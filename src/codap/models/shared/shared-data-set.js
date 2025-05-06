"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.SharedDataSet = exports.kSharedDataSetType = void 0
exports.isSharedDataSet = isSharedDataSet
let mobx_state_tree_1 = require("mobx-state-tree")
let data_set_1 = require("../data/data-set")
let shared_model_1 = require("./shared-model")
exports.kSharedDataSetType = "SharedDataSet"
exports.SharedDataSet = shared_model_1.SharedModel
    .named("SharedDataSet")
    .props({
    type: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.literal(exports.kSharedDataSetType), exports.kSharedDataSetType),
    providerId: "",
    dataSet: mobx_state_tree_1.types.optional(data_set_1.DataSet, function () { return data_set_1.DataSet.create() })
})
    .actions(function (self) { return ({
    setDataSet (data) {
        self.dataSet = data
    }
}) })
function isSharedDataSet(model) {
    return model ? (0, mobx_state_tree_1.getType)(model) === exports.SharedDataSet : false
}
