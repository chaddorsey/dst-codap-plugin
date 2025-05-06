"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codapData = void 0;
let mobx_1 = require("mobx");
let constants_1 = require("../utilities/constants");
let dst_container_1 = require("./dst-container");
let dataset_config_1 = require("./dataset-config");
let date_utils_1 = require("../utilities/date-utils");
let CodapData = /** @class */ (function () {
    function CodapData() {
        this.absoluteMinDate = 1578124800000;
        this.absoluteMaxDate = 1672358400000;
        this.marqueeSelection = new mobx_1.ObservableSet();
        (0, mobx_1.makeAutoObservable)(this);
    }
    Object.defineProperty(CodapData.prototype, "absoluteDateRange", {
        get () {
            return this.absoluteMaxDate - this.absoluteMinDate;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodapData.prototype, "caseIds", {
        get () {
            let _a, _b;
            return (_b = (_a = this.dataSet.getCollectionByName(constants_1.kCollectionName)) === null || _a === void 0 ? void 0 : _a.caseIds) !== null && _b !== void 0 ? _b : [];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CodapData.prototype, "dataSet", {
        get () {
            return dst_container_1.dstContainer.dataSet;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Get a numeric value for an attribute
     * @param attributeName The name of the attribute
     * @param caseId The case ID
     * @returns The numeric value or undefined if not a number
     */
    CodapData.prototype.getAttributeNumericValue = function (attributeName, caseId) {
        let value = this.getAttributeValue(attributeName, caseId);
        return value ? +value : undefined;
    };
    /**
     * Get the value of an attribute for a specific case
     * @param attributeName The name of the attribute
     * @param caseId The case ID
     * @returns The attribute value as a string or undefined
     */
    CodapData.prototype.getAttributeValue = function (attributeName, caseId) {
        let _a;
        let attributeId = (_a = this.dataSet.getAttributeByName(attributeName)) === null || _a === void 0 ? void 0 : _a.id;
        let value = attributeId ? this.dataSet.getValue(caseId, attributeId) : undefined;
        // Ensure we return a string or undefined
        return value !== undefined ? String(value) : undefined;
    };
    /**
     * Get the timestamp for a case using the configured date attribute
     * If no date attribute is configured, tries to use Year, Month, Day attributes
     * @param caseId The case ID
     * @returns Timestamp (milliseconds since epoch)
     */
    CodapData.prototype.getCaseDate = function (caseId) {
        // If we have a configured date attribute, use it
        if (dataset_config_1.datasetConfig.dateAttribute) {
            let dateStr = this.getAttributeValue(dataset_config_1.datasetConfig.dateAttribute, caseId);
            if (dateStr) {
                var timestamp = (0, date_utils_1.parseDate)(dateStr, dataset_config_1.datasetConfig.dateFormat);
                if (timestamp) {
                    return timestamp;
                }
                else {
                    console.warn("Failed to parse date from \"".concat(dateStr, "\""));
                }
            }
        }
        // Fallback to Year, Month, Day attributes if date parsing fails
        let year = this.getAttributeNumericValue("Year", caseId);
        let month = this.getAttributeNumericValue("Month", caseId);
        let day = this.getAttributeNumericValue("Day", caseId);
        if (year !== undefined || month !== undefined || day !== undefined) {
            var timestamp = (0, date_utils_1.createDateFromComponents)(year, month, day);
            if (timestamp) {
                return timestamp;
            }
            else {
                console.warn("Failed to create date from components ".concat(year, "/").concat(month, "/").concat(day));
            }
            return timestamp;
        }
        console.warn("No valid date found for case ".concat(caseId));
        return undefined;
    };
    /**
     * Get the latitude value for a case using the configured attribute
     * @param caseId The case ID
     * @returns The latitude value or undefined
     */
    CodapData.prototype.getLatitude = function (caseId) {
        // Use configured latitude attribute if available
        if (dataset_config_1.datasetConfig.latitudeAttribute) {
            return this.getAttributeNumericValue(dataset_config_1.datasetConfig.latitudeAttribute, caseId);
        }
        // Fall back to default "Latitude" attribute
        return this.getAttributeNumericValue("Latitude", caseId);
    };
    /**
     * Get the longitude value for a case using the configured attribute
     * @param caseId The case ID
     * @returns The longitude value or undefined
     */
    CodapData.prototype.getLongitude = function (caseId) {
        // Use configured longitude attribute if available
        if (dataset_config_1.datasetConfig.longitudeAttribute) {
            return this.getAttributeNumericValue(dataset_config_1.datasetConfig.longitudeAttribute, caseId);
        }
        // Fall back to default "Longitude" attribute
        return this.getAttributeNumericValue("Longitude", caseId);
    };
    /**
     * Get the color value for a case using the configured attribute
     * @param caseId The case ID
     * @returns The color value or undefined
     */
    CodapData.prototype.getColor = function (caseId) {
        // Use configured color attribute if available
        if (dataset_config_1.datasetConfig.colorAttribute) {
            return this.getAttributeValue(dataset_config_1.datasetConfig.colorAttribute, caseId);
        }
        return undefined;
    };
    /**
     * Get the size value for a case using the configured attribute
     * @param caseId The case ID
     * @returns The size value or undefined
     */
    CodapData.prototype.getSize = function (caseId) {
        // Use configured size attribute if available
        if (dataset_config_1.datasetConfig.sizeAttribute) {
            return this.getAttributeNumericValue(dataset_config_1.datasetConfig.sizeAttribute, caseId);
        }
        return undefined;
    };
    /**
     * Check if a case is selected
     * @param caseId The case ID
     * @returns True if the case is selected
     */
    CodapData.prototype.isSelected = function (caseId) {
        if (this.marqueeSelection.size > 0) {
            return this.marqueeSelection.has(caseId);
        }
        else {
            return this.dataSet.isCaseSelected(caseId);
        }
    };
    /**
     * Set the absolute date range for the dataset
     * @param minDate Minimum date (milliseconds since epoch)
     * @param maxDate Maximum date (milliseconds since epoch)
     */
    CodapData.prototype.setAbsoluteDateRange = function (minDate, maxDate) {
        this.absoluteMinDate = minDate;
        this.absoluteMaxDate = maxDate;
        // Debug log removed to reduce clutter
    };
    /**
     * Set the selection for the marquee tool
     * @param caseIds The selected case IDs or undefined to clear
     */
    CodapData.prototype.setMarqueeSelection = function (caseIds) {
        if (caseIds) {
            this.marqueeSelection.replace(caseIds);
        }
        else {
            this.marqueeSelection.clear();
        }
    };
    return CodapData;
}());
exports.codapData = new CodapData();
