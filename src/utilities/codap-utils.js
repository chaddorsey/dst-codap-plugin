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
let __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let __generator = (this && this.__generator) || function (thisArg, body) {
    let _ = { label: 0, sent() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g.throw = verb(1), g.return = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) {try {
            if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }}
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDST = initializeDST;
exports.getData = getData;
exports.setupSelectionSynchronization = setupSelectionSynchronization;
exports.updateSelection = updateSelection;
exports.dstAddCaseToSelection = dstAddCaseToSelection;
exports.dstRemoveCaseFromSelection = dstRemoveCaseFromSelection;
exports.updateDataSetAttributes = updateDataSetAttributes;
exports.setDSTCases = setDSTCases;
let codap_plugin_api_1 = require("@concord-consortium/codap-plugin-api");
let mobx_1 = require("mobx");
let mobx_state_tree_1 = require("mobx-state-tree");
let codap_v2_data_set_importer_1 = require("../codap/v2/codap-v2-data-set-importer");
let codap_utils_1 = require("../codap/utilities/codap-utils");
let codap_data_1 = require("../models/codap-data");
let dst_container_1 = require("../models/dst-container");
let ui_1 = require("../models/ui");
let constants_1 = require("./constants");
let codap_interface_helpers_1 = require("./codap-interface-helpers");
let dataset_config_1 = require("../models/dataset-config");
// This alternative dataset is easier to debug because it only has 2 cases
// import dataURL from "../data/Tornado_Tracks_2.csv";
// const dataContextName = "Tornado_Tracks_2";
let Tornado_Tracks_2020_2022_csv_1 = require("../data/Tornado_Tracks_2020-2022.csv");
let dataContextName = "Tornado_Tracks_2020-2022";
function initializeDST() {
    return __awaiter(this, void 0, void 0, function () {
        let datasets, error_1, state, dataContextResult, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Initializing DST plugin...");
                    return [4 /*yield*/, (0, codap_plugin_api_1.initializePlugin)({ pluginName: constants_1.kPluginName, version: constants_1.kVersion, dimensions: constants_1.kInitialDimensions })
                            .catch(function (reason) {
                            // This will happen if not embedded in CODAP
                            console.warn("Not embedded in CODAP");
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, codap_interface_helpers_1.getAvailableDatasets)()];
                case 3:
                    datasets = _a.sent();
                    console.log("Available datasets detected at initialization:", datasets);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error testing CODAP API at initialization:", error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _a.trys.push([5, 15, , 16]);
                    return [4 /*yield*/, (0, codap_interface_helpers_1.loadInteractiveState)()];
                case 6:
                    state = _a.sent();
                    if (!(state === null || state === void 0 ? void 0 : state.datasetConfig)) return [3 /*break*/, 10];
                    // Apply saved configuration
                    Object.assign(dataset_config_1.datasetConfig, state.datasetConfig);
                    if (!(dataset_config_1.datasetConfig.isConfigured && dataset_config_1.datasetConfig.dataContextName)) return [3 /*break*/, 8];
                    // Load the configured dataset
                    return [4 /*yield*/, getData(dataset_config_1.datasetConfig.dataContextName)];
                case 7:
                    // Load the configured dataset
                    _a.sent();
                    setupSelectionSynchronization(dataset_config_1.datasetConfig.dataContextName);
                    return [3 /*break*/, 9];
                case 8:
                    // Show configuration panel if not fully configured
                    ui_1.ui.setShowDatasetConfig(true);
                    _a.label = 9;
                case 9: return [3 /*break*/, 14];
                case 10: return [4 /*yield*/, (0, codap_plugin_api_1.getDataContext)(dataContextName)];
                case 11:
                    dataContextResult = _a.sent();
                    if (!dataContextResult.success) return [3 /*break*/, 13];
                    // Default dataset exists, use it
                    return [4 /*yield*/, getData()];
                case 12:
                    // Default dataset exists, use it
                    _a.sent();
                    setupSelectionSynchronization(dataContextName);
                    return [3 /*break*/, 14];
                case 13:
                    // No default dataset, show configuration panel
                    ui_1.ui.setShowDatasetConfig(true);
                    _a.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_2 = _a.sent();
                    console.warn("Error initializing plugin:", error_2);
                    // Show configuration panel on error
                    ui_1.ui.setShowDatasetConfig(true);
                    return [3 /*break*/, 16];
                case 16: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load data from CODAP and set up visualization
 * @param contextName Optional context name to load, defaults to hardcoded dataContextName
 */
function getData() {
    return __awaiter(this, arguments, void 0, function (contextName) {
        let dataContextResult, createContextResult, casesResult, casesValues, cases, dates, error_3;
        if (contextName === void 0) { contextName = dataContextName; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, codap_plugin_api_1.getDataContext)(contextName)];
                case 1:
                    dataContextResult = _a.sent();
                    if (dataContextResult.success) return [3 /*break*/, 5];
                    if (!(contextName === dataContextName)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, codap_plugin_api_1.createDataContextFromURL)(Tornado_Tracks_2020_2022_csv_1.default)];
                case 2:
                    createContextResult = _a.sent();
                    if (!createContextResult.success) {
                        console.error("Couldn't load dataset");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, codap_plugin_api_1.getDataContext)(contextName)];
                case 3:
                    dataContextResult = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    console.error("Dataset ".concat(contextName, " not found"));
                    return [2 /*return*/];
                case 5:
                    updateDataSetAttributes(dataContextResult.values);
                    return [4 /*yield*/, (0, codap_plugin_api_1.getCaseByFormulaSearch)(contextName, constants_1.kCollectionName, "true")];
                case 6:
                    casesResult = _a.sent();
                    if (!casesResult.success) {
                        console.error("Couldn't load cases from dataset");
                        return [2 /*return*/];
                    }
                    casesValues = casesResult.values;
                    cases = casesValues.map(function (aCase) { return ({__id__: (0, codap_utils_1.toV3CaseId)(aCase.id), ...aCase.values}); });
                    setDSTCases(cases);
                    dates = codap_data_1.codapData.caseIds
                        .map(function (caseId) { return codap_data_1.codapData.getCaseDate(caseId); })
                        .filter(function (date) { return date !== undefined && isFinite(date); });
                    if (dates.length > 0) {
                        codap_data_1.codapData.setAbsoluteDateRange(Math.min.apply(Math, dates), Math.max.apply(Math, dates));
                    }
                    else {
                        console.warn("No valid dates found in the dataset");
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    // This will happen if not embedded in CODAP
                    console.warn("Not embedded in CODAP", error_3);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Set up selection synchronization between CODAP and the plugin
 * @param contextName The name of the dataset context to synchronize with
 */
function setupSelectionSynchronization(contextName) {
    (0, codap_plugin_api_1.addDataContextChangeListener)(contextName, function (notification) {
        let operation = notification.values.operation;
        if (operation === "selectCases") {
            updateSelection(contextName);
        }
    });
    // When the selection changes in the plugin, pass those changes to Codap.
    (0, mobx_1.reaction)(function () { return Array.from(codap_data_1.codapData.dataSet.selection); }, function (selection) { return (0, codap_plugin_api_1.selectCases)(contextName, Array.from(codap_data_1.codapData.dataSet.selection)); }, { equals: mobx_1.comparer.structural });
}
/**
 * Update the selection from CODAP to the plugin
 * @param contextName The name of the dataset context to get selection from
 */
function updateSelection() {
    return __awaiter(this, arguments, void 0, function (contextName) {
        let selectionListResult, error_4;
        if (contextName === void 0) { contextName = dataContextName; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // If the user is selecting using a marquee, ignore updates from codap.
                    if (ui_1.ui.activeMarquee)
                        {return [2 /*return*/];}
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, codap_plugin_api_1.getSelectionList)(contextName)];
                case 2:
                    selectionListResult = _a.sent();
                    if (selectionListResult.success) {
                        codap_data_1.codapData.dataSet.setSelectedCases(selectionListResult.values.map(function (aCase) { return (0, codap_utils_1.toV3CaseId)(aCase.caseID); }));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    // This will happen if not embedded in CODAP
                    console.warn("Not embedded in CODAP", error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function dstAddCaseToSelection(caseId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            codap_data_1.codapData.dataSet.selectCases([caseId]);
            return [2 /*return*/];
        });
    });
}
function dstRemoveCaseFromSelection(caseId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            codap_data_1.codapData.dataSet.selectCases([caseId], false);
            return [2 /*return*/];
        });
    });
}
function updateDataSetAttributes(dataContext) {
    let guidMap = new Map;
    let v3AttrMap = new Map;
    let name = dataContext.name, title = dataContext.title, collections = dataContext.collections, setAsideItems = dataContext.setAsideItems;
    if (!(collections === null || collections === void 0 ? void 0 : collections.length)) {
        // There is nothing to update    
        return;
    }
    let dstDataset = dst_container_1.dstContainer.dataSet;
    let dstCaseMetadata = dst_container_1.dstContainer.sharedCaseMetadata;
    let importer = new codap_v2_data_set_importer_1.CodapV2DataSetImporter(guidMap, v3AttrMap);
    // The id of our internal dataset can't be changed so we ignore the id of the 
    // incoming data context
    let importContainer = dst_container_1.DstContainer.create({
        dataSet: {
            id: dstDataset.id,
            name,
            _title: title
        },
        sharedCaseMetadata: {
            id: dstCaseMetadata.id,
            data: dstDataset.id
        },
        dataDisplayModel: {}
    });
    let dataSet = importContainer.dataSet, sharedCaseMetadata = importContainer.sharedCaseMetadata;
    importer.importContext({ collections, setAsideItems }, dataSet, sharedCaseMetadata);
    let dataSetSnapshot = (0, mobx_state_tree_1.getSnapshot)(dataSet);
    (0, mobx_state_tree_1.applySnapshot)(dstDataset, dataSetSnapshot);
    let metadataSnapshot = (0, mobx_state_tree_1.getSnapshot)(sharedCaseMetadata);
    (0, mobx_state_tree_1.applySnapshot)(dstCaseMetadata, metadataSnapshot);
    let latAttribute = dstDataset.getAttributeByName("Latitude");
    let longAttribute = dstDataset.getAttributeByName("Longitude");
    // The x and y attributes have to be set for the two configurations.
    // This is necessary so legend code which can identify what the childmost collection is
    if (!latAttribute || !longAttribute)
        {return;}
    let colorConfiguration = dst_container_1.dstContainer.dataDisplayModel.colorDataConfiguration;
    colorConfiguration.setAttribute("x", { attributeID: longAttribute.id });
    colorConfiguration.setAttribute("y", { attributeID: latAttribute.id });
    let sizeConfiguration = dst_container_1.dstContainer.dataDisplayModel.sizeDataConfiguration;
    sizeConfiguration.setAttribute("x", { attributeID: longAttribute.id });
    sizeConfiguration.setAttribute("y", { attributeID: latAttribute.id });
}
function updateConfiguration(configuration) {
    if (!configuration)
        {return;}
    // For the configuration to refresh, the following functions have to be called.
    // This might show up as a problem with undo/redo as well.
    configuration._clearFilteredCases(configuration.dataset);
    configuration.clearCasesCache();
}
function setDSTCases(cases) {
    let dstDataset = dst_container_1.dstContainer.dataSet;
    dstDataset.removeCases(dstDataset.itemIds);
    dstDataset.addCases(cases, { canonicalize: true });
    let dataDisplayModel = dst_container_1.dstContainer.dataDisplayModel;
    updateConfiguration(dataDisplayModel.colorDataConfiguration);
    updateConfiguration(dataDisplayModel.sizeDataConfiguration);
}
