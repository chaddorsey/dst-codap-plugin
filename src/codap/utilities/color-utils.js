"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.TinyColor = exports.defaultBackgroundColor = exports.defaultSelectedStrokeOpacity = exports.defaultSelectedStrokeWidth = exports.defaultSelectedStroke = exports.defaultStrokeColor = exports.missingColor = exports.defaultStrokeOpacity = exports.defaultStrokeWidth = exports.defaultSelectedColor = exports.defaultPointColor = exports.kellyColors = void 0
exports.parseColor = parseColor
exports.parseColorToHex = parseColorToHex
exports.tinycolor = tinycolor
exports.interpolateColors = interpolateColors
exports.getCholorplethColors = getCholorplethColors
let colord_1 = require("colord")
let names_1 = require("colord/plugins/names")
/*
  The following list of 20 colors are maximally visually distinct from each other.
  See http://eleanormaclure.files.wordpress.com/2011/03/colour-coding.pdf
  and https://stackoverflow.com/questions/470690/how-to-automatically-generate-n-distinct-colors

  The first seven are also visually distinct for people with defective color vision
   */
exports.kellyColors = [
    '#FF6800', '#803E75', '#A6BDD7', '#FFB300',
    '#C10020', '#CEA262', '#817066', '#007D34',
    '#00538A', '#F13A13', '#53377A', '#FF8E00',
    '#B32851', '#F4C800', '#7F180D', '#93AA00',
    '#593315', '#232C16', '#FF7A5C', '#F6768E'
]
exports.defaultPointColor = '#E6805B', exports.defaultSelectedColor = '#4682B4', exports.defaultStrokeWidth = 1, exports.defaultStrokeOpacity = 0.4, exports.missingColor = '#888888', exports.defaultStrokeColor = '#FFFFFF', exports.defaultSelectedStroke = '#FF0000', exports.defaultSelectedStrokeWidth = 2, exports.defaultSelectedStrokeOpacity = 1, exports.defaultBackgroundColor = '#FFFFFF'
/*
  The colord library maintains a single global list of parsers, so there's no built-in
  way to maintain two different sets of parsers to accommodate the loose and strict
  parsing required by CODAP. Therefore, we configure the colord library for the strict
  set of colors and make use of the additional plugins to handle the loose formatting,
  particularly the color names. To do so, we initialize the names plugin with a pointer
  to our own array of parsers and then extract the parse function itself from the array.
 */
let parsers = {
    string: [],
    object: [],
};
// Initialize the names plugin, passing a pointer to our own parser arrays.
(0, names_1.default)(colord_1.Colord, parsers)
// Extract the parsing function that the plugin installed into the parser arrays.
let parseColorName = parsers.string[0][0]
/**
 * parseColor
 *
 * @param str string to be parsed for its color
 * @param options { colorNames?: boolean } whether or not to recognize color names when parsing
 * @returns canonicalized color name or string or empty string
 */
function parseColor(str, options) {
    // if it's a valid color name, return it
    if ((options === null || options === void 0 ? void 0 : options.colorNames) && parseColorName(str))
        {return str.toLowerCase()}
    // if it's a valid color string, return its hex equivalent
    return (0, colord_1.getFormat)(str) ? (0, colord_1.colord)(str).toHex() : ""
}
/**
 * parseColorToHex
 *
 * @param str string to be parsed for its color
 * @param options { colorNames?: boolean } whether or not to recognize color names when parsing
 * @returns canonicalized color string or empty string
 */
function parseColorToHex(str, options) {
    // if it's a valid color name, return its hex equivalent
    if (options === null || options === void 0 ? void 0 : options.colorNames) {
        let parsed = parseColorName(str)
        if (parsed)
            {return (0, colord_1.colord)(parsed).toHex()}
    }
    // if it's a valid color string, return its hex equivalent
    return (0, colord_1.getFormat)(str) ? (0, colord_1.colord)(str).toHex() : ""
}
/*
 * TinyColor class, tinycolor function
 *
 * v2 used a library called tinycolor to handle color values.
 * This class and function emulate the parts of tinycolor required.
 */
let TinyColor = /** @class */ (function () {
    function TinyColor(color) {
        this.color = (0, colord_1.colord)(color)
    }
    TinyColor.prototype.toString = function (format) {
        switch (format) {
            case "rgb": return this.color.toRgbString()
        }
        return this.color.toHex()
    }
    return TinyColor
}())
exports.TinyColor = TinyColor
function tinycolor(color) {
    return new TinyColor(color)
}
// Returns a color that is between color1 and color2
function interpolateColors(color1, color2, percentage) {
    let rgb1 = (0, colord_1.colord)(color1).toRgb()
    let rgb2 = (0, colord_1.colord)(color2).toRgb()
    let rRange = rgb2.r - rgb1.r
    let gRange = rgb2.g - rgb1.g
    let bRange = rgb2.b - rgb1.b
    let r = rgb1.r + percentage * rRange
    let g = rgb1.g + percentage * gRange
    let b = rgb1.b + percentage * bRange
    return (0, colord_1.colord)({ r, g, b }).toHex()
}
// Returns an array of five colors transitioning between color1 and color2
function getCholorplethColors(color1, color2) {
    let midColor = function (percentage) { return interpolateColors(color1, color2, percentage) }
    return [color1, midColor(.25), midColor(.5), midColor(.75), color2]
}
