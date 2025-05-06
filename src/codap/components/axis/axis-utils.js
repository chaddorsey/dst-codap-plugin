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
Object.defineProperty(exports, "__esModule", { value: true })
exports.getNumberOfLevelsForDateAxis = exports.isScaleLinear = exports.computeBestNumberOfTicks = exports.getCoordFunctions = exports.getCategoricalLabelPlacement = exports.collisionExists = exports.getStringBounds = void 0
let date_utils_1 = require("../../utilities/date-utils")
let axis_constants_1 = require("./axis-constants")
let data_display_types_1 = require("../data-display/data-display-types")
let use_measure_text_1 = require("../../hooks/use-measure-text")
let getStringBounds = function (s, font) {
    if (s === void 0) { s = 'Wy' }
    if (font === void 0) { font = data_display_types_1.kDataDisplayFont }
    return (0, use_measure_text_1.measureTextExtent)(s, font)
}
exports.getStringBounds = getStringBounds
let collisionExists = function (props) {
    /* A collision occurs when two labels overlap.
     * This can occur when labels are centered on the tick, or when they are left-aligned.
     * The former requires computation of two adjacent label widths.
     */
    let bandWidth = props.bandWidth, categories = props.categories, centerCategoryLabels = props.centerCategoryLabels, narrowedBandwidth = bandWidth - 5, labelWidths = categories.map(function (category) { return (0, exports.getStringBounds)(category).width })
    return centerCategoryLabels ? labelWidths.some(function (width, i) {
        return i > 0 && width / 2 + labelWidths[i - 1] / 2 > narrowedBandwidth
    }) : labelWidths.some(function (width) { return width > narrowedBandwidth })
}
exports.collisionExists = collisionExists
let getCategoricalLabelPlacement = function (axisPlace, centerCategoryLabels, collision) {
    let _a
    let rotation = 'rotate(-90)' // the only rotation value we use
    let labelPlacementMap = {
        left: {
            center: {
                collision: { textAnchor: 'end' },
                fit: { rotation, textAnchor: 'middle' }
            },
            justify: {
                collision: { textAnchor: 'end' },
                fit: { rotation, textAnchor: 'start' }
            }
        },
        rightCat: {
            center: {
                collision: { textAnchor: 'start' },
                fit: { rotation, textAnchor: 'middle' }
            },
            justify: {
                collision: { textAnchor: 'end' },
                fit: { rotation, textAnchor: 'start' }
            }
        },
        bottom: {
            center: {
                collision: {
                    rotation,
                    textAnchor: 'end'
                },
                fit: { textAnchor: 'middle' }
            },
            justify: {
                collision: { rotation, textAnchor: 'end' },
                fit: { textAnchor: 'start' }
            }
        },
        top: {
            center: {
                collision: {
                    rotation,
                    textAnchor: 'start'
                },
                fit: { textAnchor: 'middle' }
            },
            justify: {
                collision: { rotation, textAnchor: 'end' },
                fit: { textAnchor: 'start' }
            }
        }
    }
    let centerOrJustify = centerCategoryLabels ? "center" : "justify"
    let collisionOrFit = collision ? "collision" : "fit"
    let labelPlacement = (_a = labelPlacementMap[axisPlace]) === null || _a === void 0 ? void 0 : _a[centerOrJustify][collisionOrFit]
    return {rotation: '', textAnchor: 'none', ...labelPlacement}
}
exports.getCategoricalLabelPlacement = getCategoricalLabelPlacement
let getCoordFunctions = function (props) {
    let numCategories = props.numCategories, centerCategoryLabels = props.centerCategoryLabels, collision = props.collision, axisIsVertical = props.axisIsVertical, rangeMin = props.rangeMin, rangeMax = props.rangeMax, subAxisLength = props.subAxisLength, isRightCat = props.isRightCat, isTop = props.isTop, dragInfo = props.dragInfo, bandWidth = subAxisLength / numCategories, labelTextHeight = (0, exports.getStringBounds)('12px sans-serif').height, indexOffset = centerCategoryLabels ? 0.5 : 0 /*(axisIsVertical ? 1 : 0)*/, dI = dragInfo.current
    let labelXOffset = 0, labelYOffset = 0
    let getTickCoord = function (i, rangeVal, sign) {
        return i === dI.indexOfCategory ? dI.currentDragPosition
            : rangeVal + sign * (i + indexOffset) * bandWidth
    }, getTickX = function (i) {
        return getTickCoord(i, rangeMin, 1)
    }, getTickY = function (i) {
        return getTickCoord(i, rangeMax, -1)
    }
    switch (axisIsVertical) {
        case true:
            labelXOffset = collision ? 0 : 0.25 * labelTextHeight
            return { getTickX () { return 0 }, getTickY, getDividerX () { return 0 },
                getDividerY (i) { return rangeMax - (i + 1) * bandWidth },
                getLabelX () { return (isRightCat ? 1.5 : -1) * (axis_constants_1.kAxisTickLength + axis_constants_1.kAxisGap + labelXOffset) },
                getLabelY (i) {
                    return (getTickY ? getTickY(i) : 0) + (collision ? 0.25 * labelTextHeight : 0)
                }
            }
        case false:
            labelYOffset = collision ? 0 : (isTop ? -0.15 : 0.75) * labelTextHeight
            return {
                getTickX,
                getTickY () { return 0 },
                getDividerX (i) { return rangeMin + i * bandWidth },
                getDividerY () { return 0 },
                getLabelX (i) { return (getTickX ? getTickX(i) : 0) +
                    (collision ? 0.25 * labelTextHeight : 0) },
                getLabelY () { return (isTop ? -1 : 1) * (axis_constants_1.kAxisTickLength + axis_constants_1.kAxisGap) + labelYOffset }
            }
    }
}
exports.getCoordFunctions = getCoordFunctions
/**
 * Compute the best number of ticks for a given linear scale to prevent tick label collisions.
 * The function iteratively adjusts the number of ticks to find an optimal value that avoids
 * overlapping labels while maintaining a reasonable distribution of ticks.
 *
 * @param {ScaleLinear<number, number>} scale - The D3 linear scale for which to compute the optimal number of ticks.
 * @returns {number} - The computed optimal number of ticks for the given scale.
 */
