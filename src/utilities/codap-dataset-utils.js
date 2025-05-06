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
exports.getDatasetAttributes = getDatasetAttributes;
exports.loadConfiguredData = loadConfiguredData;
exports.updateDateRangeFromData = updateDateRangeFromData;
exports.getDatasetDetails = getDatasetDetails;
exports.exploreDataset = exploreDataset;
exports.getAttributesFromItemSearch = getAttributesFromItemSearch;
exports.analyzeDateFormats = analyzeDateFormats;
exports.checkGapDateRange = checkGapDateRange;
exports.updateMapBoundsFromData = updateMapBoundsFromData;
exports.analyzeGapPeriodCoordinates = analyzeGapPeriodCoordinates;
exports.focusOnGapPeriodData = focusOnGapPeriodData;
let codap_plugin_api_1 = require("@concord-consortium/codap-plugin-api");
let dataset_config_1 = require("../models/dataset-config");
let codap_data_1 = require("../models/codap-data");
let graph_1 = require("../models/graph");
let codap_utils_1 = require("./codap-utils");
let date_utils_1 = require("./date-utils");
/**
 * Parse a date string using the specified format
 * @param dateStr The date string to parse
 * @param format Optional format to use for parsing
 * @returns Timestamp in milliseconds or undefined if parsing failed
 */
function parseDate(dateStr, format) {
    try {
        // If we have a specific format, use it with the existing parseDate function
        if (format) {
            let parsedDateResult = (0, date_utils_1.parseDateWithFormat)(dateStr, format);
            return parsedDateResult;
        }
        // Otherwise analyze the date string
        let analysis = (0, date_utils_1.analyzeDateString)(dateStr);
        if (analysis.isValid && analysis.parsed) {
            return analysis.parsed.getTime();
        }
        return undefined;
    }
    catch (error) {
        console.warn("Failed to parse date: ".concat(dateStr), error);
        return undefined;
    }
}
/**
 * Extract attributes directly from the dataContext result
 * This is for when standard collection methods fail
 * @param dataContextResult The data context result from CODAP API
 * @returns Array of attribute names
 */
function extractAttributesFromContext(dataContextResult) {
    try {
        // Check if we have a valid context
        if (!(dataContextResult === null || dataContextResult === void 0 ? void 0 : dataContextResult.success) || !(dataContextResult === null || dataContextResult === void 0 ? void 0 : dataContextResult.values)) {
            return [];
        }
        let context = dataContextResult.values;
        let attributes_1 = [];
        // Extract from collections if they exist in the context
        if (context.collections && Array.isArray(context.collections)) {
            // Iterate through each collection
            context.collections.forEach(function (collection) {
                // Check if collection has attributes
                if (collection.attrs && Array.isArray(collection.attrs)) {
                    // Extract attribute names
                    let collectionAttrs = collection.attrs
                        .filter(function (attr) { return attr && attr.name; })
                        .map(function (attr) { return attr.name; });
                    attributes_1.push.apply(attributes_1, collectionAttrs);
                }
            });
        }
        console.log("Extracted attributes from context:", attributes_1);
        return attributes_1;
    }
    catch (error) {
        console.error("Error extracting attributes from context:", error);
        return [];
    }
}
/**
 * Get all attributes for a specific dataset in CODAP
 * @param dataContextName The name of the dataset
 * @returns An array of attribute names
 */
function getDatasetAttributes(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        let contextResult, attributesFromContext, collectionsResult, allAttrsResult, attributeNames, allAttributes, _i, _a, collection, attrResult, collectionAttributes, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    console.log("Sending request to get attributes for dataset: ".concat(dataContextName));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "]")
                        })];
                case 1:
                    contextResult = _b.sent();
                    console.log("Data context result:", JSON.stringify(contextResult, null, 2));
                    if (!contextResult.success) {
                        console.error("Failed to get data context info for ".concat(dataContextName));
                        return [2 /*return*/, []];
                    }
                    attributesFromContext = extractAttributesFromContext(contextResult);
                    if (attributesFromContext.length > 0) {
                        console.log("Successfully extracted attributes from context:", attributesFromContext);
                        return [2 /*return*/, attributesFromContext];
                    }
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection")
                        })];
                case 2:
                    collectionsResult = _b.sent();
                    console.log("Collections result:", JSON.stringify(collectionsResult, null, 2));
                    if (!(!collectionsResult.success || !collectionsResult.values || !collectionsResult.values.length)) return [3 /*break*/, 4];
                    console.warn("Failed to get collections or no collections found");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].attribute")
                        })];
                case 3:
                    allAttrsResult = _b.sent();
                    console.log("Fallback direct attributes result:", JSON.stringify(allAttrsResult, null, 2));
                    if (allAttrsResult.success && allAttrsResult.values) {
                        attributeNames = allAttrsResult.values.map(function (attr) { return attr.name; });
                        console.log("Extracted attribute names from fallback:", attributeNames);
                        return [2 /*return*/, attributeNames];
                    }
                    return [2 /*return*/, []];
                case 4:
                    allAttributes = [];
                    _i = 0, _a = collectionsResult.values;
                    _b.label = 5;
                case 5:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    collection = _a[_i];
                    console.log("Getting attributes for collection: ".concat(collection.name));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[\"").concat(collection.name, "\"].attribute")
                        })];
                case 6:
                    attrResult = _b.sent();
                    console.log("Attributes result for collection ".concat(collection.name, ":"), JSON.stringify(attrResult, null, 2));
                    if (attrResult.success && attrResult.values) {
                        collectionAttributes = attrResult.values.map(function (attr) { return attr.name; });
                        console.log("Attributes for collection ".concat(collection.name, ":"), collectionAttributes);
                        allAttributes.push.apply(allAttributes, collectionAttributes);
                    }
                    else {
                        console.warn("Failed to get attributes for collection ".concat(collection.name));
                    }
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log("Combined attributes from all collections:", allAttributes);
                    return [2 /*return*/, allAttributes];
                case 9:
                    error_1 = _b.sent();
                    console.error("Error getting dataset attributes:", error_1);
                    return [2 /*return*/, []];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load the dataset based on the current configuration
 * @returns Promise that resolves when data is loaded
 */
