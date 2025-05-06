import { codapInterface } from "./codap-interface";
import { CodapApiResult, CodapCase } from "./codap-types";
import { codapData } from "../models/codap-data";
import { graph } from "../models/graph";
import { analyzeDateString } from "./date-utils";
import { action, runInAction } from "mobx";

export class DateRangeManager {
  private readonly DEFAULT_SAMPLE_SIZE = 200;
  private readonly DATE_MARGIN_FACTOR = 0.05; // 5% margin

  /**
   * Updates the date range based on the dataset
   * Uses a two-phase approach:
   * 1. Quick sampling for immediate feedback
   * 2. Precise calculation in background if needed
   */
  public async updateDateRange(
    dataContextName: string,
    dateAttr: string
  ): Promise<void> {
    if (!dataContextName || !dateAttr) {
      console.warn("Missing required parameters for date range update");
      return;
    }

    try {
      // Phase 1: Quick sampling for immediate feedback
      console.log("Phase 1: Quick sampling for date range...");
      const quickBounds = await this.getSampledDateRange(
        dataContextName,
        dateAttr,
        50 // Smaller sample for quick feedback
      );

      if (quickBounds) {
        this.setDateRange(quickBounds.min, quickBounds.max);
      }

      // Phase 2: Get precise bounds using stats or larger sample
      console.log("Phase 2: Getting precise date range...");
      const preciseBounds = await this.getPreciseDateRange(
        dataContextName,
        dateAttr
      );

      if (preciseBounds) {
        this.setDateRange(preciseBounds.min, preciseBounds.max);
      } else if (!quickBounds) {
        console.warn("Could not determine date range from dataset");
      }
    } catch (error) {
      console.error("Error updating date range:", error);
    }
  }

  /**
   * Try to get precise date range using stats first, then sampling
   */
  private async getPreciseDateRange(
    dataContextName: string,
    dateAttr: string
  ): Promise<{ min: number; max: number } | null> {
    // Try stats first (fastest when available)
    const statsResult = await this.getDateRangeFromStats(dataContextName, dateAttr);
    if (statsResult) return statsResult;

    // Fall back to larger sampling
    return this.getSampledDateRange(dataContextName, dateAttr);
  }

  /**
   * Get date range from pre-computed stats (fastest when available)
   */
  private async getDateRangeFromStats(
    dataContextName: string,
    dateAttr: string
  ): Promise<{ min: number; max: number } | null> {
    try {
      const result = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].collection[Cases].attributeSummary[${dateAttr}]`
      }) as CodapApiResult;

      if (!result.success || !result.values) return null;

      if (!("min" in result.values) || !("max" in result.values)) return null;
      const { min, max } = result.values;
      if (!min || !max) return null;

      const minDate = this.parseDate(min);
      const maxDate = this.parseDate(max);

      if (!minDate || !maxDate) return null;

      return { min: minDate, max: maxDate };
    } catch (error) {
      console.warn("Error getting date range from stats:", error);
      return null;
    }
  }

  /**
   * Get date range by sampling cases
   */
  private async getSampledDateRange(
    dataContextName: string,
    dateAttr: string,
    sampleSize: number = this.DEFAULT_SAMPLE_SIZE
  ): Promise<{ min: number; max: number } | null> {
    try {
      const result = await codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${dataContextName}].collection[Cases].caseCount[0:${sampleSize}]`
      }) as CodapApiResult;

      if (!result.success || !result.values || !Array.isArray(result.values)) {
        return null;
      }

      let minDate: number | null = null;
      let maxDate: number | null = null;
      let foundValidDates = false;

      for (const caseData of result.values as CodapCase[]) {
        const dateValue = this.extractDateValue(caseData, dateAttr);
        if (!dateValue) continue;

        const timestamp = this.parseDate(dateValue);
        if (!timestamp) continue;

        if (!foundValidDates) {
          minDate = maxDate = timestamp;
          foundValidDates = true;
        } else {
          minDate = Math.min(minDate!, timestamp);
          maxDate = Math.max(maxDate!, timestamp);
        }
      }

      if (!foundValidDates || minDate === null || maxDate === null) {
        return null;
      }

      return { min: minDate, max: maxDate };
    } catch (error) {
      console.warn("Error getting sampled date range:", error);
      return null;
    }
  }

  /**
   * Extract date value from case data
   */
  private extractDateValue(caseData: any, dateAttr: string): string | number | null {
    if (!caseData) return null;

    // Try different paths to find the date value
    if (caseData.values?.[dateAttr] !== undefined) {
      return caseData.values[dateAttr];
    }
    if (caseData[dateAttr] !== undefined) {
      return caseData[dateAttr];
    }
    return null;
  }

  /**
   * Parse a date value to timestamp
   */
  private parseDate(value: any): number | null {
    if (!value) return null;

    // If already a number, check if it's a reasonable timestamp
    if (typeof value === "number") {
      // If small number, assume it's days since epoch
      if (value < 10000) {
        const referenceDate = new Date(2000, 0, 1).getTime();
        return referenceDate + (value * 24 * 60 * 60 * 1000);
      }
      return value;
    }

    // Parse string dates
    if (typeof value === "string") {
      const analysis = analyzeDateString(value);
      if (analysis.isValid && analysis.parsed) {
        return analysis.parsed.getTime();
      }
    }

    return null;
  }

  /**
   * Set the date range in the graph model using MobX action
   */
  @action
  private setDateRange(min: number, max: number): void {
    if (min >= max) {
      console.warn("Invalid date range: min >= max");
      return;
    }

    // Add margin to the range
    const span = max - min;
    const margin = span * this.DATE_MARGIN_FACTOR;
    const minWithMargin = min - margin;
    const maxWithMargin = max + margin;

    // Update the model
    codapData.setAbsoluteDateRange(minWithMargin, maxWithMargin);
    graph.resetDateVisualization();

    console.log("Set date range:", {
      min: new Date(minWithMargin).toISOString(),
      max: new Date(maxWithMargin).toISOString()
    });
  }
} 
