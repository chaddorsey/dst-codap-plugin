"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.TileContentModel = void 0
let mobx_state_tree_1 = require("mobx-state-tree")
let apply_model_change_1 = require("../history/apply-model-change")
let tile_environment_1 = require("./tile-environment")
let tile_model_hooks_1 = require("./tile-model-hooks")
let unknown_types_1 = require("./unknown-types")
// Generic "super class" of all tile content models
exports.TileContentModel = mobx_state_tree_1.types.model("TileContentModel", {
    // The type field has to be optional because the typescript type created from the sub models
    // is an intersection ('&') of this TileContentModel and the sub model.  If this was just:
    //   type: types.string
    // then typescript has errors because the intersection logic means the type field is
    // required when creating a content model. And in many cases these tile content models
    // are created without passing a type.
    //
    // It could be changed to
    //   type: types.maybe(types.string)
    // Because of the intersection it would still mean the sub models would do the right thing,
    // but if someone looks at this definition of TileContentModel, it implies the wrong thing.
    // It might also cause problems when code is working with a generic of TileContentModel
    // that code couldn't assume that `model.type` is defined.
    //
    // Since this is optional, it needs a default value, and Unknown seems like the
    // best option for this.
    // I verified that a specific tile content model could not be constructed with:
    //   ImageContentModel.create({ type: "Unknown" }).
    // That line causes a typescript error.
    // I think it is because the image content type is more specific with its use of
    // types.literal so that overrides this less specific use of types.string
    //
    // Perhaps there is some better way to define this so that there would be an error
    // if a sub type does not override it.
    type: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.string, unknown_types_1.kUnknownTileType),
})
    .views(function (self) { return ({
    get tileEnv() {
        return (0, tile_environment_1.getTileEnvironment)(self)
    },
    // Override in specific tile content model when external data (like from SharedModels) is needed when copying
    get tileSnapshotForCopy() {
        return (0, mobx_state_tree_1.getSnapshot)(self)
    },
    // Override in specific tile content model.
    // When false, the tile will not be moved in front of other tiles on focus.
    get allowBringToFront() {
        return true
    }
}) })
    .actions(function (self) { return ({
    prepareSnapshot () {
        // Override in derived models as appropriate
        return Promise.resolve()
    },
    completeSnapshot () {
        // Override in derived models as appropriate
    },
    /**
     * This will be called automatically by the tree monitor.
     * Currently the call tree looks like:
     * TreeMonitor.recordAction
     * └ Tree.handleSharedModelChanges
     *   └ Tree.updateTreeAfterSharedModelChangesInternal
     *     └ Tree.updateTreeAfterSharedModelChanges
     *       └ tile.content.updateAfterSharedModelChanges
     *
     * It is also called after the manager has finished applying patches
     * during an undo or replying history.
     *
     * @param sharedModel
     */
    updateAfterSharedModelChanges (sharedModel, type) {
        console.warn("updateAfterSharedModelChanges not implemented for:", self.type)
    },
    broadcastMessage (message, callback) {
        // Override in derived models as appropriate
    }
}) })
    // Add an empty api so the api methods can be used on this generic type
    .actions(function (self) { return (0, tile_model_hooks_1.tileModelHooks)({}) })
    .actions(apply_model_change_1.applyModelChange)
