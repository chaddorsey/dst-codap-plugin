import { MapBoundsManager, Bounds } from "../map-bounds-manager";
import { graph } from "../../models/graph";
import { codapInterface } from "../codap-interface";
import { codapData } from "../../models/codap-data";

// Mock CODAP interface
jest.mock("../codap-interface", () => ({
  codapInterface: {
    sendRequest: jest.fn()
  }
}));

// Define the shape of our mocked graph
interface MockGraph {
  absoluteMinLatitude: number;
  absoluteMaxLatitude: number;
  absoluteMinLongitude: number;
  absoluteMaxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
  homeMinLatitude: number;
  homeMaxLatitude: number;
  homeMinLongitude: number;
  homeMaxLongitude: number;
  animateTo: jest.Mock;
}

// Mock the graph model
jest.mock("../../models/graph", () => ({
  graph: {
    absoluteMinLatitude: 0,
    absoluteMaxLatitude: 0,
    absoluteMinLongitude: 0,
    absoluteMaxLongitude: 0,
    minLatitude: 0,
    maxLatitude: 0,
    minLongitude: 0,
    maxLongitude: 0,
    homeMinLatitude: 0,
    homeMaxLatitude: 0,
    homeMinLongitude: 0,
    homeMaxLongitude: 0,
    animateTo: jest.fn()
  } as MockGraph
}));

describe("MapBoundsManager", () => {
  let mapBoundsManager: MapBoundsManager;
  let mockGraph: MockGraph;
  let caseIdsSpy: jest.SpyInstance;

  beforeEach(() => {
    mapBoundsManager = new MapBoundsManager();
    mockGraph = graph as unknown as MockGraph;
    // Reset all graph properties before each test
    Object.keys(mockGraph).forEach(key => {
      if (typeof mockGraph[key as keyof MockGraph] === "number") {
        (mockGraph[key as keyof MockGraph] as number) = 0;
      }
    });
    mockGraph.animateTo.mockClear();
    (codapInterface.sendRequest as jest.Mock).mockClear();
    // Spy on codapData.caseIds getter on the prototype
    caseIdsSpy = jest.spyOn(Object.getPrototypeOf(codapData), "caseIds", "get").mockReturnValue([]);
    (codapData.getLatitude as any) = jest.fn();
    (codapData.getLongitude as any) = jest.fn();
  });

  afterEach(() => {
    // Restore the spy
    if (caseIdsSpy) {
      caseIdsSpy.mockRestore();
    }
  });

  describe("setWorldMapBounds", () => {
    it("should set world map bounds correctly (via updateMapBounds)", async () => {
      await mapBoundsManager.updateMapBounds();
      // Check absolute bounds
      expect(mockGraph.absoluteMinLatitude).toBe(-90);
      expect(mockGraph.absoluteMaxLatitude).toBe(90);
      expect(mockGraph.absoluteMinLongitude).toBe(-180);
      expect(mockGraph.absoluteMaxLongitude).toBe(180);
      // Check visible bounds (slightly inset from absolute bounds)
      expect(mockGraph.minLatitude).toBe(-85);
      expect(mockGraph.maxLatitude).toBe(85);
      expect(mockGraph.minLongitude).toBe(-175);
      expect(mockGraph.maxLongitude).toBe(175);
      // Check home bounds (should match visible bounds)
      expect(mockGraph.homeMinLatitude).toBe(-85);
      expect(mockGraph.homeMaxLatitude).toBe(85);
      expect(mockGraph.homeMinLongitude).toBe(-175);
      expect(mockGraph.homeMaxLongitude).toBe(175);
    });
  });

  describe("updateMapBounds", () => {
    it("should set world bounds and not animate if no in-memory data", async () => {
      await mapBoundsManager.updateMapBounds();
      expect(mockGraph.absoluteMinLatitude).toBe(-90);
      expect(mockGraph.absoluteMaxLatitude).toBe(90);
      expect(mockGraph.absoluteMinLongitude).toBe(-180);
      expect(mockGraph.absoluteMaxLongitude).toBe(180);
      expect(mockGraph.animateTo).not.toHaveBeenCalled();
    });

    it("should animate to bounds if in-memory data is present", async () => {
      // Simulate in-memory data
      caseIdsSpy.mockReturnValue(["case1", "case2"]);
      (codapData.getLatitude as any) = jest.fn()
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(20);
      (codapData.getLongitude as any) = jest.fn()
        .mockReturnValueOnce(30)
        .mockReturnValueOnce(40);

      await mapBoundsManager.updateMapBounds();

      expect(mockGraph.animateTo).toHaveBeenCalled();
      const call = mockGraph.animateTo.mock.calls[0][0];
      expect(call.minLatitude).toBeLessThanOrEqual(10);
      expect(call.maxLatitude).toBeGreaterThanOrEqual(20);
      expect(call.minLongitude).toBeLessThanOrEqual(30);
      expect(call.maxLongitude).toBeGreaterThanOrEqual(40);
    });
  });
}); 
