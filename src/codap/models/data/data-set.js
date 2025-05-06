"use strict"
/*
  The DataSet model is part of the data model originally designed for CLUE and updated for CODAP 3,
  which represents a flat "collection" of data. It is a MobX State Tree model which stores an array
  of Attribute models which store the actual data in frozen arrays.

  Although the data values are stored in the Attributes, the DataSet provides API for interacting
  with the data via cases, which are JavaScript objects with an `__id__` property (for storing the
  case id) and a property for each attribute. Cases can be traditional, in which case the property
  names are the attribute names, or canonical, in which case the property names are the attribute
  ids. All actions which mutate the data require canonical cases because attribute ids work better
  for undo/redo purposes because they aren't affected by renaming of attributes. The `getCases()`
  and `getCasesByIndex()` methods have a parameter which controls whether traditional or canonical
  cases are returned. Traditional cases can be useful for displaying to the user and for
  transferring data between DataSets, e.g. via copy/paste. The `toCanonical` and `fromCanonical`
  utility functions can be used to convert between the two representations.

  We currently use `__id__` to represent the case id in case objects to minimize the chance that
  we encounter conflicts with user-entered data. In theory we could use a JavaScript symbol for
  this purpose but that is left as a potential future improvement. If not provided by the client,
  case `__id__`s are automatically generated using `ulid`, which generates ordered randomized ids
  so that cases can be sorted by creation order if desired.

  As in CODAP v2, attributes can be grouped into collections. Within collections, cases with
  identical values are grouped into pseudo-cases which represent multiple child cases. For
  historical reasons, in v2 the collections and their cases were primary, and the flat "items"
  were constructed by combining the contents of the cases in each collection. In contrast, v3
  represents the flat cases by default and builds the collection-grouped pseudo-cases on the
  fly when necessary. Thus, "case" in v3 corresponds to "item" in v2, and "pseudo-case" in v3
  corresponds to "case" in v2.

  Clients can use standard MST mechanisms to listen for and respond to data model changes. For
  instance, `onAction()` will trigger whenever any DataSet action methods are called and provide
  access to the arguments that were passed to the action. Middleware is used to add attribute and
  case ids where needed so that they're available in the arguments for the `addAttributes()` and
  `addCases()` actions.

  The DataSet supports a notion of "derived" DataSets which can track a source DataSet and stay
  in sync with it as modifications are made. These derived DataSets can use a subset of the
  attributes and/or filter the cases so that, for instance, a scatter plot could make use of a
  derived DataSet with only two attributes and only cases with numeric values. This derivation
  system is loosely patterned after the case data flow architecture in Fathom, for the handful
  of people on the planet for whom that reference makes any sense.
 */
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
let __rest = (this && this.__rest) || function (s, e) {
    let t = {}
    for (var p in s) {if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        {t[p] = s[p]}}
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        {for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                {t[p[i]] = s[p[i]]}
        }}
    return t
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
exports.DataSet = void 0
exports.fromCanonicalCase = fromCanonicalCase
exports.fromCanonical = fromCanonical
exports.toCanonicalCase = toCanonicalCase
exports.toCanonical = toCanonical
exports.isFilterFormulaDataSet = isFilterFormulaDataSet
let mobx_1 = require("mobx")
let mobx_state_tree_1 = require("mobx-state-tree")
let pluralize_1 = require("pluralize")
let attribute_1 = require("./attribute")
let attribute_types_1 = require("./attribute-types")
let collection_1 = require("./collection")
// eslint-disable-next-line import/no-cycle
let data_set_conversion_1 = require("./data-set-conversion")
let formula_1 = require("../formula/formula")
let apply_model_change_1 = require("../history/apply-model-change")
let without_undo_1 = require("../history/without-undo")
let codap_utils_1 = require("../../utilities/codap-utils")
let data_utils_1 = require("../../utilities/data-utils")
let js_utils_1 = require("../../utilities/js-utils")
let locale_1 = require("../../utilities/translation/locale")
let translate_1 = require("../../utilities/translation/translate")
let v2_model_1 = require("./v2-model")
function fromCanonicalCase(ds, canonical) {
    let _a
    let aCase = canonical.__id__ ? { __id__: canonical.__id__ } : {}
    for (let id in canonical) {
        if (id !== "__id__") {
            // if we can't find a name, just use the id
            let name_1 = ((_a = ds.getAttribute(id)) === null || _a === void 0 ? void 0 : _a.name) || id
            aCase[name_1] = canonical[id]
        }
    }
    return aCase
}
function fromCanonical(ds, cases) {
    return Array.isArray(cases)
        ? cases.map(function (aCase) { return fromCanonicalCase(ds, aCase) })
        : fromCanonicalCase(ds, cases)
}
function toCanonicalCase(ds, aCase) {
    let _a
    let canonical = aCase.__id__ ? { __id__: aCase.__id__ } : {}
    for (let key in aCase) {
        if (key !== "__id__") {
            let id = ds.attrIDFromName(key)
            if (id) {
                canonical[id] = (0, attribute_types_1.importValueToString)((_a = aCase[key]) !== null && _a !== void 0 ? _a : "")
            }
            else {
                console.warn("Dataset.toCanonical failed to convert attribute: \"".concat(key, "\""))
            }
        }
    }
    return canonical
}
function toCanonical(ds, cases) {
    return Array.isArray(cases)
        ? cases.map(function (aCase) { return toCanonicalCase(ds, aCase) })
        : toCanonicalCase(ds, cases)
}
exports.DataSet = v2_model_1.V2Model.named("DataSet").props({
    id: (0, codap_utils_1.typeV3Id)("DATA"),
    sourceID: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    // ordered parent-most to child-most
    collections: mobx_state_tree_1.types.array(collection_1.CollectionModel),
    attributesMap: mobx_state_tree_1.types.map(attribute_1.Attribute),
    _itemIds: mobx_state_tree_1.types.array(mobx_state_tree_1.types.string),
    sourceName: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    description: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    importDate: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    // for serialization only, not for dynamic selection tracking
    snapSelection: mobx_state_tree_1.types.array(mobx_state_tree_1.types.string),
    // hidden by user, e.g. set-aside in CODAP
    setAsideItemIds: mobx_state_tree_1.types.array(mobx_state_tree_1.types.string),
    filterFormula: mobx_state_tree_1.types.maybe(formula_1.Formula)
})
    .volatile(function (self) { return ({
    // map from attribute name to attribute id
    attrNameMap: mobx_1.observable.map({}, { name: "attrNameMap" }),
    // map from item ids to info like index and case ids
    itemInfoMap: new Map(),
    // MobX-observable set of selected item IDs
    selection: mobx_1.observable.set(),
    selectionChanges: 0,
    // MobX-observable set of hidden (set aside) item IDs
    setAsideItemIdsSet: mobx_1.observable.set(),
    // copy of setAsideItemIds used for change-detection
    setAsideItemIdsMirror: [],
    // map from case ID to the CaseInfo it represents
    caseInfoMap: new Map(),
    // map from item ID to the child case containing it
    // contains all items and child cases, including hidden ones
    itemIdChildCaseMap: new Map(),
    // incremented when collection parent/child links are updated
    syncCollectionLinksCount: 0,
    transactionCount: 0,
    // the id of the interactive frame handling this dataset
    // used by the Collaborative plugin
    managingControllerId: "",
    // cached result of filter formula evaluation for each item ID
    filteredOutItemIds: mobx_1.observable.set(),
    filterFormulaError: ""
}) })
    .extend(function (self) {
    let _validationCount = mobx_1.observable.box(0)
    let _isValidCases = mobx_1.observable.box(false)
    return {
        views: {
            get validationCount() {
                return _validationCount.get()
            },
            get isValidCases() {
                return _isValidCases.get()
            },
            invalidateCases () {
                (0, mobx_1.runInAction)(function () { return _isValidCases.set(false) })
            },
            setValidCases () {
                if (!_isValidCases.get()) {
                    (0, mobx_1.runInAction)(function () {
                        _validationCount.set(_validationCount.get() + 1)
                        _isValidCases.set(true)
                    })
                }
            }
        }
    }
})
    .volatile(function () {
    let cachingCount = 0
    let itemCache = new Map()
    return {
        get itemCache() {
            return itemCache
        },
        isCaching () {
            // Do not use getter here, as the result would be cached and not updated when cachingCount changes.
            // Note that it also happens for volatile properties, not only views.
            return cachingCount > 0
        },
        clearCache () {
            itemCache.clear()
        },
        beginCaching () {
            return ++cachingCount
        },
        _endCaching () {
            return --cachingCount
        }
    }
})
    .preProcessSnapshot(function (snap) {
    let _a, _b
    // convert legacy collections/attributes/cases implementation to current
    if ((0, data_set_conversion_1.isLegacyDataSetSnap)(snap)) {
        let _c = snap.collections, _collections = _c === void 0 ? [] : _c, _legacyAttributes = snap.attributes, ungrouped = snap.ungrouped, cases = snap.cases, itemIds = snap.itemIds, _d = snap.hiddenItemIds, hiddenItemIds = _d === void 0 ? [] : _d, others = __rest(snap, ["collections", "attributes", "ungrouped", "cases", "itemIds", "hiddenItemIds"])
        let attributeIds_1 = []
        // build the attributesMap (if necessary)
        let attributesMap_1 = {}
        if ((0, data_set_conversion_1.isOriginalDataSetSnap)(snap)) {
            var _attributes = snap.attributes
            _attributes.forEach(function (attr) {
                let attrId = attr.id || (0, codap_utils_1.v3Id)(codap_utils_1.kAttrIdPrefix)
                attributeIds_1.push(attrId)
                attributesMap_1[attrId] = {id: attrId, ...attr}
            })
        }
        // extract the attribute ids
        else if ((0, data_set_conversion_1.isTempDataSetSnap)(snap)) {
            var _attributes = snap.attributes
            attributeIds_1.push.apply(attributeIds_1, _attributes)
        }
        let collections = __spreadArray([], _collections, true)
        // identify parent attributes that shouldn't be in child collection
        let parentAttrs_1 = new Set()
        collections.forEach(function (collection) {
            let _a;
            (_a = collection.attributes) === null || _a === void 0 ? void 0 : _a.forEach(function (attrId) {
                attrId && parentAttrs_1.add(attrId)
            })
        })
        // identify child collection attributes
        let childAttrs_1 = []
        attributeIds_1 === null || attributeIds_1 === void 0 ? void 0 : attributeIds_1.forEach(function (attrId) {
            if (!parentAttrs_1.has(attrId)) {
                childAttrs_1.push(attrId)
            }
        })
        // create child collection
        let childCollection = {name: (0, translate_1.t)("DG.AppController.createDataSet.collectionName"), ...ungrouped, attributes: childAttrs_1}
        collections.push(childCollection)
        let _itemIds = (_b = (_a = cases === null || cases === void 0 ? void 0 : cases.map(function (_a) {
            let __id__ = _a.__id__
            return __id__
        })) !== null && _a !== void 0 ? _a : itemIds) !== null && _b !== void 0 ? _b : []
        return {attributesMap: attributesMap_1, collections, _itemIds, setAsideItemIds: hiddenItemIds, ...others}
    }
    return snap
})
    .views(function (self) { return ({
    isItemSetAside (itemId) {
        return self.setAsideItemIdsSet.has(itemId)
    },
    isItemFilteredOut (itemId) {
        return self.filteredOutItemIds.has(itemId)
    }
}) })
    .views(function (self) { return ({
    isItemHidden (itemId) {
        return self.isItemSetAside(itemId) || self.isItemFilteredOut(itemId)
    }
}) })
    .views(function (self) { return ({
    isCaseOrItemHidden (caseOrItemId) {
        // A case is hidden if all of its child items are hidden
        let caseInfo = self.caseInfoMap.get(caseOrItemId)
        if (caseInfo)
            {return caseInfo.childItemIds.length === 0 && caseInfo.hiddenChildItemIds.length > 0}
        return self.isItemHidden(caseOrItemId)
    }
}) })
    .views(function (self) { return ({
    // ids of items that have not been hidden (set aside) by user
    get itemsNotSetAside() {
        return self._itemIds.filter(function (itemId) { return !self.isItemSetAside(itemId) })
    },
    /**
     * ids of items that have not been hidden (set aside) or filtered by user
     * Note: this will not take into account any filtering applied at the visualization
     * level: visualization hidden cases, visualization filter formula, or displayOnlySelectedCases
     */
    get itemIds() {
        return self._itemIds.filter(function (itemId) { return !self.isItemHidden(itemId) })
    }
}) })
    .views(function (self) { return ({
    get attributes() {
        let attrs = []
        self.collections.forEach(function (collection) {
            collection.attributes.forEach(function (attr) {
                attr && attrs.push(attr)
            })
        })
        return attrs
    },
    get itemIdsHash() {
        // observable hash of visible (not set aside, not filtered out) item ids
        return (0, js_utils_1.hashStringSet)(self.itemIds)
    },
    get items() {
        return self.itemIds.map(function (id) { return ({ __id__: id }) })
    },
    get hasFilterFormula() {
        return !!self.filterFormula && !self.filterFormula.empty
    }
}) })
    .views(function (self) { return ({
    attrIndexFromID (id) {
        let index = self.attributes.findIndex(function (attr) { return attr.id === id })
        return index >= 0 ? index : undefined
    },
    get collectionIds() {
        return self.collections.map(function (collection) { return collection.id })
    },
    get childCollection() {
        return self.collections[self.collections.length - 1]
    },
    get attrNameMap() {
        let nameMap = mobx_1.observable.map({}, { name: "attrNameMap" })
        self.attributesMap.forEach(function (attr) {
            nameMap.set(attr.name, attr.id)
        })
        return nameMap
    }
}) })
    .views(function (self) { return ({
    getAttribute (id) {
        return self.attributesMap.get(id)
    },
    getAttributeByName (name) {
        let _a
        return self.attributesMap.get((_a = self.attrNameMap.get(name)) !== null && _a !== void 0 ? _a : "")
    },
    hasItem (itemId) {
        return !!self.itemInfoMap.get(itemId)
    },
    getItemIndex (itemId) {
        let _a
        return (_a = self.itemInfoMap.get(itemId)) === null || _a === void 0 ? void 0 : _a.index
    },
    getItemIndexForCaseOrItem (caseOrItemId) {
        let caseInfo = self.caseInfoMap.get(caseOrItemId)
        // for cases, returns index of first item
        let itemId = caseInfo ? caseInfo.childItemIds[0] : caseOrItemId
        return this.getItemIndex(itemId)
    },
    getItemCaseIds (itemId) {
        let _a, _b
        return (_b = (_a = self.itemInfoMap.get(itemId)) === null || _a === void 0 ? void 0 : _a.caseIds) !== null && _b !== void 0 ? _b : []
    },
    getItemChildCaseId (itemId) {
        let itemInfo = self.itemInfoMap.get(itemId)
        if (!itemInfo)
            {return}
        let childCaseIndex = itemInfo.caseIds.length - 1
        return itemInfo.caseIds[childCaseIndex]
    },
    itemIDFromIndex (index) {
        let _a
        return (_a = self.items[index]) === null || _a === void 0 ? void 0 : _a.__id__
    },
    nextItemID (id) {
        let index = this.getItemIndex(id), nextItem = (index != null) && (index < self.items.length - 1)
            ? self.items[index + 1] : undefined
        return nextItem === null || nextItem === void 0 ? void 0 : nextItem.__id__
    },
    addItemInfo (itemId, caseId) {
        let itemInfo = self.itemInfoMap.get(itemId)
        if (itemInfo) {
            itemInfo.caseIds.push(caseId)
        }
        else {
            console.warn("DataSet.addItemInfo called for missing item:", itemId)
        }
    }
}) })
    .actions(function (self) { return ({
    incSyncCollectionLinksCount () {
        ++self.syncCollectionLinksCount
    }
}) })
    .extend(function (self) {
    function getCollection(collectionId) {
        if (!(0, mobx_state_tree_1.isAlive)(self)) {
            console.warn("DataSet.getCollection called on a defunct DataSet")
            return
        }
        return self.collections.find(function (_a) {
            let id = _a.id
            return id === collectionId
        })
    }
    function getCollectionByName(collectionName) {
        if (!(0, mobx_state_tree_1.isAlive)(self)) {
            console.warn("DataSet.getCollectionByName called on a defunct DataSet")
            return
        }
        return self.collections.find(function (_a) {
            let name = _a.name
            return name === collectionName
        })
    }
    function getCollectionIndex(collectionId) {
        return self.collections.findIndex(function (_a) {
            let id = _a.id
            return id === collectionId
        })
    }
    function getCollectionForAttribute(attributeId) {
        return self.collections.find(function (coll) { return coll.getAttribute(attributeId) })
    }
    function getCollectionIndexForAttribute(attributeId) {
        let _a
        let id = (_a = getCollectionForAttribute(attributeId)) === null || _a === void 0 ? void 0 : _a.id
        return id ? getCollectionIndex(id) : undefined
    }
    function getUniqueCollectionName(name) {
        let suffix = 1
        let collectionName = name
        while (getCollectionByName(collectionName))
            {collectionName = "".concat(name).concat(suffix++)}
        return collectionName
    }
    return {
        views: {
            // get collection from id
            getCollection,
            // get collection from name
            getCollectionByName,
            // get index from collection
            getCollectionIndex,
            // get collection from attribute
            // undefined => attribute not present in dataset
            getCollectionForAttribute,
            getCollectionIndexForAttribute,
            getUniqueCollectionName
        },
        actions: {
            addCollection (collectionSnap, options) {
                let _a
                // ensure collection has a unique name
                let name = collectionSnap.name, rest = __rest(collectionSnap, ["name"])
                let _name = getUniqueCollectionName(name !== null && name !== void 0 ? name : "")
                let collection = {name: _name, ...rest}
                // place the collection in the correct location
                let beforeIndex = (options === null || options === void 0 ? void 0 : options.before) ? getCollectionIndex(options.before) : -1
                if (beforeIndex < 0 && (options === null || options === void 0 ? void 0 : options.after)) {
                    beforeIndex = getCollectionIndex(options.after)
                    if (beforeIndex >= 0 && beforeIndex < self.collections.length) {
                        ++beforeIndex
                    }
                }
                // by default, new collections are added before the default child collection
                if (beforeIndex < 0 && self.collections.length > 0) {
                    beforeIndex = self.collections.length - 1
                }
                if (beforeIndex >= 0) {
                    self.collections.splice(beforeIndex, 0, collection)
                }
                else {
                    // by default, new collections are added as the childmost collection
                    beforeIndex = self.collections.length
                    self.collections.push(collection)
                }
                let newCollection = self.collections[beforeIndex]
                // remove any attributes from other collections
                let attrIds = __spreadArray([], ((_a = collection.attributes) !== null && _a !== void 0 ? _a : []), true)
                attrIds === null || attrIds === void 0 ? void 0 : attrIds.forEach(function (attrId) {
                    let attrCollection = self.collections.find(function (_collection) {
                        return attrId && _collection !== newCollection && _collection.getAttribute("".concat(attrId))
                    })
                    if (attrId && attrCollection)
                        {attrCollection.removeAttribute("".concat(attrId))}
                })
                return newCollection
            },
            removeCollection (collection) {
                self.collections.remove(collection)
            }
        }
    }
})
    .actions(function (self) { return ({
    setManagingControllerId (id) {
        self.managingControllerId = id !== null && id !== void 0 ? id : ""
    },
    moveAttribute (attributeID, options) {
        let removedCollectionId
        let attribute = self.getAttribute(attributeID)
        let srcCollection = self.getCollectionForAttribute(attributeID)
        let dstCollection = (options === null || options === void 0 ? void 0 : options.before)
            ? self.getCollectionForAttribute(options.before)
            : (options === null || options === void 0 ? void 0 : options.after)
                ? self.getCollectionForAttribute(options.after)
                : (options === null || options === void 0 ? void 0 : options.collection)
                    ? self.getCollection(options.collection)
                    : undefined
        if (!attribute || !srcCollection)
            {return {}}
        if (!dstCollection || srcCollection === dstCollection) {
            srcCollection === null || srcCollection === void 0 ? void 0 : srcCollection.moveAttribute(attributeID, options)
        }
        else {
            if (attribute.hasFormula) {
                // If the attribute has a formula, we need to reset all the calculated values to blank values so that they
                // are not taken into account while calculating case grouping. After the grouping is done, the formula will
                // be re-evaluated, and the values will be updated to the correct values again.
                attribute.clearValues()
            }
            if (srcCollection.getAttribute(attributeID) && srcCollection.attributes.length === 1) {
                removedCollectionId = srcCollection.id
                self.removeCollection(srcCollection)
            }
            else {
                srcCollection.removeAttribute(attributeID)
            }
            dstCollection.addAttribute(attribute, options)
            // update grouping
            self.invalidateCases()
        }
        return { removedCollectionId }
    }
}) })
    .views(function (self) { return ({
    validateCases () {
        if (!self.isValidCases) {
            self.caseInfoMap.clear()
            let itemsToValidate_1 = new Set(self.itemInfoMap.keys())
            self.itemInfoMap.clear()
            self._itemIds.forEach(function (itemId, index) {
                self.itemInfoMap.set(itemId, { index, caseIds: [], isHidden: self.isCaseOrItemHidden(itemId) })
                itemsToValidate_1.delete(itemId)
            })
            self.collections.forEach(function (collection, index) {
                // update the cases
                collection.updateCaseGroups()
            })
            self.collections.forEach(function (collection, index) {
                // complete the case groups, including sorting child collection cases into groups
                let parentCaseGroups = index > 0 ? self.collections[index - 1].caseGroups : undefined
                collection.completeCaseGroups(parentCaseGroups)
                // update the caseGroupMap
                collection.caseGroupMap.forEach(function (group) { return self.caseInfoMap.set(group.groupedCase.__id__, group) })
            })
            self.itemIdChildCaseMap.clear()
            Array.from(self.childCollection.caseGroupMap.values()).forEach(function (caseGroup) {
                let _a
                self.itemIdChildCaseMap.set((_a = caseGroup.childItemIds[0]) !== null && _a !== void 0 ? _a : caseGroup.hiddenChildItemIds[0], caseGroup)
            })
            // delete removed items from selection
            itemsToValidate_1.forEach(function (itemId) {
                // update selection
                self.selection.delete(itemId)
            })
            self.setValidCases()
        }
    }
}) })
    .views(function (self) { return ({
    childCases () {
        self.validateCases()
        return self.collections[self.collections.length - 1].cases
    },
    getCollectionForCase (caseId) {
        self.validateCases()
        return self.collections.find(function (coll) { return coll.hasCase(caseId) })
    }
}) })
    .actions(function (self) { return ({
    clearFilterFormula () {
        self.filterFormula = undefined
        self.filteredOutItemIds.clear()
        self.filterFormulaError = ""
        self.invalidateCases()
    }
}) })
    .actions(function (self) { return ({
    hideCasesOrItems (caseOrItemIds) {
        caseOrItemIds.forEach(function (id) {
            let caseInfo = self.caseInfoMap.get(id)
            if (caseInfo) {
                caseInfo.childItemIds.forEach(function (itemId) {
                    if (!self.setAsideItemIdsSet.has(itemId)) {
                        self.setAsideItemIds.push(itemId)
                    }
                })
            }
            else if (self.itemInfoMap.get(id)) {
                if (!self.setAsideItemIdsSet.has(id)) {
                    self.setAsideItemIds.push(id)
                }
            }
        })
    },
    showHiddenCasesAndItems (caseOrItemIds) {
        if (caseOrItemIds) {
            caseOrItemIds.forEach(function (id) {
                let caseInfo = self.caseInfoMap.get(id)
                if (caseInfo) {
                    caseInfo.hiddenChildItemIds.forEach(function (itemId) {
                        let foundIndex = self.setAsideItemIds.findIndex(function (hiddenItemId) { return hiddenItemId === itemId })
                        if (foundIndex >= 0)
                            {self.setAsideItemIds.splice(foundIndex, 1)}
                    })
                }
                else if (self.itemInfoMap.get(id)) {
                    let foundIndex = self.setAsideItemIds.findIndex(function (hiddenItemId) { return hiddenItemId === id })
                    if (foundIndex >= 0)
                        {self.setAsideItemIds.splice(foundIndex, 1)}
                }
            })
        }
        else {
            // show all hidden cases/items
            self.setAsideItemIds.clear()
        }
    },
    setFilterFormula (display) {
        if (display) {
            if (!self.filterFormula) {
                self.filterFormula = formula_1.Formula.create({ display })
            }
            else {
                self.filterFormula.setDisplayExpression(display)
            }
        }
        else {
            self.clearFilterFormula()
        }
    },
    updateFilterFormulaResults (filterFormulaResults, _a) {
        let _b = _a.replaceAll, replaceAll = _b === void 0 ? false : _b
        if (replaceAll) {
            self.filteredOutItemIds.clear()
        }
        filterFormulaResults.forEach(function (_a) {
            let itemId = _a.itemId, result = _a.result
            if (result === false) {
                self.filteredOutItemIds.add(itemId)
            }
            else {
                // Note that if itemResult is undefined, it means the item has not been filtered out (e.g., there may not be any
                // filter formula), so it should be considered as having passed the filter.
                self.filteredOutItemIds.delete(itemId)
            }
        })
        self.invalidateCases()
    },
    setFilterFormulaError (error) {
        self.filterFormulaError = error
    }
}) })
    .actions(function (self) { return ({
    // if beforeCollectionId is not specified, new collection is parent of the child-most collection
    moveAttributeToNewCollection (attributeId, beforeCollectionId) {
        let attribute = self.getAttribute(attributeId)
        if (attribute) {
            let name_2 = (0, pluralize_1.default)(attribute.name)
            let collectionSnap = { name: name_2 }
            let collection = self.addCollection(collectionSnap, { before: beforeCollectionId })
            self.moveAttribute(attributeId, { collection: collection.id })
            return collection
        }
    }
}) })
    .views(function (self) { return ({
    getParentCollection (collectionId) {
        let foundIndex = self.collections.findIndex(function (collection) { return collection.id === collectionId })
        let parentIndex = foundIndex > 0 ? foundIndex - 1 : -1
        return parentIndex >= 0 ? self.collections[parentIndex] : undefined
    },
    getChildCollection (collectionId) {
        let foundIndex = self.collections.findIndex(function (collection) { return collection.id === collectionId })
        let childIndex = foundIndex < self.collections.length - 1 ? foundIndex + 1 : -1
        return childIndex >= 0 ? self.collections[childIndex] : undefined
    },
    getGroupsForCollection (collectionId) {
        let _a, _b
        self.validateCases()
        return (_b = (_a = self.getCollection(collectionId)) === null || _a === void 0 ? void 0 : _a.caseGroups) !== null && _b !== void 0 ? _b : []
    }
}) })
    .views(function (self) { return ({
    getCasesForCollection (collectionId) {
        let _a, _b
        self.validateCases()
        return (_b = (_a = self.getCollection(collectionId)) === null || _a === void 0 ? void 0 : _a.cases) !== null && _b !== void 0 ? _b : []
    },
    getParentCase (caseId, collectionId) {
        let _a, _b, _c
        self.validateCases()
        let parentCollectionId = (_b = (_a = self.getCollection(collectionId)) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.id
        return (_c = self.getCollection(parentCollectionId)) === null || _c === void 0 ? void 0 : _c.findParentCaseGroup(caseId)
    },
    getCollectionForAttributes (attributeIds) {
        self.validateCases()
        let _loop_1 = function (i) {
            let collection = self.collections[i]
            if (attributeIds.some(function (attrId) { return collection.getAttribute(attrId) })) {
                return { value: collection }
            }
        }
        for (let i = self.collections.length - 1; i >= 0; --i) {
            let state_1 = _loop_1(i)
            if (typeof state_1 === "object")
                {return state_1.value}
        }
    },
    getCasesForAttributes (attributeIds) {
        let _a
        let collection = this.getCollectionForAttributes(attributeIds)
        return (_a = collection === null || collection === void 0 ? void 0 : collection.cases) !== null && _a !== void 0 ? _a : []
    },
    getItemsForCases (cases) {
        let items = []
        cases.forEach(function (aCase) {
            let _a
            // convert each case change to a change to each underlying item
            let caseGroup = self.caseInfoMap.get(aCase.__id__)
            if ((_a = caseGroup === null || caseGroup === void 0 ? void 0 : caseGroup.childItemIds) === null || _a === void 0 ? void 0 : _a.length) {
                items.push.apply(items, caseGroup.childItemIds.map(function (id) { return ({...aCase, __id__: id}) }))
            }
            else {
                // items can be added directly
                items.push(aCase)
            }
        })
        return items
    }
}) })
    .extend(function (self) {
    /*
     * private closure
     */
    let attrIDFromName = function (name) { return self.attrNameMap.get(name) }
    function getItem(itemID, options) {
        let index = self.getItemIndex(itemID)
        if (index == null) {
            return undefined
        }
        let _a = options || {}, _b = _a.canonical, canonical = _b === void 0 ? true : _b, _c = _a.numeric, numeric = _c === void 0 ? true : _c
        let item = { __id__: itemID }
        self.attributes.forEach(function (attr) {
            let key = canonical ? attr.id : attr.name
            item[key] = numeric ? attr.value(index) : attr.strValue(index)
        })
        return item
    }
    function getItems(itemIDs, options) {
        let items = []
        itemIDs.forEach(function (caseID) {
            let item = getItem(caseID, options)
            if (item) {
                items.push(item)
            }
        })
        return items
    }
    function getItemAtIndex(index, options) {
        let item = self.items[index], id = item === null || item === void 0 ? void 0 : item.__id__
        return id ? getItem(id, options) : undefined
    }
    function setItemValues(caseValues) {
        let index = self.getItemIndex(caseValues.__id__)
        if (index == null) {
            return
        }
        for (let key in caseValues) {
            if (key !== "__id__") {
                let attribute = self.getAttribute(key)
                if (attribute) {
                    let value = caseValues[key]
                    attribute.setValue(index, value != null ? value : undefined)
                }
            }
        }
    }
    return {
        /*
         * public views
         */
        views: {
            // [DEPRECATED] use getAttribute() instead
            attrFromID (id) {
                return self.getAttribute(id)
            },
            // [DEPRECATED] use getAttributeByName() instead
            attrFromName (name) {
                let id = self.attrNameMap.get(name)
                return id ? self.getAttribute(id) : undefined
            },
            attrIDFromName,
            hasCase (caseId) {
                return !!self.caseInfoMap.get(caseId)
            },
            getValue (caseID, attributeID) {
                let index = self.getItemIndexForCaseOrItem(caseID)
                return index != null ? this.getValueAtItemIndex(index, attributeID) : undefined
            },
            getValueAtItemIndex (index, attributeID) {
                let _a
                if (self.isCaching()) {
                    let itemId = (_a = self.items[index]) === null || _a === void 0 ? void 0 : _a.__id__
                    let cachedItem = self.itemCache.get(itemId)
                    if (cachedItem && Object.prototype.hasOwnProperty.call(cachedItem, attributeID)) {
                        return cachedItem[attributeID]
                    }
                }
                let attr = self.getAttribute(attributeID)
                return attr === null || attr === void 0 ? void 0 : attr.value(index)
            },
            getStrValue (caseID, attributeID) {
                let index = self.getItemIndexForCaseOrItem(caseID)
                return index != null ? this.getStrValueAtItemIndex(index, attributeID) : ""
            },
            getStrValueAtItemIndex (itemIndex, attributeID) {
                let _a, _b, _c
                if (self.isCaching()) {
                    let itemId = (_a = self.items[itemIndex]) === null || _a === void 0 ? void 0 : _a.__id__
                    let cachedItem = self.itemCache.get(itemId)
                    if (cachedItem && Object.prototype.hasOwnProperty.call(cachedItem, attributeID)) {
                        return (_b = cachedItem[attributeID]) === null || _b === void 0 ? void 0 : _b.toString()
                    }
                }
                let attr = self.getAttribute(attributeID)
                return (_c = attr === null || attr === void 0 ? void 0 : attr.strValue(itemIndex)) !== null && _c !== void 0 ? _c : ""
            },
            getNumeric (caseID, attributeID) {
                let index = self.getItemIndexForCaseOrItem(caseID)
                return index != null ? this.getNumericAtItemIndex(index, attributeID) : undefined
            },
            getNumericAtItemIndex (index, attributeID) {
                let _a
                if (self.isCaching()) {
                    let itemId = (_a = self.items[index]) === null || _a === void 0 ? void 0 : _a.__id__
                    let cachedItem = self.itemCache.get(itemId)
                    if (cachedItem && Object.prototype.hasOwnProperty.call(cachedItem, attributeID)) {
                        return Number(cachedItem[attributeID])
                    }
                }
                let attr = self.getAttribute(attributeID)
                return attr === null || attr === void 0 ? void 0 : attr.numValue(index)
            },
            getItem,
            getItems,
            getItemAtIndex,
            getItemsAtIndex (start, options) {
                if (start === void 0) { start = 0 }
                let _a = (options || {}).count, count = _a === void 0 ? self.items.length : _a
                let endIndex = Math.min(start + count, self.items.length), cases = []
                for (let i = start; i < endIndex; ++i) {
                    cases.push(getItemAtIndex(i, options))
                }
                return cases
            },
            getFirstItemForCase (caseId, options) {
                let _a
                let itemId = (_a = self.caseInfoMap.get(caseId)) === null || _a === void 0 ? void 0 : _a.childItemIds[0]
                return itemId ? getItem(itemId, { numeric: false }) : undefined
            },
            isCaseSelected (caseId) {
                // a pseudo-case is selected if all of its individual cases are selected
                let group = self.caseInfoMap.get(caseId)
                return group
                    ? group.childItemIds.every(function (id) { return self.selection.has(id) })
                    : self.selection.has(caseId)
            },
            get isInTransaction() {
                return self.transactionCount > 0
            }
        },
        /*
         * public actions
         *
         * These actions are used to identify potentially undoable actions and to trigger responses via
         * onAction handlers, etc. As such, responder convenience is prioritized over caller convenience.
         * For instance, rather than separate APIs for setting a single case value, setting a single case,
         * and setting multiple cases, there's a single function for setting multiple cases.
         */
        actions: {
            beginTransaction () {
                ++self.transactionCount
            },
            endTransaction () {
                --self.transactionCount
            },
            // should be called before retrieving snapshot (pre-serialization)
            prepareSnapshot () {
                // move volatile data into serializable properties
                (0, without_undo_1.withoutUndo)({ suppressWarning: true })
                self.collections.forEach(function (collection) { return collection.prepareSnapshot() })
                self.attributes.forEach(function (attr) { return attr.prepareSnapshot() })
                self.snapSelection.replace(Array.from(self.selection))
            },
            // should be called after retrieving snapshot (post-serialization)
            completeSnapshot () {
                // move data back into volatile storage for efficiency
                (0, without_undo_1.withoutUndo)({ suppressWarning: true })
                self.collections.forEach(function (collection) { return collection.completeSnapshot() })
                self.attributes.forEach(function (attr) { return attr.completeSnapshot() })
            },
            setName (name) {
                self.name = name
            },
            setSourceName (source) {
                self.sourceName = source
            },
            setImportDate (date) {
                self.importDate = date
            },
            setDescription (description) {
                self.description = description
            },
            addAttribute (snapshot, options) {
                let _a, _b
                let _c = options || {}, beforeID = _c.before, collectionId = _c.collection
                // add attribute to attributesMap
                let collection
                let attribute = self.attributesMap.put(snapshot)
                // fill out any missing values
                // for (let i = attribute.strValues.length; i < self.cases.length; ++i) {
                for (let i = attribute.strValues.length; i < self._itemIds.length; ++i) {
                    attribute.addValue()
                }
                // add attribute reference to attributes array
                let beforeIndex = beforeID ? (_a = self.attrIndexFromID(beforeID)) !== null && _a !== void 0 ? _a : -1 : -1
                if (beforeID && beforeIndex >= 0) {
                    collection = self.getCollectionForAttribute(beforeID)
                    let collectionBeforeIndex = (_b = collection === null || collection === void 0 ? void 0 : collection.attributes.findIndex(function (attr) { return (attr === null || attr === void 0 ? void 0 : attr.id) === beforeID })) !== null && _b !== void 0 ? _b : -1
                    if (collectionBeforeIndex >= 0) {
                        collection === null || collection === void 0 ? void 0 : collection.attributes.splice(collectionBeforeIndex, 0, attribute.id)
                    }
                    return attribute
                }
                // add the attribute to the specified collection (if any) or the childmost collection
                if (!collection && collectionId) {
                    collection = self.getCollection(collectionId)
                }
                if (!collection)
                    {collection = self.childCollection}
                collection.addAttribute(attribute)
                return attribute
            },
            setAttributeName (attributeID, name) {
                let attribute = attributeID && self.getAttribute(attributeID)
                if (attribute) {
                    let nameStr = typeof name === "string" ? name : name()
                    if (nameStr !== attribute.name) {
                        attribute.setName(nameStr)
                    }
                }
            },
            removeAttribute (attributeID) {
                let result = {}
                let attribute = self.getAttribute(attributeID)
                if (attribute) {
                    // remove attribute from any collection
                    let collection = self.getCollectionForAttribute(attributeID)
                    if ((0, collection_1.isCollectionModel)(collection)) {
                        if (collection.attributes.length > 1) {
                            collection.removeAttribute(attributeID)
                        }
                        else if (self.collections.length > 1) {
                            result.removedCollectionId = collection.id
                            self.removeCollection(collection)
                        }
                    }
                    // remove attribute from attributesMap
                    self.attributesMap.delete(attribute.id)
                }
                return result
            },
            // TODO: This is really adding items rather than cases. A true addCases would treat any
            // provided ids as case ids rather than item ids, would allow the client to specify a
            // target collection and/or parent case, etc. Not sure at the moment whether there
            // should be two separate functions or whether one function can suffice, and if the
            // latter, whether it should be named addCases or addItems.
            addCases (cases, options) {
                let _a, _b
                let _c, _d, _e, _f
                let _g = options || {}, before = _g.before, after = _g.after
                let beforePosition = before
                    ? (_c = self.getItemIndex(before)) !== null && _c !== void 0 ? _c : self.getItemIndex((_e = (_d = self.caseInfoMap.get(before)) === null || _d === void 0 ? void 0 : _d.childItemIds[0]) !== null && _e !== void 0 ? _e : "")
                    : undefined
                let getAfterPosition = function () {
                    if (!after)
                        {return}
                    // If after is an item id, return one index after that item
                    let afterItemIndex = self.getItemIndex(after)
                    if (afterItemIndex != null)
                        {return afterItemIndex + 1}
                    // If after is a case id, find its last item and return one index after that
                    let afterCase = self.caseInfoMap.get(after)
                    if (!(afterCase === null || afterCase === void 0 ? void 0 : afterCase.childItemIds.length))
                        {return}
                    let afterCaseItemId = afterCase.childItemIds[afterCase.childItemIds.length - 1]
                    let afterCaseItemIndex = self.getItemIndex(afterCaseItemId)
                    if (afterCaseItemIndex)
                        {return afterCaseItemIndex + 1}
                }
                let afterPosition = getAfterPosition()
                let insertPosition = (_f = beforePosition !== null && beforePosition !== void 0 ? beforePosition : afterPosition) !== null && _f !== void 0 ? _f : self._itemIds.length
                // insert/append cases and empty values
                let ids = cases.map(function (_a) {
                    let _b = _a.__id__, __id__ = _b === void 0 ? (0, codap_utils_1.v3Id)(codap_utils_1.kItemIdPrefix) : _b
                    return __id__
                })
                let _values = new Array(cases.length)
                if (insertPosition < self._itemIds.length) {
                    (_a = self._itemIds).splice.apply(_a, __spreadArray([insertPosition, 0], ids, false))
                    // update the indices of cases after the insert
                    self.itemInfoMap.forEach(function (itemInfo, caseId) {
                        if (itemInfo.index >= insertPosition) {
                            itemInfo.index += cases.length
                        }
                    })
                    // insert values for each attribute
                    self.attributesMap.forEach(function (attr) {
                        attr.addValues(_values, insertPosition)
                    })
                }
                else {
                    (_b = self._itemIds).push.apply(_b, ids)
                    // append values to each attribute
                    self.attributesMap.forEach(function (attr) {
                        attr.setLength(self._itemIds.length)
                    })
                }
                // add the itemInfo for the appended cases
                ids.forEach(function (caseId, index) {
                    self.itemInfoMap.set(caseId, { index: insertPosition + index, caseIds: [], isHidden: false })
                })
                // copy any values provided
                let attrs = new Set()
                cases.forEach(function (aCase, index) {
                    for (let key in aCase) {
                        let value = aCase[key]
                        if (value != null) {
                            let attrId = (options === null || options === void 0 ? void 0 : options.canonicalize) ? self.attrNameMap.get(key) : key
                            let attr = attrId && self.getAttribute(attrId)
                            if (attr) {
                                attrs.add(attrId)
                                attr.setValue(insertPosition + index, value, { noInvalidate: true })
                            }
                        }
                    }
                })
                // invalidate the affected attributes
                attrs.forEach(function (attrId) { let _a; return (_a = self.getAttribute(attrId)) === null || _a === void 0 ? void 0 : _a.incChangeCount() })
                return ids
            },
            // Supports items or cases, but not mixing the two.
            // For cases, will set the values of all items in the group
            // regardless of whether the attribute is grouped or not.
            // `affectedAttributes` are not used in the function, but are present as a potential
            // optimization for responders, as all arguments are available to `onAction` listeners.
            // For instance, a scatter plot that is dragging many points but affecting only two
            // attributes can indicate that, which can enable more efficient responses.
            setCaseValues (cases, affectedAttributes) {
                let items = self.getItemsForCases(cases)
                if (self.isCaching()) {
                    // update the cases in the cache
                    items.forEach(function (item) {
                        let cached = self.itemCache.get(item.__id__)
                        if (!cached) {
                            self.itemCache.set(item.__id__, { ...item})
                        }
                        else {
                            Object.assign(cached, item)
                        }
                    })
                }
                else {
                    items.forEach(function (caseValues) {
                        setItemValues(caseValues)
                    })
                }
                // only changes to parent collection attributes invalidate grouping
                items.length && self.invalidateCases()
            },
            removeCases (caseIDs) {
                let _a, _b
                // Remove the items last -> first, so we only have to update itemInfo once
                let items = caseIDs.map(function (id) { return ({ id, index: self.getItemIndex(id) }) })
                    .filter(function (info) { return info.index != null })
                items.sort(function (a, b) { return b.index - a.index })
                let firstIndex = (_b = (_a = items[items.length - 1]) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1
                items.forEach(function (_a) {
                    let caseID = _a.id, index = _a.index
                    self._itemIds.splice(index, 1)
                    self.attributes.forEach(function (attr) {
                        attr.removeValues(index)
                    })
                    self.selection.delete(caseID)
                    self.itemInfoMap.delete(caseID)
                })
                if (firstIndex >= 0) {
                    for (let i = firstIndex; i < self._itemIds.length; ++i) {
                        let itemId = self._itemIds[i]
                        let itemInfo = self.itemInfoMap.get(itemId)
                        if (itemInfo)
                            {itemInfo.index = i}
                    }
                }
            },
            moveItems (itemIds, options) {
                let _a
                let _b
                let indices = itemIds.map(function (itemId) { return self.getItemIndex(itemId) }).filter(function (index) { return index != null })
                    .sort(function (a, b) { return b - a }) // Reverse order
                let items = indices.map(function (index) {
                    let item = { index, item: self.items[index], values: [] }
                    self.attributes.forEach(function (attr) { return item.values.push({
                        strValue: attr.strValues[index],
                        numValue: attr.numValues[index]
                    }) })
                    return item
                }).reverse() // Normal order
                // Remove from ordered arrays
                indices.forEach(function (index) {
                    self._itemIds.splice(index, 1)
                    self.attributes.forEach(function (attr) { return attr.removeValues(index) })
                })
                // Determine position to re-insert items
                let beforeIndex = (options === null || options === void 0 ? void 0 : options.before) ? self._itemIds.indexOf(options.before) : undefined
                let afterIndex = (options === null || options === void 0 ? void 0 : options.after) ? self._itemIds.indexOf(options.after) + 1 : undefined
                let insertIndex = (_b = afterIndex !== null && afterIndex !== void 0 ? afterIndex : beforeIndex) !== null && _b !== void 0 ? _b : self._itemIds.length;
                // Add back to ordered arrays
                (_a = self._itemIds).splice.apply(_a, __spreadArray([insertIndex, 0], items.map(function (_a) {
                    let item = _a.item
                    return item.__id__
                }), false))
                self.attributes.forEach(function (attr, index) {
                    let _a, _b;
                    (_a = attr.strValues).splice.apply(_a, __spreadArray([insertIndex, 0], items.map(function (_a) {
                        let values = _a.values
                        return values[index].strValue
                    }), false));
                    (_b = attr.numValues).splice.apply(_b, __spreadArray([insertIndex, 0], items.map(function (_a) {
                        let values = _a.values
                        return values[index].numValue
                    }), false))
                })
                // Fix indices
                for (let i = 0; i < self._itemIds.length; ++i) {
                    let itemId = self._itemIds[i]
                    let itemInfo = self.itemInfoMap.get(itemId)
                    if (itemInfo)
                        {itemInfo.index = i}
                }
            },
            selectAll (select) {
                if (select === void 0) { select = true }
                if (select) {
                    self.items.forEach(function (_a) {
                        let __id__ = _a.__id__
                        return self.selection.add(__id__)
                    })
                }
                else {
                    self.selection.clear()
                }
                ++self.selectionChanges
            },
            selectCases (caseIds, select) {
                if (select === void 0) { select = true }
                let ids = []
                caseIds.forEach(function (id) {
                    let caseInfo = self.caseInfoMap.get(id)
                    if (caseInfo) {
                        ids.push.apply(ids, caseInfo.childItemIds)
                    }
                    else {
                        ids.push(id)
                    }
                })
                ids.forEach(function (id) {
                    if (select) {
                        self.selection.add(id)
                    }
                    else {
                        self.selection.delete(id)
                    }
                })
                ++self.selectionChanges
            },
            setSelectedCases (caseIds) {
                let ids = []
                caseIds.forEach(function (id) {
                    let caseInfo = self.caseInfoMap.get(id)
                    if (caseInfo) {
                        ids.push.apply(ids, caseInfo.childItemIds)
                    }
                    else {
                        ids.push(id)
                    }
                })
                self.selection.replace(ids)
                ++self.selectionChanges
            }
        }
    }
})
    .views(function (self) { return ({
    getParentValues (parentId) {
        let parentCase = self.caseInfoMap.get(parentId)
        let parentCollection = self.getCollection(parentCase === null || parentCase === void 0 ? void 0 : parentCase.collectionId)
        let values = {}
        parentCollection === null || parentCollection === void 0 ? void 0 : parentCollection.allAttributes.forEach(function (attr) {
            let attrValue = self.getStrValue(parentId, attr.id)
            if (attrValue) {
                values[attr.id] = attrValue
            }
        })
        return values
    }
}) })
    .actions(function (self) { return ({
    afterCreate () {
        let context = (0, mobx_state_tree_1.hasEnv)(self) ? (0, mobx_state_tree_1.getEnv)(self) : {}, srcDataSet = context.srcDataSet
        // build itemIDMap
        self._itemIds.forEach(function (itemId, index) {
            self.itemInfoMap.set(itemId, { index, caseIds: [], isHidden: self.isCaseOrItemHidden(itemId) })
        })
        // make sure attributes have appropriate length, including attributes with formulas
        self.attributesMap.forEach(function (attr) {
            attr.setLength(self._itemIds.length)
        })
        // add initial collection if not already present
        if (!self.collections.length) {
            self.addCollection({ name: (0, translate_1.t)("DG.AppController.createDataSet.collectionName") })
        }
        // initialize selection
        self.selection.replace(self.snapSelection)
        // initialize setAsideItemIdsSet
        self.setAsideItemIdsSet.replace(self.setAsideItemIds)
        if (!srcDataSet) {
            // set up middleware to add ids to inserted attributes and cases
            // adding the ids in middleware makes them available as action arguments
            // to derived DataSets.
            (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_state_tree_1.addMiddleware)(self, function (call, next) {
                if (call.context === self && call.name === "addAttribute") {
                    let _a = call.args[0], _b = _a.id, id = _b === void 0 ? (0, codap_utils_1.v3Id)(codap_utils_1.kAttrIdPrefix) : _b, others = __rest(_a, ["id"])
                    call.args[0] = {id, ...others}
                }
                else if (call.context === self && call.name === "addCases") {
                    call.args[0] = call.args[0].map(function (iCase) {
                        let _a = iCase.__id__, __id__ = _a === void 0 ? (0, codap_utils_1.v3Id)(codap_utils_1.kItemIdPrefix) : _a, others = __rest(iCase, ["__id__"])
                        return {__id__, ...others}
                    })
                }
                next(call)
            }));
            // when collections change...
            (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_1.reaction)(function () { return self.collectionIds }, function () {
                // update parent/child links and provide access to item data
                let itemData = {
                    itemIds () { return self._itemIds },
                    isHidden (itemId) { return self.isCaseOrItemHidden(itemId) },
                    getValue (itemId, attrId) { let _a; return (_a = self.getStrValue(itemId, attrId)) !== null && _a !== void 0 ? _a : "" },
                    addItemInfo (itemId, caseId) { return self.addItemInfo(itemId, caseId) },
                    invalidate () { return self.invalidateCases() }
                };
                (0, collection_1.syncCollectionLinks)(self.collections, itemData)
                self.incSyncCollectionLinksCount()
                self.invalidateCases()
            }, { name: "DataSet.collections", equals: mobx_1.comparer.structural, fireImmediately: true }));
            // when items are added/removed...
            // use MST's onPatch mechanism to respond to additions/removals of items and their undo/redo
            (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_state_tree_1.onPatch)(self, function (_a) {
                let op = _a.op, path = _a.path, value = _a.value
                if (/_itemIds(\/\d+)?$/.test(path)) {
                    self.invalidateCases()
                }
            }));
            // when items are hidden/shown...
            // Use MST's onPatch mechanism to respond to changes to the `setAsideItemIds`.
            // This will be called once for each item added/removed and will update related properties.
            (0, mobx_state_tree_1.addDisposer)(self, (0, mobx_state_tree_1.onPatch)(self, function (_a) {
                let op = _a.op, path = _a.path, value = _a.value
                let match = null
                if ((op === "add" || op === "remove") && (match = /setAsideItemIds\/(\d+)$/.exec(path))) {
                    let index = +match[1]
                    if (op === "add") {
                        var itemId = value
                        self.setAsideItemIdsMirror.splice(index, 0, itemId)
                        self.setAsideItemIdsSet.add(itemId)
                    }
                    else {
                        var itemId = self.setAsideItemIdsMirror[index]
                        self.setAsideItemIdsMirror.splice(index, 1)
                        self.setAsideItemIdsSet.delete(itemId)
                    }
                    self.invalidateCases()
                }
                if ((op === "replace") && /setAsideItemIds$/.test(path)) {
                    let replacementArray = value
                    self.setAsideItemIdsMirror = __spreadArray([], replacementArray, true)
                    self.setAsideItemIdsSet.replace(mobx_1.observable.set(replacementArray))
                    self.invalidateCases()
                }
            }))
        }
    },
    commitCache () {
        self.setCaseValues(Array.from(self.itemCache.values()))
    },
    endCaching (commitCache) {
        if (commitCache === void 0) { commitCache = false }
        if (self._endCaching() === 0) {
            commitCache && this.commitCache()
            self.clearCache()
        }
    },
    removeCollectionWithAttributes (collection) {
        collection.attributes.forEach(function (attribute) {
            if (attribute) {
                collection.removeAttribute(attribute.id)
                self.removeAttribute(attribute.id)
            }
        })
        self.removeCollection(collection)
    },
    sortByAttribute (attributeId, direction) {
        if (direction === void 0) { direction = "ascending" }
        self.validateCases()
        let compareFn = function (aItemId, bItemId) {
            let aValue = self.getValue(aItemId, attributeId)
            let bValue = self.getValue(bItemId, attributeId)
            let compareResult = (0, data_utils_1.compareValues)(aValue, bValue, locale_1.gLocale.compareStrings)
            return direction === "descending" ? -compareResult : compareResult
        }
        let finalItemIds = Array.from(self._itemIds)
        let itemIdToIndexMap = {}
        self._itemIds.forEach(function (itemId, beforeIndex) { return itemIdToIndexMap[itemId] = { beforeIndex, afterIndex: -1 } })
        let collection = self.getCollectionForAttribute(attributeId)
        let parentCollection = collection === null || collection === void 0 ? void 0 : collection.parent
        // if there's a parent collection, items are sorted within their parent cases
        if (parentCollection) {
            parentCollection.caseGroups.forEach(function (group) {
                // combine all the child item ids for this parent case
                let origGroupItemIds = __spreadArray(__spreadArray([], group.childItemIds, true), group.hiddenChildItemIds, true)
                // sort them into their original order
                origGroupItemIds.sort(function (aItemId, bItemId) {
                    return itemIdToIndexMap[aItemId].beforeIndex - itemIdToIndexMap[bItemId].beforeIndex
                })
                // sort them into their sorted order
                let sortedGroupItemIds = origGroupItemIds.slice()
                sortedGroupItemIds.sort(compareFn)
                // map indices from original to sorted
                sortedGroupItemIds.forEach(function (itemId, index) {
                    let origItemIdAtIndex = origGroupItemIds[index]
                    itemIdToIndexMap[itemId].afterIndex = itemIdToIndexMap[origItemIdAtIndex].beforeIndex
                })
                // sort the items into their appropriate sorted locations
                finalItemIds.sort(function (aItemId, bItemId) {
                    return itemIdToIndexMap[aItemId].afterIndex - itemIdToIndexMap[bItemId].afterIndex
                })
            })
        }
        // if no parent collection, items can be sorted globally
        else {
            finalItemIds.sort(compareFn)
            finalItemIds.forEach(function (itemId, index) { return itemIdToIndexMap[itemId].afterIndex = index })
        }
        // if no changes then nothing to do
        if (finalItemIds.every(function (itemId, index) { return itemId === self._itemIds[index] }))
            {return}
        // apply the index mapping to each attribute's value arrays
        let origIndices = finalItemIds.map(function (itemId) { return itemIdToIndexMap[itemId].beforeIndex })
        self.attributes.forEach(function (attr) { return attr.orderValues(origIndices) })
        // update the _itemIds array
        self._itemIds.replace(finalItemIds)
        return itemIdToIndexMap
    }
}) })
    // performs the specified action so that response actions are included and undo/redo strings assigned
    .actions(apply_model_change_1.applyModelChange)
function isFilterFormulaDataSet(dataSet) {
    return !!(dataSet === null || dataSet === void 0 ? void 0 : dataSet.hasFilterFormula)
}
