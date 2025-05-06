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
exports.UnknownSharedModel = exports.SharedModelUnion = void 0
exports.sharedModelFactory = sharedModelFactory
let mobx_state_tree_1 = require("mobx-state-tree")
let shared_model_1 = require("./shared-model")
let shared_model_registry_1 = require("./shared-model-registry")
function sharedModelFactory(snapshot) {
    let _a
    let sharedModelType = snapshot === null || snapshot === void 0 ? void 0 : snapshot.type
    return sharedModelType && ((_a = (0, shared_model_registry_1.getSharedModelInfoByType)(sharedModelType)) === null || _a === void 0 ? void 0 : _a.modelClass) || exports.UnknownSharedModel
}
exports.SharedModelUnion = mobx_state_tree_1.types.late(function () {
    let sharedModels = (0, shared_model_registry_1.getSharedModelClasses)()
    return mobx_state_tree_1.types.union.apply(mobx_state_tree_1.types, __spreadArray([{ dispatcher: sharedModelFactory }], sharedModels, false))
})
// The UnknownSharedModel has to be defined in this shared-model module because it both
// "extends" SharedModel and UnknownSharedModel is used by the sharedModelFactory function
// above. Because of this it is a kind of circular dependency.
// If UnknownSharedModel is moved to its own module this circular dependency causes an error.
// If they are in the same module then this isn't a problem.
// The UnknownSharedModel is not currently registered like other shared models. It is created
// by the sharedModelFactory when no matching model type is found.
let _UnknownSharedModel = shared_model_1.SharedModel
    .named("UnknownSharedModel")
    .props({
    type: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.literal(shared_model_1.kUnknownSharedModel), shared_model_1.kUnknownSharedModel),
    original: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string)
})
exports.UnknownSharedModel = mobx_state_tree_1.types.snapshotProcessor(_UnknownSharedModel, {
    // Maybe we can type the snapshot better?
    preProcessor (snapshot) {
        let type = snapshot === null || snapshot === void 0 ? void 0 : snapshot.type
        return type && (type !== shared_model_1.kUnknownSharedModel)
            ? {
                type: shared_model_1.kUnknownSharedModel,
                original: JSON.stringify(snapshot)
            }
            : snapshot
    },
    postProcessor (snapshot) {
        return JSON.parse(snapshot.original)
    }
})
