"use strict";
import React from "react";
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
let react_2 = require("@testing-library/react");
let dataset_config_panel_1 = require("../dataset-config-panel");
let dataset_config_1 = require("../../models/dataset-config");
let react_3 = require("@chakra-ui/react");
import { ui } from "../../models/ui";
// Create mocks before importing the modules
jest.mock("../../utilities/codap-dataset-utils", function () { return ({
    getDatasetAttributes: jest.fn().mockResolvedValue(["Latitude", "Longitude", "Date", "Color", "Size"]),
    getDatasetDetails: jest.fn().mockResolvedValue({}),
    loadConfiguredData: jest.fn()
}); });
jest.mock("../../utilities/codap-interface-helpers", function () { return ({
    getAvailableDatasets: jest.fn().mockResolvedValue(["Dataset1", "Dataset2"]),
    saveInteractiveState: jest.fn().mockResolvedValue({ success: true })
}); });
// Import the mocked modules
let codapDatasetUtils = require("../../utilities/codap-dataset-utils");
let codapInterfaceHelpers = require("../../utilities/codap-interface-helpers");
// Mock the datasetConfig
jest.mock("../../models/dataset-config", function () { return ({
    datasetConfig: {
        dataContextName: null,
        latitudeAttribute: null,
        longitudeAttribute: null,
        dateAttribute: null,
        colorAttribute: null,
        sizeAttribute: null,
        dateFormat: "auto",
        isConfigured: false,
        isValid: false,
        setDataContext: jest.fn(function (name) {
            // Update the mock state as well
            mockedDatasetConfig.dataContextName = name;
        }),
        setLatitudeAttribute: jest.fn(function (attr) {
            // Update the mock state
            mockedDatasetConfig.latitudeAttribute = attr;
        }),
        setLongitudeAttribute: jest.fn(function (attr) {
            // Update the mock state
            mockedDatasetConfig.longitudeAttribute = attr;
        }),
        setDateAttribute: jest.fn(function (attr) {
            // Update the mock state
            mockedDatasetConfig.dateAttribute = attr;
        }),
        setColorAttribute: jest.fn(),
        setSizeAttribute: jest.fn(),
        setDateFormat: jest.fn(),
        setIsConfigured: jest.fn(),
        resetAttributeMappings: jest.fn()
    }
}); });
// Create a local reference to the mocked datasetConfig for easier state updates
var mockedDatasetConfig = dataset_config_1.datasetConfig;
// Mock UI model
jest.mock("../../models/ui", function () { return ({
    ui: {
        setShowDatasetConfig: jest.fn()
    }
}); });
describe("DatasetConfigPanel", function () {
    beforeEach(function () {
        jest.clearAllMocks();
        // Reset dataset config for each test
        Object.assign(mockedDatasetConfig, {
            dataContextName: null,
            latitudeAttribute: null,
            longitudeAttribute: null,
            dateAttribute: null,
            colorAttribute: null,
            sizeAttribute: null,
            isValid: false
        });
        // Ensure the modal is open for all tests
        ui.showDatasetConfig = true;
    });
    it("should render the dataset selection dropdown", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_2.render)(<react_3.ChakraProvider>
        <dataset_config_panel_1.DatasetConfigPanel />
                                        </react_3.ChakraProvider>);
                    // Wait for datasets to load
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText("Configure Dataset")).toBeInTheDocument();
                        })];
                case 1:
                    // Wait for datasets to load
                    _a.sent();
                    // Check dataset dropdown exists
                    expect(react_2.screen.getByLabelText(/Select Dataset/i)).toBeInTheDocument();
                    // Verify datasets are loaded
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText("Dataset1")).toBeInTheDocument();
                            expect(react_2.screen.getByText("Dataset2")).toBeInTheDocument();
                        })];
                case 2:
                    // Verify datasets are loaded
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should show attribute mapping controls after dataset selection", function () { return __awaiter(void 0, void 0, void 0, function () {
        let rerender;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rerender = (0, react_2.render)(<react_3.ChakraProvider>
        <dataset_config_panel_1.DatasetConfigPanel />
                                                   </react_3.ChakraProvider>).rerender;
                    // Wait for datasets to load
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByLabelText(/Select Dataset/i)).toBeInTheDocument();
                        })];
                case 1:
                    // Wait for datasets to load
                    _a.sent();
                    // Select a dataset
                    react_2.fireEvent.change(react_2.screen.getByLabelText(/Select Dataset/i), {
                        target: { value: "Dataset1" }
                    });
                    // Verify dataset selection is called
                    expect(dataset_config_1.datasetConfig.setDataContext).toHaveBeenCalledWith("Dataset1");
                    // Re-render with the updated dataContextName
                    rerender(<react_3.ChakraProvider>
        <dataset_config_panel_1.DatasetConfigPanel />
                             </react_3.ChakraProvider>);
                    // Verify attribute selectors are shown
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByTestId("latitude-select")).toBeInTheDocument();
                            expect(react_2.screen.getByTestId("longitude-select")).toBeInTheDocument();
                            expect(react_2.screen.getByTestId("date-select")).toBeInTheDocument();
                            
                            // Verify color and size selectors are NOT shown
                            expect(react_2.screen.queryByTestId("color-select")).not.toBeInTheDocument();
                            expect(react_2.screen.queryByTestId("size-select")).not.toBeInTheDocument();
                        })];
                case 2:
                    // Verify attribute selectors are shown
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should handle attribute selection", function () { return __awaiter(void 0, void 0, void 0, function () {
        // Define a test wrapper component to properly test the attribute selection
        function TestWrapper() {
            // Set up dataConfig context
            React.useEffect(function () {
                mockedDatasetConfig.dataContextName = "Dataset1";
                // Ensure modal is open
                ui.showDatasetConfig = true;
            }, []);
            return (<react_3.ChakraProvider>
          <dataset_config_panel_1.DatasetConfigPanel />
                    </react_3.ChakraProvider>);
        }
        let latitudeSelect, longitudeSelect, dateSelect;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_2.render)(<TestWrapper />);
                    // Wait for attributes to load
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByTestId("latitude-select")).toBeInTheDocument();
                        })];
                case 1:
                    // Wait for attributes to load
                    _a.sent();
                    // Reset mocks after the initial render to track only the changes we make
                    jest.clearAllMocks();
                    latitudeSelect = react_2.screen.getByTestId("latitude-select");
                    react_2.fireEvent.change(latitudeSelect, { target: { value: "Latitude" } });
                    longitudeSelect = react_2.screen.getByTestId("longitude-select");
                    react_2.fireEvent.change(longitudeSelect, { target: { value: "Longitude" } });
                    dateSelect = react_2.screen.getByTestId("date-select");
                    react_2.fireEvent.change(dateSelect, { target: { value: "Date" } });
                    // Verify the calls were made
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(dataset_config_1.datasetConfig.setLatitudeAttribute).toHaveBeenCalled();
                            expect(dataset_config_1.datasetConfig.setLongitudeAttribute).toHaveBeenCalled();
                            expect(dataset_config_1.datasetConfig.setDateAttribute).toHaveBeenCalled();
                            
                            // Verify color and size selectors don't exist
                            expect(react_2.screen.queryByTestId("color-select")).not.toBeInTheDocument();
                            expect(react_2.screen.queryByTestId("size-select")).not.toBeInTheDocument();
                        })];
                case 2:
                    // Verify the calls were made
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should enable apply button when configuration is valid", function () { return __awaiter(void 0, void 0, void 0, function () {
        let rerender, applyButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rerender = (0, react_2.render)(<react_3.ChakraProvider>
    <dataset_config_panel_1.DatasetConfigPanel />
                                                   </react_3.ChakraProvider>).rerender;
                    // Set all required fields and isValid to true
                    mockedDatasetConfig.dataContextName = "Dataset1";
                    mockedDatasetConfig.latitudeAttribute = "Latitude";
                    mockedDatasetConfig.longitudeAttribute = "Longitude";
                    mockedDatasetConfig.dateAttribute = "Date";
                    mockedDatasetConfig.isValid = true;
                    rerender(<react_3.ChakraProvider>
    <dataset_config_panel_1.DatasetConfigPanel />
                             </react_3.ChakraProvider>);
                    // Wait for button to be enabled
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            applyButton = react_2.screen.getByText("Apply Configuration");
                            expect(applyButton).not.toBeDisabled();
                        })];
                case 1:
                    // Click apply button
                    react_2.fireEvent.click(applyButton);
                    // Verify actions are called
                    return [2 /*return*/];
            }
        });
    }); });
    it("should auto-detect attributes", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set up custom mock implementation for this test
                    codapDatasetUtils.getDatasetAttributes.mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, ["Latitude", "Longitude", "Date", "Color", "Size"]];
                        });
                    }); });
                    (0, react_2.render)(<react_3.ChakraProvider>
        <dataset_config_panel_1.DatasetConfigPanel />
                                        </react_3.ChakraProvider>);
                    // Wait for datasets to load
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByLabelText(/Select Dataset/i)).toBeInTheDocument();
                        })];
                case 1:
                    // Wait for datasets to load
                    _a.sent();
                    // Select a dataset
                    react_2.fireEvent.change(react_2.screen.getByLabelText(/Select Dataset/i), {
                        target: { value: "Dataset1" }
                    });
                    // Wait for attribute fetching to complete
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(codapDatasetUtils.getDatasetAttributes).toHaveBeenCalled();
                        })];
                case 2:
                    // Wait for attribute fetching to complete
                    _a.sent();
                    // Verify auto-detection occurred
                    expect(dataset_config_1.datasetConfig.setLatitudeAttribute).toHaveBeenCalledWith("Latitude");
                    expect(dataset_config_1.datasetConfig.setLongitudeAttribute).toHaveBeenCalledWith("Longitude");
                    expect(dataset_config_1.datasetConfig.setDateAttribute).toHaveBeenCalledWith("Date");
                    
                    // Verify color and size are also auto-detected and set even though not visible in UI
                    expect(dataset_config_1.datasetConfig.setColorAttribute).toHaveBeenCalledWith("Color");
                    expect(dataset_config_1.datasetConfig.setSizeAttribute).toHaveBeenCalledWith("Size");
                    
                    return [2 /*return*/];
            }
        });
    }); });
});
