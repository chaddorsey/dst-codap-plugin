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
exports.getCollectionAttrs = getCollectionAttrs
exports.collectionCaseIdFromIndex = collectionCaseIdFromIndex
exports.collectionCaseIndexFromId = collectionCaseIndexFromId
exports.idOfChildmostCollectionForAttributes = idOfChildmostCollectionForAttributes
exports.firstVisibleParentAttribute = firstVisibleParentAttribute
exports.moveAttribute = moveAttribute
exports.selectAllCases = selectAllCases
exports.setSelectedCases = setSelectedCases
exports.selectCases = selectCases
exports.setOrExtendSelection = setOrExtendSelection
exports.selectAndDeselectCases = selectAndDeselectCases
exports.addSetAsideCases = addSetAsideCases
exports.restoreSetAsideCases = restoreSetAsideCases
exports.replaceSetAsideCases = replaceSetAsideCases
let mobx_state_tree_1 = require("mobx-state-tree")
let log_message_1 = require("../../lib/log-message")
let shared_data_utils_1 = require("../shared/shared-data-utils")
let data_set_notifications_1 = require("./data-set-notifications")
function getCollectionAttrs(collection, data) {
    if (collection && !(0, mobx_state_tree_1.isAlive)(collection)) {
        console.warn("DataSetUtils.getCollectionAttrs called for defunct collection")
        return []
    }
    return Array.from(collection.attributes)
}
function collectionCaseIdFromIndex(index, data, collectionId) {
    let _a
    if (!data)
        {return undefined}
    let cases = data.getCasesForCollection(collectionId)
    return (_a = cases[index]) === null || _a === void 0 ? void 0 : _a.__id__
}
function collectionCaseIndexFromId(caseId, data, collectionId) {
    if (!data)
        {return undefined}
    let cases = data.getCasesForCollection(collectionId)
    // for now, linear search through pseudo-cases; could index if performance becomes a problem.
    let found = cases.findIndex(function (aCase) { return aCase.__id__ === caseId })
    return found >= 0 ? found : undefined
}
/**
 * Returns the collection containing the attribute from the given array that is closest to the
 * root of the data set. If there is an attribute that is not in any collection, then we return undefined
 * indicating that the client should use the root as the source of cases.
 */
