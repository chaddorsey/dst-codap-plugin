import { codapInterface } from "@concord-consortium/codap-plugin-api";
import { datasetConfig } from "../models/dataset-config";

/**
 * Interface for coordinate bounds result
 */
interface CoordinateBoundsResult {
  success: boolean;
  minLat?: number;
  maxLat?: number;
  minLong?: number;
  maxLong?: number;
  error?: string;
}

/**
 * Interface for formula search result
 */
interface FormulaSearchResult {
  success: boolean;
  values?: any[];
  error?: string;
}

/**
 * Interface for CODAP API response
 */
interface CodapApiResponse {
  success: boolean;
  values?: any;
}

/**
 * Execute a formula search in CODAP
 * @param dataContextName - The name of the data context
 * @param collectionName - The name of the collection
 * @param formula - The formula to search with
 * @returns The result of the formula search
 */
export async function executeFormulaSearch(
  dataContextName: string,
  collectionName: string,
  formula: string
): Promise<FormulaSearchResult> {
  try {
    const result = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${collectionName}].caseFormulaSearch[${formula}]`
    }) as CodapApiResponse;

    return {
      success: result.success,
      values: result.values
    };
  } catch (error) {
    console.error("Error executing formula search:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Gets the minimum and maximum coordinates from the dataset
 * @returns A promise resolving to the coordinate bounds or null if not available
 */
export async function getMinMaxCoordinates(): Promise<CoordinateBoundsResult | null> {
  // Ensure we have a data context configured
  const dataContextName = datasetConfig.dataContextName;
  if (!dataContextName) {
    console.warn("No data context configured for coordinate bounds");
    return null;
  }

  try {
    // Verify the data context exists
    const contextResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}]`
    }) as CodapApiResponse;

    if (!contextResult.success) {
      console.warn(`Data context ${dataContextName} not found`);
      return null;
    }

    // Get collections to find the right one for case data
    const collectionsResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collections`
    }) as CodapApiResponse;

    if (!collectionsResult.success || !collectionsResult.values || collectionsResult.values.length === 0) {
      console.warn(`No collections found in data context ${dataContextName}`);
      return null;
    }

    // Use the first collection (typically "Cases")
    const collectionName = collectionsResult.values[0].name;

    // Verify attributes exist
    const attributesResult = await codapInterface.sendRequest({
      action: "get",
      resource: `dataContext[${dataContextName}].collection[${collectionName}].attributes`
    }) as CodapApiResponse;

    if (!attributesResult.success) {
      console.warn(`Failed to retrieve attributes for collection ${collectionName}`);
      return null;
    }

    const latAttr = datasetConfig.latitudeAttribute;
    const longAttr = datasetConfig.longitudeAttribute;

    if (!latAttr || !longAttr) {
      console.warn("Latitude or longitude attributes not configured");
      return null;
    }

    // Get min/max values for lat/long
    const minLatResult = await executeFormulaSearch(
      dataContextName,
      collectionName,
      `${latAttr}=min(${latAttr})`
    );

    const maxLatResult = await executeFormulaSearch(
      dataContextName,
      collectionName,
      `${latAttr}=max(${latAttr})`
    );

    const minLongResult = await executeFormulaSearch(
      dataContextName,
      collectionName,
      `${longAttr}=min(${longAttr})`
    );

    const maxLongResult = await executeFormulaSearch(
      dataContextName,
      collectionName,
      `${longAttr}=max(${longAttr})`
    );

    // Extract values
    const minLat = minLatResult.success && minLatResult.values?.length ? 
      minLatResult.values[0].values[latAttr] : undefined;
    
    const maxLat = maxLatResult.success && maxLatResult.values?.length ? 
      maxLatResult.values[0].values[latAttr] : undefined;
    
    const minLong = minLongResult.success && minLongResult.values?.length ? 
      minLongResult.values[0].values[longAttr] : undefined;
    
    const maxLong = maxLongResult.success && maxLongResult.values?.length ? 
      maxLongResult.values[0].values[longAttr] : undefined;

    return {
      success: true,
      minLat,
      maxLat,
      minLong,
      maxLong
    };
  } catch (error) {
    console.error("Error getting coordinate bounds:", error);
    return null;
  }
} 
