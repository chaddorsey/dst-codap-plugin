"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.applyModelChange = applyModelChange
let history_service_1 = require("./history-service")
// returns an object which defines the `applyModelChange` method on an MST model
// designed to be passed to `.actions()`, i.e. `.actions(applyModelChange)`
function applyModelChange(self) {
    return ({
        // performs the specified action so that response actions are included and undo/redo strings assigned
        applyModelChange (actionFn, options) {
            let result = actionFn();
            (0, history_service_1.getHistoryService)(self).handleApplyModelChange(options)
            return result
        }
    })
}