function loadConfiguredData() {
    return __awaiter(this, void 0, void 0, function () {
        let error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!dataset_config_1.datasetConfig.dataContextName || !dataset_config_1.datasetConfig.isConfigured) {
                        console.error("Cannot load data: dataset not properly configured");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    // Load the dataset using the configured context name
                    return [4 /*yield*/, (0, codap_utils_1.getData)(dataset_config_1.datasetConfig.dataContextName)];
                case 2:
                    // Load the dataset using the configured context name
                    _a.sent();
                    // Set up selection synchronization with the configured context
                    (0, codap_utils_1.setupSelectionSynchronization)(dataset_config_1.datasetConfig.dataContextName);
                    // Add a small delay to ensure data is fully loaded before calculating date range
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 3:
                    // Add a small delay to ensure data is fully loaded before calculating date range
                    _a.sent();
                    // Calculate and set the absolute date range from the actual data
                    return [4 /*yield*/, updateDateRangeFromData(dataset_config_1.datasetConfig.dataContextName)];
                case 4:
                    // Calculate and set the absolute date range from the actual data
                    _a.sent();
                    // Calculate and set the map bounds based on the geographic range of the data
                    return [4 /*yield*/, updateMapBoundsFromData(dataset_config_1.datasetConfig.dataContextName)];
                case 5:
                    // Calculate and set the map bounds based on the geographic range of the data
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error loading configured data:", error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Directly extract min/max values from items in a dataset
 * @param dataContextName The dataset context name
 * @param attributeName The attribute to extract values for
 * @returns Promise that resolves to min and max values
 */
function getMinMaxFromItems(dataContextName, attributeName) {
    return __awaiter(this, void 0, void 0, function () {
        let itemsResult, min, max, valuesFound, _i, _a, item, value, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("Getting min/max for attribute ".concat(attributeName, " directly from items..."));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].item[0-999]")
                        })];
                case 1:
                    itemsResult = _b.sent();
                    if (!itemsResult.success || !itemsResult.values || !Array.isArray(itemsResult.values) || !itemsResult.values.length) {
                        console.warn("No items found for min/max extraction of ".concat(attributeName));
                        return [2 /*return*/, { min: null, max: null }];
                    }
                    console.log("Processing ".concat(itemsResult.values.length, " items for min/max extraction of ").concat(attributeName));
                    min = null;
                    max = null;
                    valuesFound = 0;
                    // Process each item
                    for (_i = 0, _a = itemsResult.values; _i < _a.length; _i++) {
                        item = _a[_i];
                        value = null;
                        // Direct property access
                        if (item[attributeName] !== undefined) {
                            value = item[attributeName];
                        }
                        // Check values property
                        else if (item.values && item.values[attributeName] !== undefined) {
                            value = item.values[attributeName];
                        }
                        // Convert to number if needed
                        if (value !== null && value !== undefined) {
                            // If it's a string that could be a number, convert it
                            if (typeof value === "string" && !isNaN(Number(value))) {
                                value = Number(value);
                            }
                            // Only process numeric values
                            if (typeof value === "number" && !isNaN(value)) {
                                if (min === null || value < min)
                                    {min = value;}
                                if (max === null || value > max)
                                    {max = value;}
                                valuesFound++;
                            }
                        }
                    }
                    console.log("Found ".concat(valuesFound, " numeric values for ").concat(attributeName, ", min: ").concat(min, ", max: ").concat(max));
                    return [2 /*return*/, { min, max }];
                case 2:
                    error_3 = _b.sent();
                    console.error("Error getting min/max for ".concat(attributeName, ":"), error_3);
                    return [2 /*return*/, { min: null, max: null }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Calculate and update the absolute date range based on the actual dataset
 * @param dataContextName The dataset context name
 */
function updateDateRangeFromData(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        var dateAttr_1, minDate, maxDate, hasValidDates, dateSummaryResult, minDateValue, maxDateValue, parsedDate, parsedDate, dateAttrResult, minDateValue, maxDateValue, parsedDate, parsedDate, collectionResult, dateAttribute, minDateValue, maxDateValue, parsedDate, parsedDate, dateValues, referenceDate, tableResult, tableMinDate, tableMaxDate, foundDates, _i, _a, row, dateValue, timestamp, referenceDate, minDateResult, maxDateResult, dateCase, dateValue, timestamp, referenceDate, dateCase, dateValue, timestamp, referenceDate, error_4, casesResult, casesMinDate, casesMaxDate, foundDates, _b, _c, caseData, dateValue, timestamp, referenceDate, error_5, buffer, error_6;
        let _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 21, , 22]);
                    console.log("Calculating date range for dataset:", dataContextName);
                    dateAttr_1 = dataset_config_1.datasetConfig.dateAttribute;
                    if (!dateAttr_1) {
                        console.warn("No date attribute configured, cannot calculate date range");
                        return [2 /*return*/];
                    }
                    console.log("Using date attribute: ".concat(dateAttr_1));
                    minDate = null;
                    maxDate = null;
                    hasValidDates = false;
                    // Method 1: Try to get summary statistics for the date attribute
                    console.log("Requesting summary for date attribute: ".concat(dateAttr_1));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].attributeSummary[").concat(dateAttr_1, "]")
                        })];
                case 1:
                    dateSummaryResult = _f.sent();
                    console.log("Date summary result:", dateSummaryResult);
                    if (dateSummaryResult.success && dateSummaryResult.values) {
                        minDateValue = dateSummaryResult.values.min;
                        maxDateValue = dateSummaryResult.values.max;
                        // Parse date values if they're strings
                        if (typeof minDateValue === "string") {
                            parsedDate = parseDate(minDateValue, dataset_config_1.datasetConfig.dateFormat);
                            minDate = parsedDate !== undefined ? parsedDate : null;
                        }
                        else if (typeof minDateValue === "number") {
                            minDate = minDateValue;
                        }
                        if (typeof maxDateValue === "string") {
                            parsedDate = parseDate(maxDateValue, dataset_config_1.datasetConfig.dateFormat);
                            maxDate = parsedDate !== undefined ? parsedDate : null;
                        }
                        else if (typeof maxDateValue === "number") {
                            maxDate = maxDateValue;
                        }
                        if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
                            hasValidDates = true;
                            console.log("Date range from summary: ".concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                        }
                    }
                    else {
                        console.warn("Failed to get date summary statistics");
                    }
                    if (hasValidDates) return [3 /*break*/, 3];
                    console.log("Trying to get attribute details directly...");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].attribute[").concat(dateAttr_1, "]")
                        })];
                case 2:
                    dateAttrResult = _f.sent();
                    console.log("Date attribute details:", dateAttrResult);
                    if (dateAttrResult.success && dateAttrResult.values && dateAttrResult.values.stats) {
                        minDateValue = dateAttrResult.values.stats.min;
                        maxDateValue = dateAttrResult.values.stats.max;
                        // Parse date values if they're strings
                        if (typeof minDateValue === "string") {
                            parsedDate = parseDate(minDateValue, dataset_config_1.datasetConfig.dateFormat);
                            minDate = parsedDate !== undefined ? parsedDate : null;
                        }
                        else if (typeof minDateValue === "number") {
                            minDate = minDateValue;
                        }
                        if (typeof maxDateValue === "string") {
                            parsedDate = parseDate(maxDateValue, dataset_config_1.datasetConfig.dateFormat);
                            maxDate = parsedDate !== undefined ? parsedDate : null;
                        }
                        else if (typeof maxDateValue === "number") {
                            maxDate = maxDateValue;
                        }
                        if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
                            hasValidDates = true;
                            console.log("Date range from attribute details: ".concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                        }
                    }
                    _f.label = 3;
                case 3:
                    if (hasValidDates) return [3 /*break*/, 5];
                    console.log("Trying to get date range from collection stats...");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[\"Cases\"]")
                        })];
                case 4:
                    collectionResult = _f.sent();
                    if (collectionResult.success && collectionResult.values) {
                        console.log("Collection info:", collectionResult.values);
                        // Check if we can find the attributes with stats
                        if (collectionResult.values.attrs) {
                            dateAttribute = collectionResult.values.attrs.find(function (attr) {
                                return attr.name === dateAttr_1;
                            });
                            if (dateAttribute && dateAttribute.stats) {
                                minDateValue = dateAttribute.stats.min;
                                maxDateValue = dateAttribute.stats.max;
                                // Parse date values if they're strings
                                if (typeof minDateValue === "string") {
                                    parsedDate = parseDate(minDateValue, dataset_config_1.datasetConfig.dateFormat);
                                    minDate = parsedDate !== undefined ? parsedDate : null;
                                }
                                else if (typeof minDateValue === "number") {
                                    minDate = minDateValue;
                                }
                                if (typeof maxDateValue === "string") {
                                    parsedDate = parseDate(maxDateValue, dataset_config_1.datasetConfig.dateFormat);
                                    maxDate = parsedDate !== undefined ? parsedDate : null;
                                }
                                else if (typeof maxDateValue === "number") {
                                    maxDate = maxDateValue;
                                }
                                if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
                                    hasValidDates = true;
                                    console.log("Date range from collection stats: ".concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                                }
                            }
                        }
                    }
                    _f.label = 5;
                case 5:
                    if (hasValidDates) return [3 /*break*/, 9];
                    console.log("Trying to extract date range directly from items...");
                    return [4 /*yield*/, getMinMaxFromItems(dataContextName, dateAttr_1)];
                case 6:
                    dateValues = _f.sent();
                    if (!((dateValues.min === null || dateValues.max === null) && dateAttr_1 !== "day")) return [3 /*break*/, 8];
                    console.log("Original attribute didn't yield values, trying with 'day' attribute instead");
                    return [4 /*yield*/, getMinMaxFromItems(dataContextName, "day")];
                case 7:
                    dateValues = _f.sent();
                    _f.label = 8;
                case 8:
                    // We got numeric values that might be timestamps
                    if (dateValues.min !== null && dateValues.max !== null) {
                        minDate = dateValues.min;
                        maxDate = dateValues.max;
                        // Check if these are valid dates - they should be in milliseconds since epoch
                        if (!isNaN(minDate) && !isNaN(maxDate)) {
                            // Check if these might be days since a reference date (small numbers)
                            if (minDate < 10000) {
                                referenceDate = new Date(2000, 0, 1).getTime();
                                minDate = referenceDate + (minDate * 24 * 60 * 60 * 1000);
                                maxDate = referenceDate + (maxDate * 24 * 60 * 60 * 1000);
                                console.log("Converted day values to milliseconds with reference date Jan 1, 2000");
                            }
                            hasValidDates = true;
                            console.log("Date range from direct item extraction: ".concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                        }
                    }
                    _f.label = 9;
                case 9:
                    if (hasValidDates) return [3 /*break*/, 11];
                    console.log("Trying to extract date range from table data...");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[\"Cases\"].allCases")
                        })];
                case 10:
                    tableResult = _f.sent();
                    console.log("Table cases result:", tableResult.success ? "Success, found ".concat(((_d = tableResult.values) === null || _d === void 0 ? void 0 : _d.length) || 0, " cases") : "Failed");
                    if (tableResult.success && tableResult.values && Array.isArray(tableResult.values) && tableResult.values.length > 0) {
                        tableMinDate = null;
                        tableMaxDate = null;
                        foundDates = 0;
                        // Find date values in the table data
                        for (_i = 0, _a = tableResult.values; _i < _a.length; _i++) {
                            row = _a[_i];
                            dateValue = void 0;
                            // Try the primary attribute first
                            if (row.values && row.values[dateAttr_1] !== undefined) {
                                dateValue = row.values[dateAttr_1];
                            }
                            // Then try alternative date field if primary not found
                            else if (dateAttr_1 !== "day" && row.values && row.values.day !== undefined) {
                                dateValue = row.values.day;
                            }
                            // Also try case where values aren't nested
                            else if (row[dateAttr_1] !== undefined) {
                                dateValue = row[dateAttr_1];
                            }
                            else if (dateAttr_1 !== "day" && row.day !== undefined) {
                                dateValue = row.day;
                            }
                            if (dateValue !== undefined) {
                                timestamp = void 0;
                                if (typeof dateValue === "string") {
                                    timestamp = parseDate(dateValue, dataset_config_1.datasetConfig.dateFormat);
                                }
                                else if (typeof dateValue === "number") {
                                    // If it's a small number, it might be days since a reference date
                                    if (dateValue < 10000) {
                                        referenceDate = new Date(2000, 0, 1).getTime();
                                        timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
                                    }
                                    else {
                                        timestamp = dateValue;
                                    }
                                }
                                if (timestamp !== undefined && !isNaN(timestamp)) {
                                    if (tableMinDate === null || timestamp < tableMinDate) {
                                        tableMinDate = timestamp;
                                    }
                                    if (tableMaxDate === null || timestamp > tableMaxDate) {
                                        tableMaxDate = timestamp;
                                    }
                                    foundDates++;
                                }
                            }
                        }
                        if (tableMinDate !== null && tableMaxDate !== null && foundDates > 0) {
                            minDate = tableMinDate;
                            maxDate = tableMaxDate;
                            hasValidDates = true;
                            console.log("Date range from table data (found ".concat(foundDates, " dates): ").concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                        }
                    }
                    _f.label = 11;
                case 11:
                    if (hasValidDates) return [3 /*break*/, 16];
                    console.log("Trying to get date range using formula search...");
                    _f.label = 12;
                case 12:
                    _f.trys.push([12, 15, , 16]);
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[\"Cases\"].caseFormulaSearch[").concat(dateAttr_1, "=min(").concat(dateAttr_1, ")]")
                        })];
                case 13:
                    minDateResult = _f.sent();
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[\"Cases\"].caseFormulaSearch[").concat(dateAttr_1, "=max(").concat(dateAttr_1, ")]")
                        })];
                case 14:
                    maxDateResult = _f.sent();
                    console.log("Date formula search results:", {
                        minDate: minDateResult.success,
                        maxDate: maxDateResult.success
                    });
                    // Process minimum date result
                    if (minDateResult.success && minDateResult.values && minDateResult.values.length > 0) {
                        dateCase = minDateResult.values[0];
                        dateValue = null;
                        // Try to extract the date value
                        if (dateCase.values && dateCase.values[dateAttr_1] !== undefined) {
                            dateValue = dateCase.values[dateAttr_1];
                        }
                        else if (dateCase[dateAttr_1] !== undefined) {
                            dateValue = dateCase[dateAttr_1];
                        }
                        // Parse the date value
                        if (dateValue !== null) {
                            timestamp = void 0;
                            if (typeof dateValue === "string") {
                                timestamp = parseDate(dateValue, dataset_config_1.datasetConfig.dateFormat);
                            }
                            else if (typeof dateValue === "number") {
                                // If it's a small number, it might be days since a reference date
                                if (dateValue < 10000) {
                                    referenceDate = new Date(2000, 0, 1).getTime();
                                    timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
                                }
                                else {
                                    timestamp = dateValue;
                                }
                            }
                            if (timestamp !== undefined && !isNaN(timestamp)) {
                                minDate = timestamp;
                                console.log("Found min date: ".concat(new Date(minDate).toLocaleDateString()));
                            }
                        }
                    }
                    // Process maximum date result
                    if (maxDateResult.success && maxDateResult.values && maxDateResult.values.length > 0) {
                        dateCase = maxDateResult.values[0];
                        dateValue = null;
                        // Try to extract the date value
                        if (dateCase.values && dateCase.values[dateAttr_1] !== undefined) {
                            dateValue = dateCase.values[dateAttr_1];
                        }
                        else if (dateCase[dateAttr_1] !== undefined) {
                            dateValue = dateCase[dateAttr_1];
                        }
                        // Parse the date value
                        if (dateValue !== null) {
                            timestamp = void 0;
                            if (typeof dateValue === "string") {
                                timestamp = parseDate(dateValue, dataset_config_1.datasetConfig.dateFormat);
                            }
                            else if (typeof dateValue === "number") {
                                // If it's a small number, it might be days since a reference date
                                if (dateValue < 10000) {
                                    referenceDate = new Date(2000, 0, 1).getTime();
                                    timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
                                }
                                else {
                                    timestamp = dateValue;
                                }
                            }
                            if (timestamp !== undefined && !isNaN(timestamp)) {
                                maxDate = timestamp;
                                console.log("Found max date: ".concat(new Date(maxDate).toLocaleDateString()));
                            }
                        }
                    }
                    // If we found both min and max dates, consider it successful
                    if (minDate !== null && maxDate !== null && !isNaN(minDate) && !isNaN(maxDate)) {
                        hasValidDates = true;
                        console.log("Date range from formula search: ".concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                    }
                    return [3 /*break*/, 16];
                case 15:
                    error_4 = _f.sent();
                    console.error("Error using formula search for dates:", error_4);
                    return [3 /*break*/, 16];
                case 16:
                    if (hasValidDates) return [3 /*break*/, 20];
                    console.log("Trying to access date range from cases endpoint directly...");
                    _f.label = 17;
                case 17:
                    _f.trys.push([17, 19, , 20]);
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].case")
                        })];
                case 18:
                    casesResult = _f.sent();
                    console.log("Cases endpoint result:", casesResult.success ?
                        "Success, found ".concat(((_e = casesResult.values) === null || _e === void 0 ? void 0 : _e.length) || 0, " cases") : "Failed");
                    if (casesResult.success && casesResult.values &&
                        Array.isArray(casesResult.values) && casesResult.values.length > 0) {
                        casesMinDate = null;
                        casesMaxDate = null;
                        foundDates = 0;
                        // Process each case to find date values
                        for (_b = 0, _c = casesResult.values; _b < _c.length; _b++) {
                            caseData = _c[_b];
                            dateValue = void 0;
                            // Try to extract date from case values
                            if (caseData.values && caseData.values[dateAttr_1] !== undefined) {
                                dateValue = caseData.values[dateAttr_1];
                            }
                            else if (caseData[dateAttr_1] !== undefined) {
                                dateValue = caseData[dateAttr_1];
                            }
                            if (dateValue !== undefined) {
                                timestamp = void 0;
                                if (typeof dateValue === "string") {
                                    timestamp = parseDate(dateValue, dataset_config_1.datasetConfig.dateFormat);
                                }
                                else if (typeof dateValue === "number") {
                                    // Handle small numeric values as days since reference
                                    if (dateValue < 10000) {
                                        referenceDate = new Date(2000, 0, 1).getTime();
                                        timestamp = referenceDate + (dateValue * 24 * 60 * 60 * 1000);
                                    }
                                    else {
                                        timestamp = dateValue;
                                    }
                                }
                                if (timestamp !== undefined && !isNaN(timestamp)) {
                                    if (casesMinDate === null || timestamp < casesMinDate) {
                                        casesMinDate = timestamp;
                                    }
                                    if (casesMaxDate === null || timestamp > casesMaxDate) {
                                        casesMaxDate = timestamp;
                                    }
                                    foundDates++;
                                }
                            }
                        }
                        if (casesMinDate !== null && casesMaxDate !== null && foundDates > 0) {
                            minDate = casesMinDate;
                            maxDate = casesMaxDate;
                            hasValidDates = true;
                            console.log("Date range from cases endpoint (found ".concat(foundDates, " dates): ").concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                        }
                    }
                    return [3 /*break*/, 20];
                case 19:
                    error_5 = _f.sent();
                    console.error("Error using cases endpoint for dates:", error_5);
                    return [3 /*break*/, 20];
                case 20:
                    // Only update if we found valid dates
                    if (hasValidDates && minDate < maxDate) {
                        buffer = (maxDate - minDate) * 0.05;
                        codap_data_1.codapData.setAbsoluteDateRange(minDate - buffer, maxDate + buffer);
                        // Reset the graph visualization
                        graph_1.graph.resetDateVisualization();
                        console.log("Set date range: ".concat(new Date(minDate).toLocaleDateString(), " to ").concat(new Date(maxDate).toLocaleDateString()));
                    }
                    else {
                        console.warn("Could not determine date range from dataset - no valid dates found");
                    }
                    return [3 /*break*/, 22];
                case 21:
                    error_6 = _f.sent();
                    console.error("Error calculating date range:", error_6);
                    return [3 /*break*/, 22];
                case 22: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get detailed information about a CODAP dataset including collections and attributes
 * This is primarily for debugging purposes
 * @param dataContextName The dataset name
 * @returns Detailed dataset information
 */
function getDatasetDetails(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        let contextResult, collectionsResult, collections, collectionsWithAttributes, _i, collections_1, collection, attrResult, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log("Getting details for dataset: ".concat(dataContextName));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "]")
                        })];
                case 1:
                    contextResult = _a.sent();
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection")
                        })];
                case 2:
                    collectionsResult = _a.sent();
                    collections = collectionsResult.success ? collectionsResult.values : [];
                    collectionsWithAttributes = [];
                    _i = 0, collections_1 = collections;
                    _a.label = 3;
                case 3:
                    if (!(_i < collections_1.length)) return [3 /*break*/, 6];
                    collection = collections_1[_i];
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[\"").concat(collection.name, "\"].attribute")
                        })];
                case 4:
                    attrResult = _a.sent();
                    collectionsWithAttributes.push({
                        name: collection.name,
                        attributes: attrResult.success ? attrResult.values : []
                    });
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, {
                        context: contextResult.success ? contextResult.values : null,
                        collections: collectionsWithAttributes
                    }];
                case 7:
                    error_7 = _a.sent();
                    console.error("Error getting dataset details:", error_7);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Explore the dataset using a case to identify attribute names
 * This is a more direct approach to get attribute names when collection methods fail
 * @param dataContextName The name of the dataset
 * @returns An array of attribute names
 */
