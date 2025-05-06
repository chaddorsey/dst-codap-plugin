import { makeAutoObservable } from "mobx";

import vars from "../../codap/components/vars.scss";
import { getStringBounds } from "../../codap/components/axis/axis-utils";
import { DataDisplayLayout } from "../../codap/components/data-display/models/data-display-layout";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { getScaleThresholds } from "../../codap/components/data-display/components/legend/choropleth-legend/choropleth-legend";

export interface NumericSizeLegendKey {
  size: number;
  index: number;
  canonicalValue: number;
  min: number;
  max: number;
}
interface NumericSizeLegendLayout {
  fullWidth: number;
  numColumns: number;
  rowHeight: number;
}

export const padding = 5;
// Because the points start small, we can gain back some height by squeezing the 
// the points up into the axis label area.
export const labelHeight = getStringBounds("Wy", vars.labelFont).height - 5;

// TODO: try extending the CategoryLegendModel
// we have to understand what works and what doesn't work with MobX sub classing
export class NumericSizeLegendModel {
  dataDisplayLayout: DataDisplayLayout;
  dataConfiguration: IDstDataConfigurationModel | undefined;
  partitionMethod: "quantile" | "quantize";

  constructor(dataConfiguration: IDstDataConfigurationModel | undefined, dataDisplayLayout: DataDisplayLayout, partitionMethod: "quantile" | "quantize") {
    this.dataDisplayLayout = dataDisplayLayout;
    this.dataConfiguration = dataConfiguration;
    this.partitionMethod = partitionMethod;
    makeAutoObservable(this);
  }

  setDataConfiguration(dataConfiguration: IDstDataConfigurationModel | undefined) {
    this.dataConfiguration = dataConfiguration;
  }

  setDataDisplayLayout(dataDisplayLayout: DataDisplayLayout) {
    this.dataDisplayLayout = dataDisplayLayout;
  }

  setPartitionMethod(partitionMethod: "quantile" | "quantize") {
    this.partitionMethod = partitionMethod;
  }

  get pointValues () {
    if (!this.dataConfiguration) return [];
    // Use the partitionMethod to get the correct scale
    const scale = (this.dataConfiguration as any).getLegendNumericSizeScale
      ? (this.dataConfiguration as any).getLegendNumericSizeScale(this.partitionMethod)
      : this.dataConfiguration.numericSizeScale;
    if (!scale) {
      console.warn("pointsData: no scale found");
      return [];
    }
    return scale.range();
  }

  get ticks() {
    if (!this.dataConfiguration) return [];
    // Use the partitionMethod to get the correct ticks if available
    if ((this.dataConfiguration as any).getLegendNumericSizeTicks) {
      return (this.dataConfiguration as any).getLegendNumericSizeTicks(this.partitionMethod);
    }
    return this.dataConfiguration.numericSizeTicks || [];
  }

  get pointsData(): NumericSizeLegendKey[] {
    if (!this.dataConfiguration) return [];
    const scale = (this.dataConfiguration as any).getLegendNumericSizeScale
      ? (this.dataConfiguration as any).getLegendNumericSizeScale(this.partitionMethod)
      : this.dataConfiguration.numericSizeScale;
    if (!scale) return [];
    const sizes = scale.range();
    const thresholds = getScaleThresholds(scale);
    // For N bins, there are N-1 thresholds
    return sizes.map((size: number, index: number) => {
      const min = index === 0 ? -Infinity : thresholds[index - 1];
      const max = index === sizes.length - 1 ? Infinity : thresholds[index];
      // For label/axis, use the midpoint of min/max if both are finite, else use min or max
      let canonicalValue = 0;
      if (isFinite(min) && isFinite(max)) {
        canonicalValue = (min + max) / 2;
      } else if (isFinite(min)) {
        canonicalValue = min;
      } else if (isFinite(max)) {
        canonicalValue = max;
      }
      return {
        size,
        index,
        canonicalValue,
        min,
        max
      };
    });
  }

  get circleMaxDiameter() {
    const { pointValues } = this;
    if (pointValues.length < 1) return 0;
    return pointValues[pointValues.length - 1];
  }

  get layoutData() {
    const fullWidth = this.dataDisplayLayout.tileWidth;
    const rowHeight = this.circleMaxDiameter + padding;
    const numColumns = this.pointValues.length || 1;
    const lod: NumericSizeLegendLayout = {
      fullWidth,
      numColumns,
      rowHeight
    };
    return lod;
  }
}
