"use strict";
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
exports.getAvailableDatasets = getAvailableDatasets;
exports.saveInteractiveState = saveInteractiveState;
exports.loadInteractiveState = loadInteractiveState;
let codap_plugin_api_1 = require("@concord-consortium/codap-plugin-api");
/**
 * Get a list of available datasets in CODAP
 * @returns An array of dataset names
 */
function getAvailableDatasets() {
    return __awaiter(this, void 0, void 0, function () {
        let result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContextList"
                        })];
                case 1:
                    result = _a.sent();
                    if (result.success && result.values) {
                        return [2 /*return*/, result.values.map(function (context) { return context.name; })];
                    }
                    return [2 /*return*/, []];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error getting available datasets:", error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Save the interactive state to CODAP
 * @param state The state to save
 * @returns The result of the save operation
 */
function saveInteractiveState(state) {
    return __awaiter(this, void 0, void 0, function () {
        let serializableState, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    serializableState = {};
                    // If datasetConfig is in the state, extract only the serializable properties
                    if (state.datasetConfig) {
                        serializableState.datasetConfig = {
                            dataContextName: state.datasetConfig.dataContextName,
                            latitudeAttribute: state.datasetConfig.latitudeAttribute,
                            longitudeAttribute: state.datasetConfig.longitudeAttribute,
                            dateAttribute: state.datasetConfig.dateAttribute,
                            colorAttribute: state.datasetConfig.colorAttribute,
                            sizeAttribute: state.datasetConfig.sizeAttribute,
                            dateFormat: state.datasetConfig.dateFormat,
                            isConfigured: state.datasetConfig.isConfigured
                        };
                    }
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "update",
                            resource: "interactiveState",
                            values: serializableState
                        })];
                case 1: 
                // Update the interactive state through CODAP API
                return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error saving interactive state:", error_2);
                    return [2 /*return*/, { success: false, error: error_2 }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load the interactive state from CODAP
 * @returns The loaded state or undefined if not found
 */
function loadInteractiveState() {
    return __awaiter(this, void 0, void 0, function () {
        let result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "interactiveState"
                        })];
                case 1:
                    result = _a.sent();
                    if (result.success && result.values) {
                        return [2 /*return*/, result.values];
                    }
                    return [2 /*return*/, undefined];
                case 2:
                    error_3 = _a.sent();
                    console.error("Error loading interactive state:", error_3);
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
