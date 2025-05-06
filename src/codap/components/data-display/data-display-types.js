"use strict"
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i]
            for (let p in s) {if (Object.prototype.hasOwnProperty.call(s, p))
                {t[p] = s[p]}}
        }
        return t
    }
    return __assign.apply(this, arguments)
}
let __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) {for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i)
            ar[i] = from[i]
        }
    }}
    return to.concat(ar || Array.prototype.slice.call(from))
}
Object.defineProperty(exports, "__esModule", { value: true })
exports.kMain = exports.kOther = exports.graphPlaceToAttrRole = exports.axisPlaceToAttrRole = exports.attrRoleToGraphPlace = exports.attrRoleToAxisPlace = exports.TipAttrRoles = exports.AttrRoles = exports.MapAttrRoles = exports.GraphSplitAttrRoles = exports.GraphAttrRoles = exports.GraphTipAttrRoles = exports.PrimaryAttrRoles = exports.kPortalClassSelector = exports.kPortalClass = exports.kChoroplethHeight = exports.kDataDisplayFont = exports.hoverRadiusFactor = exports.pointRadiusSelectionAddend = exports.pointRadiusLogBase = exports.pointRadiusMin = exports.pointRadiusMax = exports.transitionDuration = exports.isPointDisplayType = exports.PointDisplayTypes = exports.kNullPoint = void 0
exports.kNullPoint = { x: -999, y: -999 }
exports.PointDisplayTypes = ["points", "bars", "bins", "histogram"]
let isPointDisplayType = function (value) {
    return exports.PointDisplayTypes.includes(value)
}
exports.isPointDisplayType = isPointDisplayType
exports.transitionDuration = 1000, exports.pointRadiusMax = 10, exports.pointRadiusMin = 3, exports.pointRadiusLogBase = 2.0, exports.pointRadiusSelectionAddend = 1, exports.hoverRadiusFactor = 1.5, exports.kDataDisplayFont = '12px sans-serif', exports.kChoroplethHeight = 16
exports.kPortalClass = "portal-parent"
exports.kPortalClassSelector = ".".concat(exports.kPortalClass)
exports.PrimaryAttrRoles = ['x', 'y']
exports.GraphTipAttrRoles = __spreadArray(__spreadArray([], exports.PrimaryAttrRoles, true), ['rightNumeric', 'topSplit', 'rightSplit', 'legend', 'caption'], false)
exports.GraphAttrRoles = __spreadArray(__spreadArray([], exports.GraphTipAttrRoles, true), [
    'yPlus'
], false)
exports.GraphSplitAttrRoles = __spreadArray(__spreadArray([], exports.PrimaryAttrRoles, true), ['topSplit', 'rightSplit'], false)
exports.MapAttrRoles = ['lat', 'long', 'polygon']
exports.AttrRoles = __spreadArray(__spreadArray([], exports.GraphAttrRoles, true), exports.MapAttrRoles, true)
// We leave open the possibility that TipAttrRoles may include some that are not GraphTipAttrRoles
exports.TipAttrRoles = __spreadArray([], exports.GraphTipAttrRoles, true)
exports.attrRoleToAxisPlace = {
    x: "bottom",
    y: "left",
    rightNumeric: "rightNumeric",
    rightSplit: "rightCat",
    topSplit: "top"
}
exports.attrRoleToGraphPlace = {...exports.attrRoleToAxisPlace, yPlus: "yPlus", legend: "legend"}
exports.axisPlaceToAttrRole = {
    bottom: "x",
    left: "y",
    top: "topSplit",
    rightCat: "rightSplit",
    rightNumeric: "rightNumeric"
}
exports.graphPlaceToAttrRole = {...exports.axisPlaceToAttrRole, legend: "legend", plot: "legend", yPlus: "yPlus"}
exports.kOther = '__other__' // Used as key to category map entry that stashes overflow of what
// doesn't fit on cell axis. Not likely to be an attribute value
exports.kMain = '__main__' // When an axis has no categories, this is its pseudo-category
