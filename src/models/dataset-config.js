"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datasetConfig = exports.DatasetConfiguration = void 0;
let mobx_state_tree_1 = require("mobx-state-tree");
/**
 * DatasetConfiguration model stores the mapping between dataset attributes and visualization requirements.
 * It tracks which attributes in the CODAP dataset correspond to latitude, longitude, date, etc.
 */
exports.DatasetConfiguration = mobx_state_tree_1.types
    .model("DatasetConfiguration", {
    dataContextName: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    latitudeAttribute: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    longitudeAttribute: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    dateAttribute: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    colorAttribute: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    sizeAttribute: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.string),
    dateFormat: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.string, "auto"),
    isConfigured: mobx_state_tree_1.types.optional(mobx_state_tree_1.types.boolean, false)
})
    .views(function (self) { return ({
    /**
     * Validates if the configuration has all required attributes set
     */
    get isValid() {
        return !!(self.dataContextName &&
            self.latitudeAttribute &&
            self.longitudeAttribute &&
            self.dateAttribute);
    }
}); })
    .actions(function (self) { return ({
    /**
     * Sets the CODAP data context name
     */
    setDataContext (name) {
        self.dataContextName = name;
    },
    /**
     * Sets the attribute name for latitude values
     */
    setLatitudeAttribute (name) {
        self.latitudeAttribute = name;
    },
    /**
     * Sets the attribute name for longitude values
     */
    setLongitudeAttribute (name) {
        self.longitudeAttribute = name;
    },
    /**
     * Sets the attribute name for date/time values
     */
    setDateAttribute (name) {
        self.dateAttribute = name;
    },
    /**
     * Sets the attribute name for color mapping
     */
    setColorAttribute (name) {
        self.colorAttribute = name;
    },
    /**
     * Sets the attribute name for size mapping
     */
    setSizeAttribute (name) {
        self.sizeAttribute = name;
    },
    /**
     * Sets the date format for parsing date strings
     */
    setDateFormat (format) {
        self.dateFormat = format;
    },
    /**
     * Sets whether the dataset is fully configured
     */
    setIsConfigured (configured) {
        self.isConfigured = configured;
    },
    /**
     * Resets all attribute mappings to undefined
     */
    resetAttributeMappings () {
        self.latitudeAttribute = undefined;
        self.longitudeAttribute = undefined;
        self.dateAttribute = undefined;
        self.colorAttribute = undefined;
        self.sizeAttribute = undefined;
        self.dateFormat = "auto";
    }
}); });
/**
 * Default dataset configuration instance
 */
exports.datasetConfig = exports.DatasetConfiguration.create();
// Make datasetConfig available in the browser console for debugging
if (typeof window !== "undefined") {
    window.datasetConfig = exports.datasetConfig;
}
