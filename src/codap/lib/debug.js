"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.DEBUG_UNDO = exports.DEBUG_SAVE_AS_V2 = exports.DEBUG_PLUGINS = exports.DEBUG_PIXI_POINTS = exports.DEBUG_MAP = exports.DEBUG_LOGGER = exports.DEBUG_HISTORY = exports.DEBUG_FORMULAS = exports.DEBUG_DOCUMENT = exports.DEBUG_CFM_NO_AUTO_SAVE = exports.DEBUG_CFM_LOCAL_STORAGE = exports.DEBUG_CFM_EVENTS = exports.DEBUG_CASE_IDS = void 0
exports.debugLog = debugLog
/*
 * The DEBUG_* flags allow developer-facing features or console output to be enabled/disabled
 * for particular categories of features or output. To enable one or more DEBUG flags, set
 * the value of the `debug` property in the `Local Storage` section of the `Application` tab
 * of the browser DevTools to a string that includes one or more of the category strings
 * listed below. For instance, the string `logger undo` will enable the `DEBUG_LOGGER` and
 * `DEBUG_UNDO` flags. This allows some useful developer-facing features to remain in the
 * code because it can be enabled/disabled externally via the browser DevTools.
 *
 * These flags can then be used in code:
 * if (DEBUG_FOO) { ... do something that should only happen when debugging foo ... }
 *
 * There is also a debugLog() function for conditionally `console.log`ing:
 * debugLog(DEBUG_FOO, "String that should only be logged when debugging foo.")
 */
let debug = (window.localStorage ? window.localStorage.getItem("debug") : undefined) || ""
if (debug.length > 0) {
    // eslint-disable-next-line no-console
    console.info("DEBUG:", debug)
}
let debugContains = function (key) { return debug.indexOf(key) !== -1 }
exports.DEBUG_CASE_IDS = debugContains("caseIds")
exports.DEBUG_CFM_EVENTS = debugContains("cfmEvents")
exports.DEBUG_CFM_LOCAL_STORAGE = debugContains("cfmLocalStorage")
exports.DEBUG_CFM_NO_AUTO_SAVE = debugContains("cfmNoAutoSave")
exports.DEBUG_DOCUMENT = debugContains("document")
exports.DEBUG_FORMULAS = debugContains("formulas")
exports.DEBUG_HISTORY = debugContains("history")
exports.DEBUG_LOGGER = debugContains("logger")
exports.DEBUG_MAP = debugContains("map")
exports.DEBUG_PIXI_POINTS = debugContains("pixiPoints")
exports.DEBUG_PLUGINS = debugContains("plugins")
exports.DEBUG_SAVE_AS_V2 = debugContains("saveAsV2")
exports.DEBUG_UNDO = debugContains("undo")
function debugLog(debugFlag) {
    let args = []
    for (let _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i]
    }
    // eslint-disable-next-line no-console
    debugFlag && console.log.apply(console, args)
}
