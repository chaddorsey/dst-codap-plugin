"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.symIndex = exports.symFirstChild = exports.symParent = void 0
// not currently used, but perhaps should be instead of __id__
// export const symId = Symbol.for("id")
// used in IGroupedCase
exports.symParent = Symbol.for("parent")
exports.symFirstChild = Symbol.for("firstChild")
exports.symIndex = Symbol.for("index")
