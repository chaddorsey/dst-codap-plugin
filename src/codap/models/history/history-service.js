"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getHistoryServiceMaybe = getHistoryServiceMaybe
exports.getHistoryService = getHistoryService
let mobx_state_tree_1 = require("mobx-state-tree")
function getHistoryServiceMaybe(node) {
    let env = node && (0, mobx_state_tree_1.hasEnv)(node) ? (0, mobx_state_tree_1.getEnv)(node) : undefined
    return env === null || env === void 0 ? void 0 : env.historyService
}
function getHistoryService(node) {
    let historyService = getHistoryServiceMaybe(node)
    if (!historyService) {
        throw new Error("History Service not found in MST environment")
    }
    return historyService
}