function exploreDataset(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        var getCaseResult, firstCase, attributeNames, getAllCasesResult, firstCase, caseAttributeNames, valueAttributeNames, getItemsResult, firstItem, itemAttributeNames, error_8, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log("Exploring dataset: ".concat(dataContextName));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].caseSearch[1]")
                        })];
                case 1:
                    getCaseResult = _a.sent();
                    console.log("First case result (caseSearch):", JSON.stringify(getCaseResult, null, 2));
                    if (getCaseResult.success && getCaseResult.values && getCaseResult.values.length) {
                        firstCase = getCaseResult.values[0];
                        if (firstCase && firstCase.values) {
                            attributeNames = Object.keys(firstCase.values);
                            console.log("Extracted attribute names from case:", attributeNames);
                            return [2 /*return*/, attributeNames];
                        }
                    }
                    else {
                        console.warn("Failed to get case using caseSearch");
                    }
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].allCases")
                        })];
                case 2:
                    getAllCasesResult = _a.sent();
                    console.log("All cases result:", JSON.stringify(getAllCasesResult, null, 2));
                    if (getAllCasesResult.success && getAllCasesResult.values &&
                        Array.isArray(getAllCasesResult.values) && getAllCasesResult.values.length) {
                        firstCase = getAllCasesResult.values[0];
                        if (firstCase && typeof firstCase === "object") {
                            caseAttributeNames = Object.keys(firstCase).filter(function (key) { return key !== "id" && key !== "_links"; });
                            if (caseAttributeNames.length) {
                                console.log("Extracted attribute names from allCases:", caseAttributeNames);
                                return [2 /*return*/, caseAttributeNames];
                            }
                            // If it has a values property, use that
                            if (firstCase.values && typeof firstCase.values === "object") {
                                valueAttributeNames = Object.keys(firstCase.values);
                                console.log("Extracted attribute names from allCases values:", valueAttributeNames);
                                return [2 /*return*/, valueAttributeNames];
                            }
                        }
                    }
                    else {
                        console.warn("Failed to get cases using allCases");
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].item[0-9]")
                        })];
                case 4:
                    getItemsResult = _a.sent();
                    console.log("Items result:", JSON.stringify(getItemsResult, null, 2));
                    if (getItemsResult.success && getItemsResult.values &&
                        Array.isArray(getItemsResult.values) && getItemsResult.values.length) {
                        firstItem = getItemsResult.values[0];
                        if (firstItem && typeof firstItem === "object") {
                            itemAttributeNames = Object.keys(firstItem).filter(function (key) {
                                return key !== "id" && key !== "_links" && key !== "caseID";
                            });
                            console.log("Extracted attribute names from items:", itemAttributeNames);
                            return [2 /*return*/, itemAttributeNames];
                        }
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_8 = _a.sent();
                    console.warn("Error getting items:", error_8);
                    return [3 /*break*/, 6];
                case 6:
                    // If all methods failed, return empty array
                    console.warn("All methods failed to get attributes from dataset exploration");
                    return [2 /*return*/, []];
                case 7:
                    error_9 = _a.sent();
                    console.error("Error exploring dataset:", error_9);
                    return [2 /*return*/, []];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get attributes using the itemSearch method
 * This uses a simpler approach from the CODAP API
 * @param dataContextName The dataset name
 * @returns Array of attribute names
 */
function getAttributesFromItemSearch(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        let itemSearchResult, _i, _a, item, itemValueAttrs, itemKeyAttrs, error_10;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("Getting attributes using itemSearch for dataset: ".concat(dataContextName));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].itemSearch[1]")
                        })];
                case 1:
                    itemSearchResult = _b.sent();
                    console.log("Item search result:", JSON.stringify(itemSearchResult, null, 2));
                    if (itemSearchResult.success && itemSearchResult.values &&
                        Array.isArray(itemSearchResult.values) && itemSearchResult.values.length) {
                        // Look for the first item with values
                        for (_i = 0, _a = itemSearchResult.values; _i < _a.length; _i++) {
                            item = _a[_i];
                            if (item && typeof item === "object") {
                                // Try different ways the data might be structured
                                if (item.values && typeof item.values === "object") {
                                    itemValueAttrs = Object.keys(item.values);
                                    console.log("Extracted attribute names from itemSearch values:", itemValueAttrs);
                                    return [2 /*return*/, itemValueAttrs];
                                }
                                itemKeyAttrs = Object.keys(item).filter(function (key) {
                                    return !["id", "_links", "type", "guid", "parent", "children"].includes(key);
                                });
                                if (itemKeyAttrs.length) {
                                    console.log("Extracted attribute names from itemSearch keys:", itemKeyAttrs);
                                    return [2 /*return*/, itemKeyAttrs];
                                }
                            }
                        }
                    }
                    console.warn("Failed to get attributes using itemSearch");
                    return [2 /*return*/, []];
                case 2:
                    error_10 = _b.sent();
                    console.error("Error getting attributes from itemSearch:", error_10);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Analyze date formats in the dataset to diagnose parsing issues
 * @param dataContextName The dataset context name
 */
