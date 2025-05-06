"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DstDataConfigurationModel = exports.defaultPointDiameter = void 0;
let d3_1 = require("d3");
let mobx_state_tree_1 = require("mobx-state-tree");
let data_configuration_model_1 = require("../codap/components/data-display/models/data-configuration-model");
let data_display_value_utils_1 = require("../codap/components/data-display/data-display-value-utils");
// These are diameters
let minDiameter = 2.25;
let maxDiameter = 15.75;
// The spec has this at 12, but it is little big with our default data
exports.defaultPointDiameter = 6;
exports.DstDataConfigurationModel = data_configuration_model_1.DataConfigurationModel.named("DstDataConfiguration")
    .props({
    legendRepresentation: mobx_state_tree_1.types.maybe(mobx_state_tree_1.types.enumeration(["color", "size"]))
})
    .views(function (self) { return ({
    get numericSizeTicks() {
        let attrID = self.attributeID("legend");
        if (!attrID)
            {return [];}
        let dataset = self.dataset;
        if (!dataset)
            {return [];}
        let attr = dataset.getAttribute(attrID);
        if (!attr)
            {return [];}
        // We read the changeCount so this function is responsive if the values change
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        attr.changeCount;
        let _a = (0, d3_1.extent)(attr.numValues), realFirst = _a[0], realLast = _a[1];
        if (realFirst == null || realLast == null)
            {return [];}
        let _b = (0, d3_1.nice)(realFirst, realLast, 6), niceFirst = _b[0], niceLast = _b[1];
        return (0, d3_1.ticks)(niceFirst, niceLast, 5);
    }
}); })
    .views(function (self) { return ({
    get categoricalSizeScale() {
        // This will return an array of [kMain] if there is no legend
        let categories = self.categoryArrayForAttrRole("legend");
        return (0, d3_1.scalePoint)(categories, [minDiameter, maxDiameter])
            // Make single categories have the default point size
            // Note: If we added padding to the scale this alignment would 
            // affect other sizes too, but without padding the alignment
            // only applies when there is a single point.
            // TODO: perhaps when there are 2 categories we don't want default to be the
            // min and max diameters? That will require a more complex scale 
            .align((exports.defaultPointDiameter - minDiameter) / (maxDiameter - minDiameter));
    },
    get numericSizeScale() {
        let binTicks = self.numericSizeTicks;
        if (binTicks.length < 2)
            {return (0, d3_1.scaleQuantize)();}
        let niceFirst = binTicks[0];
        let niceLast = binTicks[binTicks.length - 1];
        // We need an array of values ranging from minDiameter to maxDiameter
        // and the count of them should be binTicks.length - 1
        let numBins = binTicks.length - 1;
        let step = (maxDiameter - minDiameter) / (numBins - 1);
        // d3.range excludes the stop value so we need to add step to it.
        // With rounding errors the maxDiameter plus the step might be bigger
        // than the last value d3 computes so just be sure we go a little less 
        // than the step.
        let pointValues = (0, d3_1.range)(minDiameter, maxDiameter + (step * 0.9), step);
        return (0, d3_1.scaleQuantize)([niceFirst, niceLast], pointValues);
    }
}); })
    .views(function (self) { return ({
    getLegendSizeForCategory (category) {
        let _a;
        return (_a = self.categoricalSizeScale(category)) !== null && _a !== void 0 ? _a : exports.defaultPointDiameter;
    },
    getLegendSizeForNumericValue (value) {
        let _a;
        return (_a = self.numericSizeScale(value)) !== null && _a !== void 0 ? _a : exports.defaultPointDiameter;
    },
    // This is a generic function which could be also be used by 
    // getCasesForLegendQuantile.
    getCasesForLegendRange (min, max) {
        let dataset = self.dataset, legendID = self.attributeID("legend");
        return legendID
            ? self.getCaseDataArray(0).filter(function (aCaseData) {
                let value = (0, data_display_value_utils_1.dataDisplayGetNumericValue)(dataset, aCaseData.caseID, legendID);
                return value !== undefined && value >= min && value < max;
            }).map(function (aCaseData) { return aCaseData.caseID; })
            : [];
    }
}); })
    .views(function (self) { return ({
    casesInRangeAreSelected (min, max) {
        let casesInRange = self.getCasesForLegendRange(min, max);
        return !!(casesInRange.length > 0 && (casesInRange === null || casesInRange === void 0 ? void 0 : casesInRange.every(function (anID) { let _a; return (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.isCaseSelected(anID); })));
    },
    getLegendSizeForCase (id) {
        let _a, _b, _c;
        let legendID = self.attributeID("legend");
        let legendAttribute = (_a = self.dataset) === null || _a === void 0 ? void 0 : _a.getAttribute(legendID);
        if (!id || !legendID || !legendAttribute) {
            return exports.defaultPointDiameter;
        }
        let legendType = self.attributeType("legend");
        switch (legendType) {
            case "categorical": {
                var legendValue = (_b = self.dataset) === null || _b === void 0 ? void 0 : _b.getStrValue(id, legendID);
                if (!legendValue)
                    {return exports.defaultPointDiameter;}
                return self.getLegendSizeForCategory(legendValue);
            }
            case "numeric": {
                var legendValue = (_c = self.dataset) === null || _c === void 0 ? void 0 : _c.getNumeric(id, legendID);
                if (legendValue == null)
                    {return exports.defaultPointDiameter;}
                return self.getLegendSizeForNumericValue(legendValue);
            }
            case "date":
            case "color":
            default:
                return exports.defaultPointDiameter;
        }
    }
}); });
