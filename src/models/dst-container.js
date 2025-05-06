"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (let p in s) {if (Object.prototype.hasOwnProperty.call(s, p))
                {t[p] = s[p];}}
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dstContainer = exports.DstContainer = void 0;
let mobx_state_tree_1 = require("mobx-state-tree");
let dst_data_display_model_1 = require("./dst-data-display-model");
let data_set_1 = require("../codap/models/data/data-set");
let shared_case_metadata_1 = require("../codap/models/shared/shared-case-metadata");
exports.DstContainer = mobx_state_tree_1.types.model("DstContainer", {
    dataDisplayModel: dst_data_display_model_1.DstDataDisplayModel,
    dataSet: data_set_1.DataSet,
    sharedCaseMetadata: shared_case_metadata_1.SharedCaseMetadata,
});
let historyServiceEnv = {
    historyService: {
        handleApplyModelChange (options) {
            // noop
        },
        withoutUndo (actionCall, options) {
            // noop
        }
    }
};
// The initial model here is mostly a place holder. However some parts of it are
// preserved when the real data is imported from CODAP.
// - the dataDisplayModel is preserved. Only _attributeDescripts.legend.attributeID is updated
//   when an attribute is configured in the legend.
// - the dataset id from this initial dataset will replace the imported dataset id, 
//   so this initial id is preserved.
// - the metadata id from this initial metadata will replace the imported metadata id,
//   so this initial id is preserved.
exports.dstContainer = exports.DstContainer.create({
    dataDisplayModel: {
        layers: [
            {
                "id": "LAYRLShNROjFjxSS",
                "layerIndex": 0,
                "dataConfiguration": {
                    "id": "GDCONCfyNftDdK3cd",
                    "_attributeDescriptions": {},
                    "dataset": "DATA33637005901959",
                    "metadata": "SHARQxjKerhUm8ts",
                    "hiddenCases": [],
                }
            },
            {
                "id": "LAYRL123",
                "layerIndex": 1,
                "dataConfiguration": {
                    "id": "GDCON123",
                    "_attributeDescriptions": {},
                    "legendRepresentation": "size",
                    "dataset": "DATA33637005901959",
                    "metadata": "SHARQxjKerhUm8ts",
                    "hiddenCases": [],
                }
            }
        ]
    },
    dataSet: {
        "id": "DATA33637005901959",
        "name": "New Dataset",
        "collections": [
            {
                "id": "COLL475139530534220",
                "name": "Cases",
                "attributes": [
                    "ATTR444185124424189",
                    "ATTR859044866983853"
                ],
                "_groupKeyCaseIds": [
                    [
                        "ITEM720543340969707",
                        "CASE246657054186208"
                    ],
                    [
                        "ITEM139217082312718",
                        "CASE428102889982743"
                    ],
                    [
                        "ITEM614468301791110",
                        "CASE602988398337539"
                    ],
                    [
                        "ITEM112558960259864",
                        "CASE574970957157937"
                    ]
                ]
            }
        ],
        "attributesMap": {
            "ATTR444185124424189": {
                "id": "ATTR444185124424189",
                "name": "Brand",
                "clientKey": "",
                "deleteable": true,
                "editable": true,
                "values": [
                    "A",
                    "B",
                    "C",
                    "D"
                ]
            },
            "ATTR859044866983853": {
                "id": "ATTR859044866983853",
                "name": "newAttr",
                "clientKey": "",
                "deleteable": true,
                "editable": true,
                "values": [
                    "10",
                    "11",
                    "2",
                    "3"
                ]
            }
        },
        "_itemIds": [
            "ITEM720543340969707",
            "ITEM139217082312718",
            "ITEM614468301791110",
            "ITEM112558960259864"
        ],
        "snapSelection": [],
        "setAsideItemIds": []
    },
    sharedCaseMetadata: {
        "type": "SharedCaseMetadata",
        "id": "SHARQxjKerhUm8ts",
        "data": "DATA33637005901959",
        "collections": {},
        "categories": {},
        "hidden": {},
        "caseTableTileId": "TABL956576606772774",
        "lastShownTableOrCardTileId": "TABL956576606772774",
        "attributeColorRanges": {}
    }
}, { ...historyServiceEnv});
window.dstContainer = exports.dstContainer;
