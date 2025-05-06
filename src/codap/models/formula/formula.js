"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.Formula = void 0
let mobx_state_tree_1 = require("mobx-state-tree")
let js_utils_1 = require("../../utilities/js-utils")
let tile_environment_1 = require("../tiles/tile-environment")
exports.Formula = mobx_state_tree_1.types.model("Formula", {
    id: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.identifier, function () { return (0, js_utils_1.typedId)("FORM") }),
    display: ""
})
    .volatile(function (self) { return ({
    canonical: ""
}) })
    .views(function (self) { return ({
    get formulaManager() {
        let manager = (0, tile_environment_1.getFormulaManager)(self)
        if (!manager) {
            throw new Error("Using the Formula model requires a FormulaManger")
        }
        return manager
    },
    get empty() {
        return self.display.length === 0
    },
}) })
    .views(function (self) { return ({
    get syntaxError() {
        return self.formulaManager.getSyntaxError(self.display)
    },
    get valid() {
        return !self.empty && !this.syntaxError
    },
    get isRandomFunctionPresent() {
        return self.formulaManager.isRandomFunctionPresent(self.canonical)
    },
}) })
    .actions(function (self) { return ({
    setDisplayExpression (displayExpression) {
        self.display = displayExpression
    },
    setCanonicalExpression (canonicalExpression) {
        self.canonical = canonicalExpression
    },
    rerandomize () {
        self.formulaManager.rerandomize(self.id)
    }
}) })
