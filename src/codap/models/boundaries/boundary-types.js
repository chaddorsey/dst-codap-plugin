"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.isBoundaryValue = exports.boundaryObjectFromBoundaryValue = exports.kPolygonNames = exports.kBoundariesSpecUrl = exports.kBoundariesRootUrl = void 0
exports.isBoundaryInfo = isBoundaryInfo
let constants_1 = require("../../constants")
exports.kBoundariesRootUrl = (0, constants_1.codapResourcesUrl)("boundaries")
exports.kBoundariesSpecUrl = "".concat(exports.kBoundariesRootUrl, "/default_boundary_specs.json")
// TODO: localize this list properly
exports.kPolygonNames = ['boundary', 'boundaries', 'polygon', 'polygons', 'grenze', '境界', 'مرز']
let boundaryObjectFromBoundaryValue = function (iBoundaryValue) {
    if (typeof iBoundaryValue === 'object') {
        return iBoundaryValue
    }
    else {
        try {
            return JSON.parse(iBoundaryValue)
        }
        catch (er) {
            return null
        }
    }
}
exports.boundaryObjectFromBoundaryValue = boundaryObjectFromBoundaryValue
let isBoundaryValue = function (iValue) {
    let obj = (0, exports.boundaryObjectFromBoundaryValue)(iValue)
    return obj != null &&
        !!(obj.geometry || obj.coordinates || obj.features ||
            obj.type === 'FeatureCollection' || obj.type === 'Feature' || obj.jsonBoundaryObject)
}
exports.isBoundaryValue = isBoundaryValue
function isBoundaryInfo(obj) {
    return obj && typeof obj === "object" && "format" in obj && "name" in obj && "url" in obj
}
