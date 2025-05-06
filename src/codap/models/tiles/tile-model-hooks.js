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
exports.tileModelHooks = tileModelHooks
// This is a way to work with MST action syntax
// The input argument has to match the api and the result
// is a literal object type which is compatible with the ModelActions
// type that is required.
/**
 * A TypeScript helper method for adding hooks to a content model. It should be
 * used like:
 * ```
 * .actions(self => tileModelHooks({
 *   // add your hook functions here
 * }))
 * ```
 * @param clientHooks the hook functions
 * @returns the hook functions in a literal object format that is compatible
 * with the ModelActions type of MST
 */
function tileModelHooks(clientHooks) {
    let hooks = {onTileAction (call) {
            // no-op
        }, willRemoveFromDocument () {
            // no-op
        }, ...clientHooks}
    return { ...hooks}
}