function analyzeDateFormats(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        var result, formatCategories, sampleValues, dateAttributeId, stats, _i, _a, caseData, rawValue, stringValue, analysis, month, year, _b, _c, _d, format, caseIds, _e, _f, _g, format, samples, sortedYears, _h, sortedYears_1, year, sortedMonths, monthsToShow, _j, monthsToShow_1, month, validDates, _k, _l, caseData, date, gapThreshold, lastDate, gapsFound, i, currentDate, gap, error_11;
        let _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    if (!dataset_config_1.datasetConfig.dateAttribute) {
                        console.warn("No date attribute configured, can't analyze date formats");
                        return [2 /*return*/];
                    }
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 3, , 4]);
                    console.log("Analyzing date formats for attribute: ".concat(dataset_config_1.datasetConfig.dateAttribute));
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].allCases")
                        })];
                case 2:
                    result = _o.sent();
                    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
                        console.warn("Failed to get cases for date format analysis");
                        return [2 /*return*/];
                    }
                    console.log("Analyzing ".concat(result.values.length, " cases for date formats"));
                    formatCategories = {};
                    sampleValues = {};
                    dateAttributeId = (_m = codap_data_1.codapData.dataSet.getAttributeByName(dataset_config_1.datasetConfig.dateAttribute)) === null || _m === void 0 ? void 0 : _m.id;
                    stats = {
                        total: 0,
                        parsed: 0,
                        failed: 0,
                        byMonth: {},
                        byYear: {},
                        byFormat: {}
                    };
                    // Process each case
                    for (_i = 0, _a = result.values; _i < _a.length; _i++) {
                        caseData = _a[_i];
                        if (!caseData)
                            {continue;}
                        stats.total++;
                        rawValue = dateAttributeId
                            ? codap_data_1.codapData.dataSet.getValue(caseData.id, dateAttributeId)
                            : undefined;
                        if (rawValue === undefined || rawValue === null || rawValue === "") {
                            if (!formatCategories.empty)
                                {formatCategories.empty = [];}
                            formatCategories.empty.push(caseData.id);
                            stats.failed++;
                            continue;
                        }
                        stringValue = String(rawValue).trim();
                        analysis = (0, date_utils_1.analyzeDateString)(stringValue);
                        // Count by format
                        stats.byFormat[analysis.format] = (stats.byFormat[analysis.format] || 0) + 1;
                        // Create category if it doesn't exist
                        if (!formatCategories[analysis.format]) {
                            formatCategories[analysis.format] = [];
                            sampleValues[analysis.format] = [];
                        }
                        // Add case ID to appropriate category
                        formatCategories[analysis.format].push(caseData.id);
                        // Store sample values (up to 3 per category)
                        if (sampleValues[analysis.format].length < 3) {
                            sampleValues[analysis.format].push({
                                raw: stringValue,
                                parsed: analysis.parsed,
                                analysis
                            });
                        }
                        // Gather stats for parsed dates
                        if (analysis.isValid && analysis.parsed) {
                            stats.parsed++;
                            month = "".concat(analysis.parsed.getFullYear(), "-").concat((analysis.parsed.getMonth() + 1).toString().padStart(2, "0"));
                            year = analysis.parsed.getFullYear().toString();
                            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
                            stats.byYear[year] = (stats.byYear[year] || 0) + 1;
                        }
                        else {
                            stats.failed++;
                        }
                    }
                    // Summary of counts by format
                    console.log("Date format distribution:");
                    for (_b = 0, _c = Object.entries(formatCategories); _b < _c.length; _b++) {
                        _d = _c[_b], format = _d[0], caseIds = _d[1];
                        console.log("  ".concat(format, ": ").concat(caseIds.length, " cases (").concat(((caseIds.length / result.values.length) * 100).toFixed(1), "%)"));
                    }
                    // Log parse success rate
                    console.log("\nParse success rate: ".concat(stats.parsed, "/").concat(stats.total, " (").concat(((stats.parsed / stats.total) * 100).toFixed(1), "%)"));
                    // Sample values for each format
                    console.log("\nSample values by format:");
                    for (_e = 0, _f = Object.entries(sampleValues); _e < _f.length; _e++) {
                        _g = _f[_e], format = _g[0], samples = _g[1];
                        if (samples.length > 0) {
                            console.log("  ".concat(format, ":"));
                            samples.forEach(function (sample) {
                                let dateStr = sample.parsed && !isNaN(sample.parsed.getTime())
                                    ? sample.parsed.toISOString()
                                    : "Invalid Date";
                                console.log("    \"".concat(sample.raw, "\" => ").concat(dateStr, " (").concat(sample.analysis.formatDetails, ")"));
                            });
                        }
                    }
                    // Log distribution by year
                    console.log("\nDistribution by year:");
                    sortedYears = Object.keys(stats.byYear).sort();
                    for (_h = 0, sortedYears_1 = sortedYears; _h < sortedYears_1.length; _h++) {
                        year = sortedYears_1[_h];
                        console.log("  ".concat(year, ": ").concat(stats.byYear[year], " records"));
                    }
                    // Log distribution by month (for more recent years if there are many)
                    console.log("\nDistribution by month:");
                    sortedMonths = Object.keys(stats.byMonth).sort();
                    monthsToShow = sortedMonths.length > 24 ? sortedMonths.slice(-24) : sortedMonths;
                    for (_j = 0, monthsToShow_1 = monthsToShow; _j < monthsToShow_1.length; _j++) {
                        month = monthsToShow_1[_j];
                        console.log("  ".concat(month, ": ").concat(stats.byMonth[month], " records"));
                    }
                    // Check for gaps in timeline
                    console.log("\nChecking for timeline gaps...");
                    validDates = [];
                    for (_k = 0, _l = result.values; _k < _l.length; _k++) {
                        caseData = _l[_k];
                        if (!caseData)
                            {continue;}
                        date = codap_data_1.codapData.getCaseDate(caseData.id);
                        if (date && isFinite(date)) {
                            validDates.push(date);
                        }
                    }
                    if (validDates.length > 0) {
                        // Sort dates
                        validDates.sort(function (a, b) { return a - b; });
                        gapThreshold = 30 * 24 * 60 * 60 * 1000;
                        lastDate = validDates[0];
                        gapsFound = 0;
                        console.log("Analyzing timeline from ".concat(new Date(validDates[0]).toISOString(), " to ").concat(new Date(validDates[validDates.length - 1]).toISOString()));
                        for (i = 1; i < validDates.length; i++) {
                            currentDate = validDates[i];
                            gap = currentDate - lastDate;
                            if (gap > gapThreshold) {
                                gapsFound++;
                                if (gapsFound <= 5) { // Limit output to the first 5 gaps
                                    console.log("  Gap detected: ".concat(new Date(lastDate).toISOString(), " to ").concat(new Date(currentDate).toISOString(), " (").concat(Math.round(gap / (24 * 60 * 60 * 1000)), " days)"));
                                }
                            }
                            lastDate = currentDate;
                        }
                        if (gapsFound > 5) {
                            console.log("  (Plus ".concat(gapsFound - 5, " more gaps not shown)"));
                        }
                        else if (gapsFound === 0) {
                            console.log("  No significant gaps found in the timeline");
                        }
                    }
                    else {
                        console.log("  No valid dates to analyze for gaps");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_11 = _o.sent();
                    console.error("Error analyzing date formats:", error_11);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Specifically check date ranges and distributions within the 2005 gap period
 * @param dataContextName The dataset context name
 */
function checkGapDateRange(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        var result, gapStart, gapEnd, allDates, gapDates, beforeGapDates, afterGapDates, _i, _a, caseData, date, dateObj, lastBeforeGap, firstAfterGap, samplesToShow, i, i, isVisible, monthCounts_1, month, monthName, error_12;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("Running detailed gap period analysis...");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].allCases")
                        })];
                case 1:
                    result = _b.sent();
                    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
                        console.warn("Failed to get cases for gap analysis");
                        return [2 /*return*/];
                    }
                    console.log("Analyzing ".concat(result.values.length, " cases for dates in the gap period (Jun-Nov 2005)"));
                    gapStart = new Date("2005-06-30").getTime();
                    gapEnd = new Date("2005-11-30").getTime();
                    allDates = [];
                    gapDates = [];
                    beforeGapDates = [];
                    afterGapDates = [];
                    // Process all dates
                    for (_i = 0, _a = result.values; _i < _a.length; _i++) {
                        caseData = _a[_i];
                        if (!caseData)
                            {continue;}
                        date = codap_data_1.codapData.getCaseDate(caseData.id);
                        if (!date || !isFinite(date))
                            {continue;}
                        dateObj = {
                            id: caseData.id,
                            date,
                            dateStr: new Date(date).toISOString()
                        };
                        allDates.push(dateObj);
                        // Categorize dates
                        if (date >= gapStart && date <= gapEnd) {
                            gapDates.push(dateObj);
                        }
                        else if (date < gapStart) {
                            beforeGapDates.push(dateObj);
                        }
                        else if (date > gapEnd) {
                            afterGapDates.push(dateObj);
                        }
                    }
                    // Sort dates
                    allDates.sort(function (a, b) { return a.date - b.date; });
                    gapDates.sort(function (a, b) { return a.date - b.date; });
                    beforeGapDates.sort(function (a, b) { return a.date - b.date; });
                    afterGapDates.sort(function (a, b) { return a.date - b.date; });
                    // Log gap analysis results
                    console.log("Found ".concat(allDates.length, " total dates in dataset"));
                    console.log("  - ".concat(beforeGapDates.length, " dates before the gap period"));
                    console.log("  - ".concat(gapDates.length, " dates within the gap period"));
                    console.log("  - ".concat(afterGapDates.length, " dates after the gap period"));
                    // Log dates immediately surrounding the gap
                    if (beforeGapDates.length > 0) {
                        lastBeforeGap = beforeGapDates[beforeGapDates.length - 1];
                        console.log("Last date before gap: ".concat(lastBeforeGap.dateStr));
                    }
                    if (afterGapDates.length > 0) {
                        firstAfterGap = afterGapDates[0];
                        console.log("First date after gap: ".concat(firstAfterGap.dateStr));
                    }
                    // If there are dates within the gap, log them for analysis
                    if (gapDates.length > 0) {
                        console.log("Found ".concat(gapDates.length, " dates within the gap period!"));
                        console.log("Sample dates within gap period:");
                        samplesToShow = Math.min(10, gapDates.length);
                        for (i = 0; i < samplesToShow; i++) {
                            console.log("  ".concat(gapDates[i].dateStr, " (Case ID: ").concat(gapDates[i].id, ")"));
                        }
                        // Check if these dates are visible according to the graph filters
                        console.log("\nChecking visibility of gap period dates:");
                        for (i = 0; i < samplesToShow; i++) {
                            isVisible = graph_1.graph.caseIsVisible(gapDates[i].id);
                            console.log("  ".concat(gapDates[i].dateStr, " - visible: ").concat(isVisible));
                        }
                    }
                    else {
                        console.log("No dates found within the gap period - confirmed gap exists");
                    }
                    monthCounts_1 = {};
                    allDates.forEach(function (dateObj) {
                        let date = new Date(dateObj.date);
                        if (date.getFullYear() === 2005) {
                            let monthKey = date.getMonth() + 1; // 1-12 for Jan-Dec
                            monthCounts_1[monthKey] = (monthCounts_1[monthKey] || 0) + 1;
                        }
                    });
                    console.log("\nDistribution of 2005 dates by month:");
                    for (month = 1; month <= 12; month++) {
                        monthName = new Date(2005, month - 1, 1).toLocaleString("default", { month: "long" });
                        console.log("  ".concat(monthName, ": ").concat(monthCounts_1[month] || 0, " records"));
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _b.sent();
                    console.error("Error checking gap date range:", error_12);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update map boundaries based on the geographic range of the dataset
 * @param dataContextName Name of the data context to analyze
 * @returns Promise that resolves when map boundaries are updated
 */
function updateMapBoundsFromData(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        // Helper function to extract numeric value from a case result
        function extractValue(caseResult, attrName) {
            if (!caseResult.success) {
                console.log("Failed to get result for ".concat(attrName));
                return null;
            }
            let values = caseResult.values;
            // Handle different response formats
            if (Array.isArray(values) && values.length > 0) {
                // Format: { values: [ { values: { attr: value } } ] }
                let caseData = values[0];
                var value = null;
                // Check in values object
                if (caseData.values && caseData.values[attrName] !== undefined) {
                    value = caseData.values[attrName];
                }
                // Check directly on case object
                else if (caseData[attrName] !== undefined) {
                    value = caseData[attrName];
                }
                // Convert to number if it's a string
                if (value !== null && typeof value === "string" && !isNaN(Number(value))) {
                    value = Number(value);
                }
                console.log("Extracted ".concat(attrName, " value:"), value);
                return typeof value === "number" && !isNaN(value) ? value : null;
            }
            // Format: { values: { attrName: value } }
            else if (values && typeof values === "object" && values[attrName] !== undefined) {
                var value = values[attrName];
                let numValue = typeof value === "string" ? Number(value) : value;
                console.log("Extracted ".concat(attrName, " value from direct object:"), numValue);
                return typeof numValue === "number" && !isNaN(numValue) ? numValue : null;
            }
            console.log("Could not extract ".concat(attrName, " from result"), caseResult);
            return null;
        }
        let latAttr, longAttr, collectionName, collectionsResult, casesCollection, error_13, minLatResult, maxLatResult, minLongResult, maxLongResult, minLat, maxLat, minLong, maxLong, hasValidCoordinates, absoluteMinLat, absoluteMaxLat, absoluteMinLong, absoluteMaxLong, visibleMinLat, visibleMaxLat, visibleMinLong, visibleMaxLong, dataCenterLat, dataCenterLong, dataLatSpan, dataLongSpan, dataMinLat_1, dataMaxLat_1, dataMinLong_1, dataMaxLong_1, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!dataContextName) {
                        console.warn("Cannot update map bounds: no data context name provided");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    console.log("Updating map bounds for dataset:", dataContextName);
                    latAttr = dataset_config_1.datasetConfig.latitudeAttribute;
                    longAttr = dataset_config_1.datasetConfig.longitudeAttribute;
                    if (!latAttr || !longAttr) {
                        console.warn("Latitude or longitude attributes not configured");
                        return [2 /*return*/];
                    }
                    console.log("Using attributes: latitude=".concat(latAttr, ", longitude=").concat(longAttr));
                    collectionName = "Cases";
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection")
                        })];
                case 3:
                    collectionsResult = _a.sent();
                    if (collectionsResult.success && collectionsResult.values && collectionsResult.values.length) {
                        casesCollection = collectionsResult.values.find(function (c) { return c.name === "Cases"; }) || collectionsResult.values[0];
                        collectionName = casesCollection.name;
                        console.log("Found collection: ".concat(collectionName));
                    }
                    else {
                        console.warn("No collections found in data context, using default collection name 'Cases'");
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_13 = _a.sent();
                    console.warn("Error getting collections, using default collection name 'Cases':", error_13);
                    return [3 /*break*/, 5];
                case 5:
                    // Now use formula search to get min/max values directly - this is the approach that works
                    console.log("Using caseFormulaSearch to retrieve min/max coordinate values...");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[").concat(collectionName, "].caseFormulaSearch[").concat(latAttr, "=min(").concat(latAttr, ")]")
                        })];
                case 6:
                    minLatResult = _a.sent();
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[").concat(collectionName, "].caseFormulaSearch[").concat(latAttr, "=max(").concat(latAttr, ")]")
                        })];
                case 7:
                    maxLatResult = _a.sent();
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[").concat(collectionName, "].caseFormulaSearch[").concat(longAttr, "=min(").concat(longAttr, ")]")
                        })];
                case 8:
                    minLongResult = _a.sent();
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].collection[").concat(collectionName, "].caseFormulaSearch[").concat(longAttr, "=max(").concat(longAttr, ")]")
                        })];
                case 9:
                    maxLongResult = _a.sent();
                    console.log("Formula search results:", {
                        minLat: minLatResult.success,
                        maxLat: maxLatResult.success,
                        minLong: minLongResult.success,
                        maxLong: maxLongResult.success
                    });
                    minLat = extractValue(minLatResult, latAttr);
                    maxLat = extractValue(maxLatResult, latAttr);
                    minLong = extractValue(minLongResult, longAttr);
                    maxLong = extractValue(maxLongResult, longAttr);
                    hasValidCoordinates = minLat !== null && maxLat !== null &&
                        minLong !== null && maxLong !== null &&
                        !isNaN(minLat) && !isNaN(maxLat) &&
                        !isNaN(minLong) && !isNaN(maxLong);
                    absoluteMinLat = -90;
                    absoluteMaxLat = 90;
                    absoluteMinLong = -180;
                    absoluteMaxLong = 180;
                    console.log("Setting absolute map boundaries to full world coordinates:");
                    console.log("Latitude: ".concat(absoluteMinLat, " to ").concat(absoluteMaxLat));
                    console.log("Longitude: ".concat(absoluteMinLong, " to ").concat(absoluteMaxLong));
                    // Update absolute boundaries in the graph model - these are the furthest limits
                    graph_1.graph.absoluteMinLatitude = absoluteMinLat;
                    graph_1.graph.absoluteMaxLatitude = absoluteMaxLat;
                    graph_1.graph.absoluteMinLongitude = absoluteMinLong;
                    graph_1.graph.absoluteMaxLongitude = absoluteMaxLong;
                    visibleMinLat = -85;
                    visibleMaxLat = 85;
                    visibleMinLong = -175;
                    visibleMaxLong = 175;
                    // 2. Now set the current view to show the entire world map
                    console.log("Setting current view to show the entire world map:");
                    console.log("Latitude: ".concat(visibleMinLat, " to ").concat(visibleMaxLat));
                    console.log("Longitude: ".concat(visibleMinLong, " to ").concat(visibleMaxLong));
                    // Set current view directly (to immediately display the entire world)
                    graph_1.graph.minLatitude = visibleMinLat;
                    graph_1.graph.maxLatitude = visibleMaxLat;
                    graph_1.graph.minLongitude = visibleMinLong;
                    graph_1.graph.maxLongitude = visibleMaxLong;
                    // Set home view to the same - this is what "reset" will return to
                    graph_1.graph.homeMinLatitude = visibleMinLat;
                    graph_1.graph.homeMaxLatitude = visibleMaxLat;
                    graph_1.graph.homeMinLongitude = visibleMinLong;
                    graph_1.graph.homeMaxLongitude = visibleMaxLong;
                    // If we have valid data coordinates, also set up a data-focused view
                    if (hasValidCoordinates) {
                        console.log("Valid geographic coordinates found in dataset:");
                        console.log("Latitude: ".concat(minLat, " to ").concat(maxLat));
                        console.log("Longitude: ".concat(minLong, " to ").concat(maxLong));
                        dataCenterLat = (maxLat + minLat) / 2;
                        dataCenterLong = (maxLong + minLong) / 2;
                        dataLatSpan = (maxLat - minLat) * 1.5;
                        dataLongSpan = (maxLong - minLong) * 1.5;
                        dataMinLat_1 = Math.max(absoluteMinLat, dataCenterLat - dataLatSpan / 2);
                        dataMaxLat_1 = Math.min(absoluteMaxLat, dataCenterLat + dataLatSpan / 2);
                        dataMinLong_1 = Math.max(absoluteMinLong, dataCenterLong - dataLongSpan / 2);
                        dataMaxLong_1 = Math.min(absoluteMaxLong, dataCenterLong + dataLongSpan / 2);
                        console.log("Data-focused view (with 50% margin):");
                        console.log("Latitude: ".concat(dataMinLat_1, " to ").concat(dataMaxLat_1));
                        console.log("Longitude: ".concat(dataMinLong_1, " to ").concat(dataMaxLong_1));
                        // Animate to the data-focused view after a delay
                        // This starts with the full world and then zooms to show the data
                        setTimeout(function () {
                            graph_1.graph.animateTo({
                                minLatitude: dataMinLat_1,
                                maxLatitude: dataMaxLat_1,
                                minLongitude: dataMinLong_1,
                                maxLongitude: dataMaxLong_1
                            });
                            console.log("Animated to data-focused view");
                        }, 1000);
                    }
                    console.log("Map configured to show the entire world with proper data alignment");
                    return [3 /*break*/, 11];
                case 10:
                    error_14 = _a.sent();
                    console.error("Error updating map bounds:", error_14);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Analyze geographic coordinates for cases in the 2005 gap period
 * @param dataContextName Name of the data context
 */
