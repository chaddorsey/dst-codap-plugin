"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.dataDisplayGetNumericValue = void 0
let date_utils_1 = require("../../utilities/date-utils")
// For graphs and map legends, we need date values to be returned as numbers
let dataDisplayGetNumericValue = function (dataset, caseID, attrID) {
    let _a
    let attr = dataset === null || dataset === void 0 ? void 0 : dataset.getAttribute(attrID)
    let index = dataset === null || dataset === void 0 ? void 0 : dataset.getItemIndexForCaseOrItem(caseID)
    if ((attr === null || attr === void 0 ? void 0 : attr.type) === 'date' && index != null) {
        let dateInMS = (_a = (0, date_utils_1.convertToDate)(dataset === null || dataset === void 0 ? void 0 : dataset.getStrValueAtItemIndex(index, attrID))) === null || _a === void 0 ? void 0 : _a.valueOf()
        return dateInMS ? dateInMS / 1000 : undefined
    }
    return dataset === null || dataset === void 0 ? void 0 : dataset.getNumeric(caseID, attrID)
}
exports.dataDisplayGetNumericValue = dataDisplayGetNumericValue
