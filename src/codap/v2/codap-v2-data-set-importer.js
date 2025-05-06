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
exports.CodapV2DataSetImporter = void 0
let data_set_1 = require("../models/data/data-set")
let v2_model_1 = require("../models/data/v2-model")
let codap_utils_1 = require("../utilities/codap-utils")
let codap_v2_data_set_types_1 = require("./codap-v2-data-set-types")
let CodapV2DataSetImporter = /** @class */ (function () {
    function CodapV2DataSetImporter(guidMap, v3AttrMap) {
        // index into the array is `level`
        this.v2CaseIdInfoArray = []
        this.guidMap = guidMap
        this.v3AttrMap = v3AttrMap
    }
    CodapV2DataSetImporter.prototype.getParentCase = function (aCase) {
        let _a
        let parentCaseId = aCase.parent
        return parentCaseId != null ? (_a = this.guidMap.get(parentCaseId)) === null || _a === void 0 ? void 0 : _a.object : undefined
    }
    CodapV2DataSetImporter.prototype.importContext = function (context, dataSet, caseMetadata) {
        let _a = context.collections, collections = _a === void 0 ? [] : _a
        this.registerCollections(dataSet, caseMetadata, collections)
        this.registerSetAsideItems(dataSet, context.setAsideItems)
    }
    CodapV2DataSetImporter.prototype.registerCollections = function (data, caseMetadata, collections) {
        let _this = this
        let prevCollection
        collections.forEach(function (collection, index) {
            let _a = collection.attrs, attrs = _a === void 0 ? [] : _a, _b = collection.cases, cases = _b === void 0 ? [] : _b, guid = collection.guid, _c = collection.name, name = _c === void 0 ? "" : _c, title = collection.title, _d = collection.type, type = _d === void 0 ? "DG.Collection" : _d
            let _title = (0, v2_model_1.v2NameTitleToV3Title)(name, title)
            _this.guidMap.set(guid, { type, object: collection })
            // assumes hierarchical collections are in order parent => child
            let level = collections.length - index - 1 // 0 === child-most
            _this.v2CaseIdInfoArray[level] = { groupAttrNames: [], groupKeyCaseIds: new Map() }
            _this.registerAttributes(data, caseMetadata, attrs, level)
            _this.registerCases(data, cases, level)
            let attributes = attrs.map(function (attr) {
                let attrModel = data.attrFromName(attr.name)
                return attrModel === null || attrModel === void 0 ? void 0 : attrModel.id
            }).filter(function (attrId) { return !!attrId })
            let collectionSnap = {
                id: (0, codap_utils_1.toV3CollectionId)(guid),
                name,
                _title,
                attributes,
                _groupKeyCaseIds: Array.from(_this.v2CaseIdInfoArray[level].groupKeyCaseIds.entries())
            }
            // remove default collection
            if (index === 0) {
                data.removeCollection(data.collections[0])
            }
            // add the imported collections
            prevCollection = data.addCollection(collectionSnap, { after: prevCollection === null || prevCollection === void 0 ? void 0 : prevCollection.id })
        })
    }
    CodapV2DataSetImporter.prototype.registerAttributes = function (data, caseMetadata, attributes, level) {
        let _this = this
        let v2CaseIdInfo = this.v2CaseIdInfoArray[level]
        let v2ParentCaseIdInfo = this.v2CaseIdInfoArray[level + 1]
        if (v2ParentCaseIdInfo) {
            // grouping attribute are cumulative, i.e. include all parent attributes
            v2CaseIdInfo.groupAttrNames = __spreadArray([], v2ParentCaseIdInfo.groupAttrNames, true)
        }
        attributes.forEach(function (v2Attr) {
            let _cid = v2Attr.cid, guid = v2Attr.guid, v2Description = v2Attr.description, _a = v2Attr.name, name = _a === void 0 ? "" : _a, v2Title = v2Attr.title, v2Type = v2Attr.type, v2Formula = v2Attr.formula, v2Editable = v2Attr.editable, v2Unit = v2Attr.unit, v2Precision = v2Attr.precision
            if (!v2Formula) {
                v2CaseIdInfo.groupAttrNames.push(name)
            }
            let _title = (0, v2_model_1.v2NameTitleToV3Title)(name, v2Title)
            let description = v2Description !== null && v2Description !== void 0 ? v2Description : undefined
            let userType = (0, codap_v2_data_set_types_1.v3TypeFromV2TypeString)(v2Type)
            let formula = v2Formula ? { display: v2Formula } : undefined
            let editable = v2Editable == null || !!v2Editable
            let precision = v2Precision == null || v2Precision === "" ? undefined : +v2Precision
            let units = v2Unit !== null && v2Unit !== void 0 ? v2Unit : undefined
            _this.guidMap.set(guid, { type: "DG.Attribute", object: v2Attr })
            let attribute = data.addAttribute({
                id: (0, codap_utils_1.toV3AttrId)(guid),
                _cid,
                name,
                description,
                formula,
                _title,
                userType,
                editable,
                units,
                precision
            })
            if (attribute) {
                _this.v3AttrMap.set(guid, attribute)
                if (v2Attr.hidden) {
                    caseMetadata.setIsHidden(attribute.id, true)
                }
            }
        })
    }
    CodapV2DataSetImporter.prototype.registerCases = function (data, cases, level) {
        let _this = this
        let itemsToAdd = []
        let v2CollectionInfo = this.v2CaseIdInfoArray[level]
        let groupKeyCaseIds = v2CollectionInfo.groupKeyCaseIds
        cases.forEach(function (_case) {
            // some v2 documents don't store item ids, so we generate them if necessary
            let guid = _case.guid, _a = _case.itemID, itemID = _a === void 0 ? (0, codap_utils_1.v3Id)(codap_utils_1.kItemIdPrefix) : _a, values = _case.values
            let v3CaseId = (0, codap_utils_1.toV3CaseId)(guid)
            _this.guidMap.set(guid, { type: "DG.Case", object: _case })
            // for level 0 (child-most collection), add items with their item ids and stash case ids
            if (level === 0) {
                let itemValues = {__id__: itemID, ...(0, data_set_1.toCanonical)(data, values)}
                // look up parent case attributes and add them to caseValues
                for (var parentCase = _this.getParentCase(_case); parentCase; parentCase = _this.getParentCase(parentCase)) {
                    itemValues = {...(parentCase.values ? (0, data_set_1.toCanonical)(data, parentCase.values) : undefined), ...itemValues}
                }
                itemsToAdd.push(itemValues)
                if (itemID) {
                    groupKeyCaseIds.set(itemID, v3CaseId)
                }
            }
            // for parent collections, stash case ids in `groupKeyCaseIds`
            else {
                let caseValues_1 = { ...values}
                for (var parentCase = _this.getParentCase(_case); parentCase; parentCase = _this.getParentCase(parentCase)) {
                    Object.assign(caseValues_1, parentCase.values)
                }
                let groupValues = v2CollectionInfo.groupAttrNames.map(function (name) {
                    return caseValues_1[name] != null ? String(caseValues_1[name]) : ""
                })
                let groupKey = JSON.stringify(groupValues)
                v2CollectionInfo.groupKeyCaseIds.set(groupKey, v3CaseId)
            }
        })
        if (itemsToAdd.length) {
            data.addCases(itemsToAdd)
        }
    }
    CodapV2DataSetImporter.prototype.registerSetAsideItems = function (data, setAsideItems) {
        let itemsToAdd = []
        setAsideItems === null || setAsideItems === void 0 ? void 0 : setAsideItems.forEach(function (item) {
            if ((0, codap_v2_data_set_types_1.isV2SetAsideItem)(item)) {
                let id = item.id, values = item.values
                itemsToAdd.push({__id__: id, ...(0, data_set_1.toCanonical)(data, values)})
            }
            else {
                itemsToAdd.push({__id__: (0, codap_utils_1.v3Id)(codap_utils_1.kItemIdPrefix), ...(0, data_set_1.toCanonical)(data, item)})
            }
        })
        if (itemsToAdd.length) {
            data.addCases(itemsToAdd)
            data.hideCasesOrItems(itemsToAdd.map(function (item) { return item.__id__ }))
        }
    }
    return CodapV2DataSetImporter
}())
exports.CodapV2DataSetImporter = CodapV2DataSetImporter
