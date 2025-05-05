import { extent, nice, ticks, scalePoint, scaleQuantize, range } from "d3";
import { types, Instance } from "mobx-state-tree";
import { DataConfigurationModel } from "../codap/components/data-display/models/data-configuration-model";
import { CaseData } from "../codap/components/data-display/d3-types";
import { dataDisplayGetNumericValue } from "../codap/components/data-display/data-display-value-utils";

// These are diameters
const minDiameter = 2.25;
const maxDiameter = 15.75;

// The spec has this at 12, but it is little big with our default data
export const defaultPointDiameter = 6;

export const DstDataConfigurationModel = DataConfigurationModel.named("DstDataConfiguration")
  .props({
    legendRepresentation: types.maybe(types.enumeration(["color", "size"])),
    partitionMethod: types.optional(types.enumeration(["quantile", "quantize"]), "quantile"),
  })
  .views(self => ({
    get numericSizeTicks() {
      const attrID = self.attributeID("legend");
      if (!attrID) return [];

      const dataset = self.dataset;
      if (!dataset) return [];

      const attr = dataset.getAttribute(attrID);
      if (!attr) return [];

      // We read the changeCount so this function is responsive if the values change
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      attr.changeCount;
      const [realFirst, realLast] = extent(attr.numValues);
      if (realFirst == null || realLast == null) return [];

      const [niceFirst, niceLast] = nice(realFirst, realLast, 6);

      return ticks(niceFirst, niceLast, 5);
    }
  }))
  .views(self => ({
    get categoricalSizeScale() {
      // This will return an array of [kMain] if there is no legend
      const categories = self.categoryArrayForAttrRole("legend");

      return scalePoint(categories, [minDiameter, maxDiameter])
        // Make single categories have the default point size
        // Note: If we added padding to the scale this alignment would 
        // affect other sizes too, but without padding the alignment
        // only applies when there is a single point.
        // TODO: perhaps when there are 2 categories we don't want default to be the
        // min and max diameters? That will require a more complex scale 
        .align((defaultPointDiameter-minDiameter)/(maxDiameter-minDiameter));
    },

    get numericSizeScale() {
      const binTicks = self.numericSizeTicks;

      if (binTicks.length < 2) return scaleQuantize();

      const niceFirst = binTicks[0];
      const niceLast = binTicks[binTicks.length - 1];

      // We need an array of values ranging from minDiameter to maxDiameter
      // and the count of them should be binTicks.length - 1
      const numBins = binTicks.length - 1;
      const step = (maxDiameter - minDiameter) / (numBins - 1);

      // d3.range excludes the stop value so we need to add step to it.
      // With rounding errors the maxDiameter plus the step might be bigger
      // than the last value d3 computes so just be sure we go a little less 
      // than the step.
      const pointValues = range(minDiameter, maxDiameter + (step * 0.9), step);

      return scaleQuantize([niceFirst, niceLast], pointValues);
    }
  }))
  .views(self => ({
    getLegendSizeForCategory(category: string) {
      return self.categoricalSizeScale(category) ?? defaultPointDiameter;
    },
    getLegendSizeForNumericValue(value: number) {
      return self.numericSizeScale(value) ?? defaultPointDiameter;
    },
    // This is a generic function which could be also be used by 
    // getCasesForLegendQuantile.
    getCasesForLegendRange(min: number, max: number) {
      const dataset = self.dataset,
        legendID = self.attributeID("legend");
      return legendID
        ? self.getCaseDataArray(0).filter((aCaseData: CaseData) => {
          const value = dataDisplayGetNumericValue(dataset, aCaseData.caseID, legendID);
          return value !== undefined && value >= min && value < max;
        }).map((aCaseData: CaseData) => aCaseData.caseID)
        : [];
    }
  }))
  .views(self => ({
    casesInRangeAreSelected(min: number, max: number): boolean {
      const casesInRange = self.getCasesForLegendRange(min, max);
      return !!(casesInRange.length > 0 && casesInRange?.every((anID: string) => self.dataset?.isCaseSelected(anID)));
    },
    getLegendSizeForCase(id: string) {
      const legendID = self.attributeID("legend");
      const legendAttribute = self.dataset?.getAttribute(legendID);
      if (!id || !legendID || !legendAttribute) {
        return defaultPointDiameter;
      }

      const legendType = self.attributeType("legend");
      switch (legendType) {
        case "categorical": {
          const legendValue = self.dataset?.getStrValue(id, legendID);
          if (!legendValue) return defaultPointDiameter;
          return self.getLegendSizeForCategory(legendValue);
        }
        case "numeric": {
          const legendValue = self.dataset?.getNumeric(id, legendID);
          if (legendValue == null) return defaultPointDiameter;
          return self.getLegendSizeForNumericValue(legendValue);
        }
        case "date":
        case "color":
        default:
          return defaultPointDiameter;
      }
    },
    getLegendColorForCase(id: string) {
      const legendID = self.attributeID("legend");
      const legendAttribute = self.dataset?.getAttribute(legendID);
      if (!id || !legendID || !legendAttribute) {
        return "#888888";
      }
      const legendType = self.attributeType("legend");
      if (legendType === "categorical") {
        const value = self.dataset?.getStrValue(id, legendID);
        if (!value) {
          return "#888888";
        }
        const color = self.getLegendColorForCategory(value);
        return color;
      } else if (legendType === "numeric") {
        const value = self.dataset?.getNumeric(id, legendID);
        if (value == null) {
          return "#888888";
        }
        // Use the current partitionMethod property
        const color = self.getLegendColorForNumericValue(value);
        return color;
      }
      return "#888888";
    },
    getLegendColorForNumericValue(value: number) {
      // Ensure partitionMethod is valid
      const method: "quantile" | "quantize" = (self.partitionMethod === "quantile" || self.partitionMethod === "quantize") ? self.partitionMethod : "quantile";
      const scale = self.getLegendNumericColorScale(method);
      try {
        const scaleFunction = typeof scale === "function" ? scale : null;
        if (!scaleFunction) {
          return "#888888";
        }
        const result = scaleFunction(value);
        if (!result) {
          return "#888888";
        }
        return result;
      } catch {
        return "#888888";
      }
    }
  }))
  .actions(self => ({
    setPartitionMethod(method: "quantile" | "quantize") {
      self.partitionMethod = method;
    }
  }));

export interface IDstDataConfigurationModel extends Instance<typeof DstDataConfigurationModel> { }
