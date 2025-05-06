"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.withoutUndo = withoutUndo
let mobx_state_tree_1 = require("mobx-state-tree")
let history_service_1 = require("./history-service")
let debug_1 = require("../../lib/debug")
function withoutUndo(options) {
    let actionCall = (0, mobx_state_tree_1.getRunningActionContext)()
    if (!actionCall) {
        throw new Error("withoutUndo called outside of an MST action")
    }
    let context = actionCall.context
    // The history service might be unset because:
    // withoutUndo is used in MST models which are created directly.
    //
    // The steps that happen are:
    // 1. the model is created directly
    // 2. a withoutUndo action is called on this model
    // 3. the model is then added to the document
    // On step 2 the historyService is undefined.
    //
    // MST does not allow the environment of a model to change when it is added
    // to a new tree. So the environment used in step 1 either has to be
    // undefined or the same as the document. Using the same environment in
    // two trees seems error prone.
    // An example of this is the `DataBroker.addDataSet` action
    let historyService = (0, history_service_1.getHistoryServiceMaybe)(context)
    if (debug_1.DEBUG_UNDO && !historyService) {
        let root = (0, mobx_state_tree_1.getRoot)(context)
        // Use duck typing to figure out if the root is a tree
        if (root.treeMonitor) {
            console.warn("history service has not been added to the MST tree")
        }
    }
    historyService === null || historyService === void 0 ? void 0 : historyService.withoutUndo(actionCall, options)
}
