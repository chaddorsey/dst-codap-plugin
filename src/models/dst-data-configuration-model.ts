import { extent, nice, ticks, scalePoint, scaleQuantize, scaleQuantile, range } from "d3";
import { types, Instance } from "mobx-state-tree";
import { DataConfigurationModel } from "../codap/components/data-display/models/data-configuration-model";
import { CaseData } from "../codap/components/data-display/d3-types";
import { dataDisplayGetNumericValue } from "../codap/components/data-display/data-display-value-utils";
import { getScaleThresholds } from "../codap/components/data-display/components/legend/choropleth-legend/choropleth-legend";

// These are diameters
const minDiameter = 2.25;
const maxDiameter = 15.75;

// The spec has this at 12, but it is little big with our default data
export const defaultPointDiameter = 6;

// Number of bins for size legends (single source of truth)
export const NUM_SIZE_BINS = 5;
// Note: If there are fewer unique values than bins, D3 will create fewer bins.

export const DstDataConfigurationModel = DataConfigurationModel.named("DstDataConfiguration")
  .props({
    legendRepresentation: types.maybe(types.enumeration(["color", "size"])),
    partitionMethod: types.optional(types.enumeration(["quantile", "quantize"]), "quantize"),
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
    },
    getCasesForLegendBin(bin: number, partitionMethod?: "quantile" | "quantize"): string[] {
      let method: "quantile" | "quantize" = "quantile";
      if (partitionMethod === "quantile" || partitionMethod === "quantize") {
        method = partitionMethod;
      } else if (self.partitionMethod === "quantile" || self.partitionMethod === "quantize") {
        method = self.partitionMethod;
      }
      const scale = self.getLegendNumericColorScale(method);
      const thresholds = getScaleThresholds(scale);
      const min = bin === 0 ? -Infinity : thresholds[bin - 1];
      const max = bin === thresholds.length ? Infinity : thresholds[bin];
      return self.getCasesInLegendRange(min, max);
    },
    casesInBinAreSelected(bin: number, partitionMethod?: "quantile" | "quantize"): boolean {
      const selection = self.getCasesForLegendBin(bin, partitionMethod);
      return !!(selection.length > 0 && selection.every((anID: string) => self.dataset?.isCaseSelected(anID)));
    },
    /**
     * Returns the point size for a given case ID, using the current legend attribute and partition method.
     * For categorical legends, maps the value to a size using the category size scale.
     * For numeric legends, uses a partition-aware D3 scale (quantile/quantize) to map the value to a size.
     * Falls back to the default point diameter for missing/invalid values or unsupported legend types.
     * @param id - The case ID
     * @returns The point diameter (number)
     */
    getLegendSizeForCase(id: string): number {
      const legendID = self.attributeID("legend");
      const legendAttribute = self.dataset?.getAttribute(legendID);
      if (!id || !legendID || !legendAttribute) {
        console.warn(`[getLegendSizeForCase] Missing id, legendID, or legendAttribute. Returning default size.`);
        return defaultPointDiameter;
      }

      const legendType = self.attributeType("legend");
      switch (legendType) {
        case "categorical": {
          const legendValue = self.dataset?.getStrValue(id, legendID);
          if (!legendValue) {
            console.warn(`[getLegendSizeForCase] Missing categorical value for id=${id}. Returning default size.`);
            return defaultPointDiameter;
          }
          return (self as any).getLegendSizeForCategory(legendValue);
        }
        case "numeric": {
          const legendValue = self.dataset?.getNumeric(id, legendID);
          if (legendValue == null) {
            console.warn(`[getLegendSizeForCase] Missing numeric value for id=${id}. Returning default size.`);
            return defaultPointDiameter;
          }
          // Always use the current partitionMethod for numeric size scale
          const method: "quantile" | "quantize" = (self.partitionMethod === "quantile" || self.partitionMethod === "quantize") ? self.partitionMethod : "quantile";
          const scale = (self as any).getLegendNumericSizeScale(method);
          try {
            const scaleFunction = typeof scale === "function" ? scale : null;
            if (!scaleFunction) {
              console.warn(`[getLegendSizeForCase] Size scale is not a function for id=${id}. Returning default size.`);
              return defaultPointDiameter;
            }
            const result = scaleFunction(legendValue);
            if (!result) {
              console.warn(`[getLegendSizeForCase] Size scale returned falsy for id=${id}, value=${legendValue}. Returning default size.`);
              return defaultPointDiameter;
            }
            return result;
          } catch (e) {
            console.error(`[getLegendSizeForCase] Error in size scale for id=${id}, value=${legendValue}:`, e);
            return defaultPointDiameter;
          }
        }
        case "date":
        case "color":
        default:
          console.warn(`[getLegendSizeForCase] Unsupported legend type (${legendType}) for id=${id}. Returning default size.`);
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
    },
    getLegendNumericSizeScale(partitionMethod: "quantile" | "quantize") {
      const attrID = self.attributeID("legend");
      if (!attrID) return scaleQuantize();
      const dataset = self.dataset;
      if (!dataset) return scaleQuantize();
      const attr = dataset.getAttribute(attrID);
      if (!attr) return scaleQuantize();
      // Use only valid numeric values
      const values = attr.numValues.filter((v: number | undefined) => typeof v === "number" && !isNaN(v)) as number[];
      if (values.length < 2) return scaleQuantize();
      // Use the single source of truth for number of bins
      const numBins = NUM_SIZE_BINS;
      // Size range
      const sizeRange = range(minDiameter, maxDiameter + ((maxDiameter-minDiameter)/(numBins-1)*0.9), (maxDiameter-minDiameter)/(numBins-1));
      if (partitionMethod === "quantile") {
        // Quantile: bins have equal number of points
        return scaleQuantile(values, sizeRange);
      } else {
        // Quantize: bins have equal value width
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        return scaleQuantize([minVal, maxVal], sizeRange);
      }
    },
    getLegendNumericSizeTicks(partitionMethod: "quantile" | "quantize") {
      const scale = (self as any).getLegendNumericSizeScale(partitionMethod);
      // Use getScaleThresholds to extract bin edges
      return getScaleThresholds(scale);
    },
  }))
  .actions(self => ({
    setPartitionMethod(method: "quantile" | "quantize") {
      self.partitionMethod = method;
    }
  }));

export interface IDstDataConfigurationModel extends Instance<typeof DstDataConfigurationModel> { }