function analyzeGapPeriodCoordinates(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        var result, gapStart, gapEnd, gapCases, _i, _a, caseData, dateValue, date, latitude, longitude, minLat, maxLat, minLong, maxLong, _b, gapCases_1, c, samplesToShow, i, c, isInLatRange, isInLongRange, isVisible, error_15;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    console.log("Analyzing geographic coordinates for cases in the 2005 gap period...");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].allCases")
                        })];
                case 1:
                    result = _c.sent();
                    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
                        console.warn("Failed to get cases for gap coordinates analysis");
                        return [2 /*return*/];
                    }
                    gapStart = new Date("2005-06-30").getTime();
                    gapEnd = new Date("2005-11-30").getTime();
                    gapCases = [];
                    // Get coordinates for cases in the gap period
                    for (_i = 0, _a = result.values; _i < _a.length; _i++) {
                        caseData = _a[_i];
                        if (!caseData)
                            {continue;}
                        dateValue = codap_data_1.codapData.getCaseDate(caseData.id);
                        if (!dateValue || !isFinite(dateValue))
                            {continue;}
                        date = new Date(dateValue);
                        // Check if the date is in the gap period
                        if (dateValue >= gapStart && dateValue <= gapEnd) {
                            latitude = codap_data_1.codapData.getLatitude(caseData.id);
                            longitude = codap_data_1.codapData.getLongitude(caseData.id);
                            if (latitude !== undefined && longitude !== undefined) {
                                gapCases.push({
                                    id: caseData.id,
                                    date,
                                    latitude,
                                    longitude
                                });
                            }
                        }
                    }
                    // Log results
                    console.log("Found ".concat(gapCases.length, " cases with coordinates in the gap period"));
                    if (gapCases.length > 0) {
                        minLat = Infinity;
                        maxLat = -Infinity;
                        minLong = Infinity;
                        maxLong = -Infinity;
                        for (_b = 0, gapCases_1 = gapCases; _b < gapCases_1.length; _b++) {
                            c = gapCases_1[_b];
                            minLat = Math.min(minLat, c.latitude);
                            maxLat = Math.max(maxLat, c.latitude);
                            minLong = Math.min(minLong, c.longitude);
                            maxLong = Math.max(maxLong, c.longitude);
                        }
                        console.log("Geographic bounds for gap period cases:", {
                            latitude: [minLat, maxLat],
                            longitude: [minLong, maxLong]
                        });
                        console.log("Current map view bounds:", {
                            latitude: [graph_1.graph.minLatitude, graph_1.graph.maxLatitude],
                            longitude: [graph_1.graph.minLongitude, graph_1.graph.maxLongitude]
                        });
                        console.log("Absolute map bounds:", {
                            latitude: [graph_1.graph.absoluteMinLatitude, graph_1.graph.absoluteMaxLatitude],
                            longitude: [graph_1.graph.absoluteMinLongitude, graph_1.graph.absoluteMaxLongitude]
                        });
                        samplesToShow = Math.min(5, gapCases.length);
                        console.log("Sample coordinates for ".concat(samplesToShow, " cases in the gap period:"));
                        for (i = 0; i < samplesToShow; i++) {
                            c = gapCases[i];
                            console.log("  Case ".concat(c.id, " (").concat(c.date.toISOString(), "): Lat ").concat(c.latitude, ", Long ").concat(c.longitude));
                            isInLatRange = c.latitude >= graph_1.graph.minLatitude && c.latitude <= graph_1.graph.maxLatitude;
                            isInLongRange = c.longitude >= graph_1.graph.minLongitude && c.longitude <= graph_1.graph.maxLongitude;
                            isVisible = graph_1.graph.caseIsVisible(c.id);
                            console.log("    Within lat range: ".concat(isInLatRange, ", Within long range: ").concat(isInLongRange, ", Visible: ").concat(isVisible));
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_15 = _c.sent();
                    console.error("Error analyzing gap period coordinates:", error_15);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Set the map view to focus specifically on data points from the 2005 gap period
 * @param dataContextName Name of the data context
 */
function focusOnGapPeriodData(dataContextName) {
    return __awaiter(this, void 0, void 0, function () {
        let result, gapStart, gapEnd, gapPointsFound, minLat, maxLat, minLong, maxLong, _i, _a, caseData, dateValue, latitude, longitude, latRange, longRange, expandedMinLat, expandedMaxLat, expandedMinLong, expandedMaxLong, error_16;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log("Focusing map view on 2005 gap period data points...");
                    return [4 /*yield*/, codap_plugin_api_1.codapInterface.sendRequest({
                            action: "get",
                            resource: "dataContext[".concat(dataContextName, "].allCases")
                        })];
                case 1:
                    result = _b.sent();
                    if (!result.success || !result.values || !Array.isArray(result.values) || !result.values.length) {
                        console.warn("Failed to get cases for focusing on gap period");
                        return [2 /*return*/];
                    }
                    gapStart = new Date("2005-06-30").getTime();
                    gapEnd = new Date("2005-11-30").getTime();
                    gapPointsFound = false;
                    minLat = Infinity;
                    maxLat = -Infinity;
                    minLong = Infinity;
                    maxLong = -Infinity;
                    for (_i = 0, _a = result.values; _i < _a.length; _i++) {
                        caseData = _a[_i];
                        if (!caseData)
                            {continue;}
                        dateValue = codap_data_1.codapData.getCaseDate(caseData.id);
                        if (!dateValue || !isFinite(dateValue))
                            {continue;}
                        // Check if the date is in the gap period
                        if (dateValue >= gapStart && dateValue <= gapEnd) {
                            latitude = codap_data_1.codapData.getLatitude(caseData.id);
                            longitude = codap_data_1.codapData.getLongitude(caseData.id);
                            if (latitude !== undefined && longitude !== undefined &&
                                isFinite(latitude) && isFinite(longitude)) {
                                gapPointsFound = true;
                                minLat = Math.min(minLat, latitude);
                                maxLat = Math.max(maxLat, latitude);
                                minLong = Math.min(minLong, longitude);
                                maxLong = Math.max(maxLong, longitude);
                            }
                        }
                    }
                    if (!gapPointsFound) {
                        console.warn("No geographic points found in the gap period to focus on");
                        return [2 /*return*/];
                    }
                    console.log("Found gap period geographic bounds:", { minLat, maxLat, minLong, maxLong });
                    latRange = maxLat - minLat;
                    longRange = maxLong - minLong;
                    expandedMinLat = minLat - latRange;
                    expandedMaxLat = maxLat + latRange;
                    expandedMinLong = minLong - longRange;
                    expandedMaxLong = maxLong + longRange;
                    // Directly set the graph's view to focus on these points
                    // Skip updating absolute boundaries and just set the view
                    graph_1.graph.minLatitude = expandedMinLat;
                    graph_1.graph.maxLatitude = expandedMaxLat;
                    graph_1.graph.minLongitude = expandedMinLong;
                    graph_1.graph.maxLongitude = expandedMaxLong;
                    console.log("Map view focused on gap period data points:", {
                        latitude: [expandedMinLat, expandedMaxLat],
                        longitude: [expandedMinLong, expandedMaxLong]
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_16 = _b.sent();
                    console.error("Error focusing on gap period data:", error_16);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
