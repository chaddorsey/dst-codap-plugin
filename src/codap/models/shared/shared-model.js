"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.SharedModel = exports.kUnknownSharedModel = void 0
let mobx_state_tree_1 = require("mobx-state-tree")
let js_utils_1 = require("../../utilities/js-utils")
exports.kUnknownSharedModel = "unknownSharedModel"
// Generic "super class" of all shared models
exports.SharedModel = mobx_state_tree_1.types.model("SharedModel", {
    // The type field has to be optional because the typescript type created from the sub models
    // is an intersection ('&') of this SharedModel and the sub model.  If this was just:
    //   type: types.string
    // then typescript has errors because the intersection logic means the type field is
    // required when creating a shared model. And we don't want to require the
    // type when creating the shared model. This might be solvable by using the
    // mst snapshot preprocessor to add the type.
    //
    // It could be changed to
    //   type: types.maybe(types.string)
    // Because of the intersection it would still mean the sub models would do the right thing,
    // but if someone looks at this definition of SharedModel, it implies the wrong thing.
    // It might also cause problems when code is working with a generic of SharedModel
    // that code couldn't assume that `model.type` is defined.
    //
    // Since this is optional, it needs a default value, and Unknown seems like the
    // best option for this.
    //
    // Perhaps there is some better way to define this so that there would be an error
    // if a sub type does not override it.
    type: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.string, exports.kUnknownSharedModel),
    // if not provided, will be generated
    id: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.identifier, function () { return (0, js_utils_1.typedId)("SHAR") }),
})
    .volatile(function (self) { return ({
    indexOfType: -1
}) })
    .actions(function (self) { return ({
    setIndexOfType (index) {
        self.indexOfType = index
    }
}) })
