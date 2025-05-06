"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.setUrlParams = exports.urlParams = exports.getSearchParams = void 0
exports.removeSearchParams = removeSearchParams
exports.removeDevUrlParams = removeDevUrlParams
let query_string_1 = require("query-string")
// separate function aids in tests
let getSearchParams = function () { return location.search }
exports.getSearchParams = getSearchParams
function removeSearchParams(paramsToRemove) {
    // Parse the current URL and its query string
    let url = new URL(window.location.href)
    let params = new URLSearchParams(url.search)
    // Remove specific parameters
    paramsToRemove.forEach(function (param) { return params.delete(param) })
    // Rebuild the URL without the specific parameters
    let paramsStr = params.toString()
    let searchStr = paramsStr ? "?".concat(paramsStr) : ""
    let newUrl = "".concat(url.protocol, "//").concat(url.host).concat(url.pathname).concat(searchStr).concat(url.hash)
    // Update the URL in the address bar without reloading the page
    window.history.pushState({ path: newUrl }, "", newUrl)
}
exports.urlParams = query_string_1.default.parse((0, exports.getSearchParams)())
let setUrlParams = function (search) { return exports.urlParams = query_string_1.default.parse(search) }
exports.setUrlParams = setUrlParams
// remove developer-convenience url params
function removeDevUrlParams() {
    removeSearchParams(["dashboard", "sample", "tableOnly"])
}
