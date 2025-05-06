"use strict"
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
exports.getScaleThresholds = getScaleThresholds
exports.choroplethLegend = choroplethLegend
let d3_1 = require("d3")
let data_display_types_1 = require("../../../data-display-types")
let math_utils_1 = require("../../../../../utilities/math-utils")
let date_utils_1 = require("../../../../../utilities/date-utils")
let axis_utils_1 = require("../../../../axis/axis-utils")
function isScaleQuantile(scale) {
    return "quantiles" in scale
}
function getScaleThresholds(scale) {
    return isScaleQuantile(scale) ? scale.quantiles() : scale.thresholds()
}
function choroplethLegend(scale, choroplethElt, props) {
    let _a, _b
    // Handle invalid or not enough cases:
    // - Quantile legends: the domain length will be 0
    // - Quantize legends: the domain will be [NaN, NaN]
    let domain = scale.domain()
    if (domain.length === 0 || isNaN(domain[0])) {
        (0, d3_1.select)(choroplethElt).selectAll("*").remove()
        return
    }
    let isDate = props.isDate, _c = props.tickSize, tickSize = _c === void 0 ? 6 : _c, _d = props.transform, transform = _d === void 0 ? '' : _d, _e = props.width, width = _e === void 0 ? 320 : _e, _f = props.marginTop, marginTop = _f === void 0 ? 0 : _f, _g = props.marginRight, marginRight = _g === void 0 ? 0 : _g, _h = props.marginLeft, marginLeft = _h === void 0 ? 0 : _h, _j = props.ticks, ticks = _j === void 0 ? 5 : _j, clickHandler = props.clickHandler, casesInBinSelectedHandler = props.casesInBinSelectedHandler, minValue = (_a = (0, d3_1.min)(scale.domain())) !== null && _a !== void 0 ? _a : 0, maxValue = (_b = (0, d3_1.max)(scale.domain())) !== null && _b !== void 0 ? _b : 0
    let tickFormatSpec = '.2r';
    (0, d3_1.select)(choroplethElt).selectAll("*").remove()
    let svg = (0, d3_1.select)(choroplethElt).append("svg")
        .attr('transform', transform)
        // .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block")
    let thresholds = getScaleThresholds(scale), fullBoundaries = __spreadArray(__spreadArray([minValue], thresholds, true), [maxValue], false), domainValues = scale.domain(), significantDigits = (0, math_utils_1.neededSigDigitsArrayForBinBoundaries)(fullBoundaries, domainValues), dateLevels = isDate ? (0, date_utils_1.determineLevels)(minValue, maxValue) : { increment: 1, outerLevel: 0, innerLevel: 0 }, datePrecision = isDate ? (0, date_utils_1.mapLevelToPrecision)(dateLevels.innerLevel + 1) : date_utils_1.DatePrecision.None
    let thresholdFormat = isDate ? function (date) { let _a; return (_a = (0, date_utils_1.formatDate)(date * 1000, datePrecision)) !== null && _a !== void 0 ? _a : '' }
        : (0, d3_1.format)(tickFormatSpec)
    let legendScale = (0, d3_1.scaleLinear)()
        .domain([-1, scale.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]), tickValues = (0, d3_1.range)(thresholds.length), tickFormat = function (i) { return thresholdFormat(thresholds[Number(i)]) }, minMaxFormat = isDate ? thresholdFormat
        : function (d, i) { return (0, d3_1.format)(".".concat(significantDigits[i === 0 ? 0 : 5], "r"))(d) }, minStringWidth = (0, axis_utils_1.getStringBounds)(minMaxFormat(minValue, 0)).width, onlyShowMinMax = minStringWidth > 3 * width / 20 - 10
    svg.append("g")
        .selectAll("rect")
        .data(scale.range())
        .join("rect")
        .attr('class', 'choropleth-rect')
        .classed('legend-rect-selected', function (color) {
        return casesInBinSelectedHandler(scale.range().indexOf(color))
    })
        .attr('transform', transform)
        .attr("x", function (d, i) { return legendScale(i - 1) })
        .attr("y", marginTop)
        .attr("width", function (d, i) { return legendScale(i) - legendScale(i - 1) })
        .attr("height", data_display_types_1.kChoroplethHeight /*height - marginTop - marginBottom*/)
        .attr("fill", function (d) { return d })
        .on('click', function (event, color) {
        clickHandler(scale.range().indexOf(color), event.shiftKey)
    })
        .append('title')
        .text(function (color) {
        let bin = scale.range().indexOf(color)
        return "".concat(thresholdFormat(fullBoundaries[bin]), " - ").concat(thresholdFormat(fullBoundaries[bin + 1]))
    })
    let legendAxis = svg.append("g")
        .attr('class', 'legend-axis')
        .attr("transform", "".concat(transform, " translate(0,").concat(data_display_types_1.kChoroplethHeight + marginTop, ")"))
    if (!onlyShowMinMax) {
        legendAxis.call((0, d3_1.axisBottom)(legendScale)
            .ticks(ticks)
            .tickFormat(tickFormat)
            .tickSize(tickSize)
            .tickValues(tickValues))
    }
    svg.select('.legend-axis')
        .append('g')
        .attr('class', 'legend-axis-label')
        .selectAll('text')
        .data([Number(minValue), Number(maxValue)])
        .join(function (enter) {
        return enter.append('text')
            .attr('y', data_display_types_1.kChoroplethHeight)
            .style('text-anchor', function (d, i) { return i ? 'end' : 'start' })
            .attr('x', function (d, i) { return i * width })
            .text(minMaxFormat)
    })
    return svg.node()
}
