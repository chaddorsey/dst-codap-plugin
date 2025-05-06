"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.isSelectionAction = exports.isPartialSelectionAction = exports.isRemoveCasesAction = exports.isSetAttributeNameAction = exports.isSetCaseValuesAction = exports.isAddCasesAction = void 0
let isAddCasesAction = function (action) {
    return action.name === "addCases"
}
exports.isAddCasesAction = isAddCasesAction
let isSetCaseValuesAction = function (action) {
    return action.name === "setCaseValues"
}
exports.isSetCaseValuesAction = isSetCaseValuesAction
let isSetAttributeNameAction = function (action) {
    return action.name === "setAttributeName"
}
exports.isSetAttributeNameAction = isSetAttributeNameAction
let isRemoveCasesAction = function (action) {
    return action.name === "removeCases"
}
exports.isRemoveCasesAction = isRemoveCasesAction
let isPartialSelectionAction = function (action) {
    return ["selectCases", "setSelectedCases"].includes(action.name)
}
exports.isPartialSelectionAction = isPartialSelectionAction
let isSelectionAction = function (action) {
    return ["selectAll", "selectCases", "setSelectedCases"].includes(action.name)
}
exports.isSelectionAction = isSelectionAction
