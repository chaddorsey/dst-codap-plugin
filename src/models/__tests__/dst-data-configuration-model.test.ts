import { types, onSnapshot } from "mobx-state-tree";
import { DstDataConfigurationModel, defaultPointDiameter } from "../dst-data-configuration-model";

describe("DstDataConfigurationModel - Partition-Aware Size Legend", () => {
  let model: any;
  let dataset: any;

  beforeEach(() => {
    // Mock dataset with numeric and categorical legend values
    dataset = {
      getAttribute: jest.fn((id) => ({
        numValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        changeCount: 0
      })),
      getNumeric: jest.fn((id, attr) => id),
      getStrValue: jest.fn((id, attr) => id),
      getCasesForCollection: jest.fn(() => []),
      isCaseSelected: jest.fn(() => false)
    };
    model = DstDataConfigurationModel.create({
      legendRepresentation: "size",
      partitionMethod: "quantile"
    }, { dataset });
    jest.clearAllMocks();
  });

  it("assigns correct sizes for quantile partition", () => {
    model.setPartitionMethod("quantile");
    const size1 = model.getLegendSizeForCase(1);
    const size10 = model.getLegendSizeForCase(10);
    expect(typeof size1).toBe("number");
    expect(typeof size10).toBe("number");
    expect(size1).not.toBe(size10); // Should be in different bins
  });

  it("assigns correct sizes for quantize partition", () => {
    model.setPartitionMethod("quantize");
    const size1 = model.getLegendSizeForCase(1);
    const size10 = model.getLegendSizeForCase(10);
    expect(typeof size1).toBe("number");
    expect(typeof size10).toBe("number");
    expect(size1).not.toBe(size10); // Should be in different bins
  });

  it("updates sizes when partition method is toggled", () => {
    model.setPartitionMethod("quantile");
    const sizeQuantile = model.getLegendSizeForCase(5);
    model.setPartitionMethod("quantize");
    const sizeQuantize = model.getLegendSizeForCase(5);
    expect(sizeQuantile).not.toBe(sizeQuantize);
  });

  it("returns default size for missing or invalid values", () => {
    dataset.getNumeric = jest.fn(() => undefined);
    const size = model.getLegendSizeForCase("missing");
    expect(size).toBe(defaultPointDiameter);
  });

  it("handles empty bins gracefully", () => {
    dataset.getAttribute = jest.fn(() => ({ numValues: [], changeCount: 0 }));
    const size = model.getLegendSizeForCase(1);
    expect(size).toBe(defaultPointDiameter);
  });
}); 