function idOfChildmostCollectionForAttributes(attrIDs, data) {
    if (!data)
        {return undefined}
    let collections = data.collections
    for (let i = collections.length - 1; i >= 0; --i) {
        let collection = collections[i]
        if (collection.attributes.some(function (attr) { let _a; return attrIDs.includes((_a = attr === null || attr === void 0 ? void 0 : attr.id) !== null && _a !== void 0 ? _a : "") }))
            {return collection.id}
    }
}
function firstVisibleParentAttribute(data, collectionId) {
    if (!collectionId)
        {return}
    let metadata = data && (0, shared_data_utils_1.getSharedCaseMetadataFromDataset)(data)
    let parentCollection = data === null || data === void 0 ? void 0 : data.getParentCollection(collectionId)
    return parentCollection === null || parentCollection === void 0 ? void 0 : parentCollection.attributes.find(function (attr) { return attr && !(metadata === null || metadata === void 0 ? void 0 : metadata.isHidden(attr.id)) })
}
function moveAttribute(_a) {
    let _b
    let afterAttrId = _a.afterAttrId, attrId = _a.attrId, dataset = _a.dataset, includeNotifications = _a.includeNotifications, sourceCollection = _a.sourceCollection, targetCollection = _a.targetCollection, undoable = _a.undoable
    let firstAttr = getCollectionAttrs(targetCollection, dataset)[0]
    let options = afterAttrId ? { after: afterAttrId } : { before: firstAttr === null || firstAttr === void 0 ? void 0 : firstAttr.id }
    // bail if we're moving the attribute before/after itself
    if (attrId === options.after || attrId === options.before)
        {return}
    let notifications = includeNotifications ? (0, data_set_notifications_1.moveAttributeNotification)(dataset) : undefined
    let undoStringKey = undoable ? "DG.Undo.dataContext.moveAttribute" : undefined
    let redoStringKey = undoable ? "DG.Redo.dataContext.moveAttribute" : undefined
    let logMessage = (0, log_message_1.logMessageWithReplacement)("Moved attribute %@ to %@ collection", { attrId, collection: (_b = targetCollection.name) !== null && _b !== void 0 ? _b : "new" })
    let modelChangeOptions = { notify: notifications, undoStringKey, redoStringKey, log: logMessage }
    if (targetCollection.id === (sourceCollection === null || sourceCollection === void 0 ? void 0 : sourceCollection.id)) {
        // move the attribute within a collection
        dataset.applyModelChange(function () { return targetCollection.moveAttribute(attrId, options) }, modelChangeOptions)
    }
    else {
        // move the attribute to a new collection
        let result_1
        let _notifications = includeNotifications && notifications
            ? function () { return (result_1 === null || result_1 === void 0 ? void 0 : result_1.removedCollectionId)
                ? [(0, data_set_notifications_1.deleteCollectionNotification)(dataset), notifications]
                : notifications }
            : undefined
        dataset.applyModelChange(function () {
            result_1 = dataset.moveAttribute(attrId, {collection: targetCollection === null || targetCollection === void 0 ? void 0 : targetCollection.id, ...options})
        }, { notify: _notifications, undoStringKey, redoStringKey, log: logMessage })
    }
}
// Selection helper functions
function selectWithNotification(func, data, extend) {
    data === null || data === void 0 ? void 0 : data.applyModelChange(function () {
        func()
    }, {
        notify: (0, data_set_notifications_1.selectCasesNotification)(data, extend)
    })
}
function selectAllCases(data, select) {
    if (select === void 0) { select = true }
    selectWithNotification(function () { return data === null || data === void 0 ? void 0 : data.selectAll(select) }, data)
}
function setSelectedCases(caseIds, data) {
    selectWithNotification(function () { return data === null || data === void 0 ? void 0 : data.setSelectedCases(caseIds) }, data)
}
function selectCases(caseIds, data, select) {
    selectWithNotification(function () { return data === null || data === void 0 ? void 0 : data.selectCases(caseIds, select) }, data, true)
}
function setOrExtendSelection(caseIds, data, extend, select) {
    if (extend === void 0) { extend = false }
    if (extend)
        {selectCases(caseIds, data, select)}
    else
        {setSelectedCases(caseIds, data)}
}
function selectAndDeselectCases(addCaseIds, removeCaseIds, data) {
    selectWithNotification(function () {
        data === null || data === void 0 ? void 0 : data.selectCases(addCaseIds)
        data === null || data === void 0 ? void 0 : data.selectCases(removeCaseIds, false)
    }, data, true)
}
// Set aside helper functions
// For case ids, returns the grouped case. For item ids, returns the childmost grouped case containing that item.
function getGroupedCases(data, caseOrItemIds) {
    return caseOrItemIds.map(function (caseId) { let _a; return (_a = data.caseInfoMap.get(caseId)) !== null && _a !== void 0 ? _a : data.itemIdChildCaseMap.get(caseId) })
        .filter(function (caseInfo) { return !!caseInfo }).map(function (caseInfo) { return caseInfo.groupedCase })
}
function addSetAsideCases(data, caseOrItemIds, undoable) {
    if (undoable === void 0) { undoable = true }
    if (caseOrItemIds.length) {
        data.validateCases()
        data.applyModelChange(function () {
            data.hideCasesOrItems(caseOrItemIds)
            data.selectCases(caseOrItemIds, false)
        }, {
            notify: [(0, data_set_notifications_1.selectCasesNotification)(data, true), (0, data_set_notifications_1.deleteCasesNotification)(data, getGroupedCases(data, caseOrItemIds))],
            undoStringKey: undoable ? "V3.Undo.hideShowMenu.setAsideCases" : undefined,
            redoStringKey: undoable ? "V3.Redo.hideShowMenu.setAsideCases" : undefined
        })
    }
}
function createGuaranteedCasesNotification(data, caseOrItemIds) {
    let caseIds = caseOrItemIds
        .map(function (id) { let _a; return data.caseInfoMap.get(id) ? id : (_a = data.itemIdChildCaseMap.get(id)) === null || _a === void 0 ? void 0 : _a.groupedCase.__id__ })
        .filter(function (caseId) { return caseId != null })
    if (caseIds.length)
        {return (0, data_set_notifications_1.createCasesNotification)(caseIds, data)}
}
function restoreSetAsideCases(data, caseOrItemIds, undoable) {
    if (undoable === void 0) { undoable = true }
    if (!data)
        {return}
    data.validateCases()
    let setAsideCaseOrItemIds = caseOrItemIds ? caseOrItemIds.filter(function (caseId) { return data.isCaseOrItemHidden(caseId) }) : __spreadArray([], data.setAsideItemIds, true)
    let createNotification = createGuaranteedCasesNotification(data, setAsideCaseOrItemIds)
    let notifications = createNotification ? [createNotification] : []
    if (setAsideCaseOrItemIds.length) {
        data.applyModelChange(function () {
            data.showHiddenCasesAndItems(setAsideCaseOrItemIds)
            data.setSelectedCases(setAsideCaseOrItemIds)
        }, {
            notify: notifications.concat((0, data_set_notifications_1.selectCasesNotification)(data)),
            undoStringKey: undoable ? "V3.Undo.hideShowMenu.restoreSetAsideCases" : undefined,
            redoStringKey: undoable ? "V3.Redo.hideShowMenu.restoreSetAsideCases" : undefined,
            log: "Restore set aside cases"
        })
    }
}
function replaceSetAsideCases(data, caseOrItemIds) {
    if (caseOrItemIds.length) {
        data.validateCases()
        let itemIds_1 = []
        caseOrItemIds.forEach(function (caseOrItemId) {
            let aCase = data.caseInfoMap.get(caseOrItemId)
            if (aCase) {
                aCase.childItemIds.forEach(function (itemId) { return itemIds_1.push(itemId) })
                aCase.hiddenChildItemIds.forEach(function (itemId) { return itemIds_1.push(itemId) })
            }
            else {
                itemIds_1.push(caseOrItemId)
            }
        })
        let itemIdSet_1 = new Set(itemIds_1)
        let restoredItemIds_1 = data.setAsideItemIds.filter(function (itemId) { return !itemIdSet_1.has(itemId) })
        let setAsideCaseOrItemIds = caseOrItemIds.filter(function (caseId) { return !data.isCaseOrItemHidden(caseId) })
        let setAsideCases = getGroupedCases(data, setAsideCaseOrItemIds)
        let createNotification = createGuaranteedCasesNotification(data, restoredItemIds_1)
        let notifications = createNotification ? [createNotification] : []
        if (setAsideCases.length)
            {notifications = notifications.concat((0, data_set_notifications_1.deleteCasesNotification)(data, setAsideCases))}
        data.applyModelChange(function () {
            data.showHiddenCasesAndItems()
            data.validateCases()
            data.hideCasesOrItems(caseOrItemIds)
            data.setSelectedCases(restoredItemIds_1)
        }, {
            notify: notifications.concat((0, data_set_notifications_1.selectCasesNotification)(data, true))
        })
    }
}