let computeBestNumberOfTicks = function (scale) {
    let formatter = scale.tickFormat()
    // Helper function to detect collisions between tick labels
    let hasCollision = function (values) {
        return values.some(function (value, i) {
            if (i === values.length - 1)
                {return false}
            let delta = scale(values[i + 1]) - scale(values[i])
            let length = ((0, use_measure_text_1.measureText)(formatter(values[i])) + (0, use_measure_text_1.measureText)(formatter(values[i + 1]))) / 2
            return length > delta
        })
    }
    let tickValues = scale.ticks(), n1 = tickValues.length, n2 = n1, done = false, firstTime = true, currentNumber = n1
    // Find the best number of ticks iteratively
    while (!done) {
        let colliding = hasCollision(tickValues)
        if (colliding) {
            n2 = n1
            n1 = Math.floor(n1 / 2)
            currentNumber = n1
        }
        else if (firstTime) {
            n2 *= 2
            currentNumber = n2
        }
        else {
            currentNumber = n1 + Math.floor((n2 - n1) / 2)
            done = currentNumber === n1 || currentNumber === n2
            if (hasCollision(tickValues)) {
                n2 = currentNumber
            }
            else {
                n1 = currentNumber
            }
        }
        tickValues = scale.ticks(currentNumber)
        firstTime = false
    }
    return Math.max(2, currentNumber)
}
exports.computeBestNumberOfTicks = computeBestNumberOfTicks
let isScaleLinear = function (scale) {
    return scale.interpolate !== undefined
}
exports.isScaleLinear = isScaleLinear
let getNumberOfLevelsForDateAxis = function (minDateInSecs, maxDateInSecs) {
    let levels = (0, date_utils_1.determineLevels)(1000 * minDateInSecs, 1000 * maxDateInSecs)
    return levels.outerLevel !== levels.innerLevel ? 2 : 1
}
exports.getNumberOfLevelsForDateAxis = getNumberOfLevelsForDateAxis
