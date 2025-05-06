"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getTileEnvironment = getTileEnvironment
exports.getSharedModelManager = getSharedModelManager
exports.getFormulaManager = getFormulaManager
let mobx_state_tree_1 = require("mobx-state-tree")
function getTileEnvironment(node) {
    return node && (0, mobx_state_tree_1.hasEnv)(node) ? (0, mobx_state_tree_1.getEnv)(node) : undefined
}
function getSharedModelManager(node) {
    let _a
    return (_a = getTileEnvironment(node)) === null || _a === void 0 ? void 0 : _a.sharedModelManager
}
function getFormulaManager(node) {
    let _a
    return (_a = getTileEnvironment(node)) === null || _a === void 0 ? void 0 : _a.formulaManager
}
