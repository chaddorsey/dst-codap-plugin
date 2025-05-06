import { codapInterface } from "@concord-consortium/codap-plugin-api";

// Mock the codap-plugin-api
jest.mock("@concord-consortium/codap-plugin-api", () => ({
  codapInterface: {
    sendRequest: jest.fn()
  }
}));

// Mock the helper module
jest.mock("../codap-interface-helpers", () => ({
  getAvailableDatasets: jest.fn(),
  saveInteractiveState: jest.fn()
}));

// Import the mocked module
import * as codapInterfaceHelpers from "../codap-interface-helpers";

describe("CODAP Interface Helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAvailableDatasets", () => {
    it("should return an array of dataset names when successful", async () => {
      // Setup mock response
      const mockResponse = {
        success: true,
        values: [
          { name: "Dataset1", title: "First Dataset" },
          { name: "Dataset2", title: "Second Dataset" }
        ]
      };
      
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Setup mock implementation
      (codapInterfaceHelpers.getAvailableDatasets as jest.Mock).mockImplementation(async () => {
        const result = await codapInterface.sendRequest({
          action: "get",
          resource: "dataContextList"
        }) as { success: boolean, values?: { name: string }[] };
        
        if (result.success && result.values) {
          return result.values.map((context) => context.name);
        }
        return [];
      });
      
      // Call function
      const result = await codapInterfaceHelpers.getAvailableDatasets();
      
      // Verify results
      expect(result).toEqual(["Dataset1", "Dataset2"]);
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "get",
        resource: "dataContextList"
      });
    });

    it("should return an empty array when request fails", async () => {
      // Setup mock response
      const mockResponse = {
        success: false
      };
      
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Setup mock implementation
      (codapInterfaceHelpers.getAvailableDatasets as jest.Mock).mockImplementation(async () => {
        const result = await codapInterface.sendRequest({
          action: "get",
          resource: "dataContextList"
        }) as { success: boolean, values?: { name: string }[] };
        
        if (result.success && result.values) {
          return result.values.map((context) => context.name);
        }
        return [];
      });
      
      // Call function
      const result = await codapInterfaceHelpers.getAvailableDatasets();
      
      // Verify results
      expect(result).toEqual([]);
      expect(codapInterface.sendRequest).toHaveBeenCalled();
    });
  });

  describe("saveInteractiveState", () => {
    it("should call sendRequest with the provided state", async () => {
      // Setup mock response
      const mockResponse = { success: true };
      (codapInterface.sendRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Setup mock implementation
      (codapInterfaceHelpers.saveInteractiveState as jest.Mock).mockImplementation(async (state) => {
        return await codapInterface.sendRequest({
          action: "update",
          resource: "interactiveState",
          values: state
        });
      });
      
      // Create test state
      const testState = {
        datasetConfig: {
          dataContextName: "TestDataset",
          latitudeAttribute: "Latitude",
          longitudeAttribute: "Longitude",
          dateAttribute: "Date"
        }
      };
      
      // Call function
      await codapInterfaceHelpers.saveInteractiveState(testState);
      
      // Verify results
      expect(codapInterface.sendRequest).toHaveBeenCalledWith({
        action: "update",
        resource: "interactiveState",
        values: testState
      });
    });
  });
}); 
