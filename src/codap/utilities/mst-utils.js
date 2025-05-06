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
exports.safeGetSnapshot = safeGetSnapshot
exports.typeField = typeField
exports.getParentWithTypeName = getParentWithTypeName
exports.isAliveSafe = isAliveSafe
exports.verifyAlive = verifyAlive
exports.onAnyAction = onAnyAction
exports.cachedFnFactory = cachedFnFactory
exports.cachedFnWithArgsFactory = cachedFnWithArgsFactory
exports.getDocumentContentPropertyFromNode = getDocumentContentPropertyFromNode
let mobx_1 = require("mobx")
let mobx_state_tree_1 = require("mobx-state-tree")
function safeGetSnapshot(target) {
    return target ? (0, mobx_state_tree_1.getSnapshot)(target) : undefined
}
/**
 * This creates the definition for a type field in MST.
 * The field is optional so it doesn't have to be specified when creating
 * an instance.
 *
 * @param typeName the type
 * @returns
 */
function typeField(typeName) {
    return mobx_state_tree_1.types.optional(mobx_state_tree_1.types.literal(typeName), typeName)
}
/**
 * Returns an ancestor of a node whose type name is `typeName`, if any.
 * This is like `getParentOfType(target, type)`, but allows us not to refer directly to the
 * parent type, which can cause circular reference errors in MST.
 */
function getParentWithTypeName(target, typeName) {
    let current = target
    while ((0, mobx_state_tree_1.hasParent)(current)) {
        let parent_1 = (0, mobx_state_tree_1.getParent)(current)
        let type = (0, mobx_state_tree_1.getType)(parent_1)
        if (type.name === typeName)
            {return parent_1}
        current = parent_1
    }
    return undefined
}
function isAliveSafe(target) {
    return !!target && (0, mobx_state_tree_1.isAlive)(target)
}
/**
 * A short circuit isAlive check. It is intended to be used in observing
 * components. If the observing component is working with a MST object that
 * might get destroyed and the component should not be rendered after the object
 * is destroyed, this function should prevent the MST warnings. These warnings
 * can show up when MobX recomputes a computed value to see if it has changed.
 * This recomputing can happen even if the component is never re-rendered.
 *
 * It doesn't throw an error since often these issues are not critical. However
 * the issues do have the potential to cause hard to track down problems.
 *
 * It doesn't return a value because it can be used before hooks in a component
 * which should be run regardless of this check for consistency.
 *
 * See mst-detached-error.md and mobx-react-mst.test.tsx for more details.
 * https://github.com/concord-consortium/collaborative-learning/blob/master/docs/mst-detached-error.md
 * https://github.com/concord-consortium/collaborative-learning/blob/master/src/components/mobx-react-mst.test.tsx
 */
function verifyAlive(target, source) {
    if (source === void 0) { source = "unknown" }
    if (!(0, mobx_state_tree_1.isAlive)(target)) {
        console.warn("Destroyed MST Object is being accessed from ".concat(source, ". Type: ").concat((0, mobx_state_tree_1.getType)(target)))
    }
}
/**
 * Identical to onAction (above) except defaults to { afterAttach: true, allActions: true }
 *
 * @param target
 * @param listener
 * @param options object that controls the behavior
 * @param options.attachAfter (default false) fires the listener *after* the action has executed instead of before.
 * @param options.allActions (default false) fires the listener for *all* actions instead of just the outermost action.
 * @returns
 */
function onAnyAction(target, listener, options) {
    return (0, mobx_state_tree_1.onAction)(target, listener, {attachAfter: true, allActions: true, ...options})
}
/**
 * A function factory that returns a lazily evaluated function that doesn't take arguments and will return the same
 * value until invalidate() is called. This is useful for caching values that are expensive to calculate.
 *
 * @param calculate
 * @returns a function that will return the same value until invalidate() is called.
 */
function cachedFnFactory(calculate) {
    let valid = false
    let cachedValue
    let getter = function () {
        if (!valid) {
            cachedValue = calculate()
            valid = true
        }
        return cachedValue
    }
    getter.invalidate = function () {
        valid = false
    }
    return getter
}
/**
 * A function factory that returns a lazily evaluated function, which takes arguments and will return the same value
 * until invalidate() or invalidateAll() is called. This is useful for caching values that are expensive to calculate.
 *
 * @param key a function that returns a string cache key using the arguments.
 * @param calculate a function that will be called to calculate the value when it is invalidated.
 * @returns a function that will return the same value for the same arguments until invalidate() is called.
 */
function cachedFnWithArgsFactory(options) {
    // TypeScript generics are a bit complicated here. However, they ensure that invalidate() function is called
    // with the same arguments as the calculate() function. It will work even if the client code completely skips
    // explicit type definition between < and >.
    let key = options.key, calculate = options.calculate, name = options.name
    // The map is observable so any observers will be triggered when the cache is updated
    // The values within the map are not automatically made observable since
    // cachedFnWithArgsFactory is usually used in cases where the values are large objects
    // and usually a whole new value object is created by on each calculate call
    let cacheMap = mobx_1.observable.map({}, { name: name || "cachedFnWithArgs", deep: false })
    let getter = function () {
        let args = []
        for (let _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i]
        }
        let cacheKey = key.apply(void 0, args)
        if (!cacheMap.has(cacheKey)) {
            cacheMap.set(cacheKey, calculate.apply(void 0, args))
        }
        return cacheMap.get(cacheKey)
    }
    getter.invalidate = function () {
        let args = []
        for (let _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i]
        }
        let cacheKey = key.apply(void 0, args)
        cacheMap.delete(cacheKey)
    }
    getter.invalidateAll = function () {
        cacheMap.clear()
    }
    return getter
}
function getDocumentContentPropertyFromNode(node, propName) {
    let docContent = getParentWithTypeName(node, "DocumentContent")
    return docContent ? docContent[propName] : undefined
}
