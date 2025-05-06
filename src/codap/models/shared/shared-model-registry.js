"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.registerSharedModelInfo = registerSharedModelInfo
exports.getSharedModelClasses = getSharedModelClasses
exports.getSharedModelInfoByType = getSharedModelInfoByType
let gSharedModelInfoMap = {}
function registerSharedModelInfo(sharedModelInfo) {
    gSharedModelInfoMap[sharedModelInfo.type] = sharedModelInfo
}
function getSharedModelClasses() {
    return Object.values(gSharedModelInfoMap).map(function (info) { return info.modelClass })
}
function getSharedModelInfoByType(type) {
    return type ? gSharedModelInfoMap[type] : undefined
}
