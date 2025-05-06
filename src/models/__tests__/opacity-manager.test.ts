import { OpacityManager } from "../opacity-manager";

describe("OpacityManager", () => {
  let opacityManager: OpacityManager;

  beforeEach(() => {
    jest.useFakeTimers();
    opacityManager = new OpacityManager();
  });

  afterEach(() => {
    jest.useRealTimers();
    opacityManager.dispose();
  });

  describe("State Management", () => {
    it("should initialize with default values", () => {
      expect(opacityManager.isLocked).toBeFalsy();
      expect(opacityManager.currentOpacity).toBe(1);
      expect(opacityManager.targetOpacity).toBe(1);
    });

    it("should lock state during updates", () => {
      opacityManager.lockState();
      expect(opacityManager.isLocked).toBeTruthy();
      opacityManager.unlockState();
      expect(opacityManager.isLocked).toBeFalsy();
    });

    it("should preserve opacity during locked state", () => {
      opacityManager.setTargetOpacity(0.5);
      const midOpacity = opacityManager.targetOpacity;
      opacityManager.lockState();
      opacityManager.setTargetOpacity(0.8); // Should not change while locked
      expect(opacityManager.targetOpacity).toBe(midOpacity);
      opacityManager.unlockState();
      opacityManager.setTargetOpacity(0.8);
      expect(opacityManager.targetOpacity).toBe(0.8);
    });
  });

  describe("Opacity Transformations", () => {
    it("should apply non-linear transformation to display opacity", () => {
      // Test various points along the range
      const testPoints = [0, 0.25, 0.5, 0.75, 1];
      
      testPoints.forEach(point => {
        opacityManager.setTargetOpacity(point);
        const displayOpacity = opacityManager.getDisplayOpacity();
        
        // For power < 1, transformed value should be greater than input for values between 0 and 1
        if (point > 0 && point < 1) {
          expect(displayOpacity).toBeGreaterThanOrEqual(point);
        } else {
          // 0 and 1 should remain unchanged
          expect(displayOpacity).toBe(point);
        }

        // Ensure opacity is always in valid range
        expect(displayOpacity).toBeGreaterThanOrEqual(0);
        expect(displayOpacity).toBeLessThanOrEqual(1);
      });
    });

    it("should handle opacity transitions smoothly", () => {
      opacityManager.setTargetOpacity(0.5);
      const transitioningOpacity = opacityManager.getTransitioningOpacity();
      expect(transitioningOpacity).toBeLessThanOrEqual(1);
      expect(transitioningOpacity).toBeGreaterThanOrEqual(0);
    });

    it("should complete transitions", () => {
      const targetValue = 0.3;
      opacityManager.setTargetOpacity(targetValue);
      opacityManager.completeTransition();
      expect(opacityManager.currentOpacity).toBe(targetValue);
    });
  });

  describe("Selection State Integration", () => {
    it("should handle selection state changes", () => {
      opacityManager.handleSelectionChange(true);
      expect(opacityManager.isLocked).toBeTruthy();
      // Should unlock after internal timeout
      jest.advanceTimersByTime(100);
      expect(opacityManager.isLocked).toBeFalsy();
    });

    it("should maintain opacity through selection changes", () => {
      opacityManager.setTargetOpacity(0.4);
      const expectedOpacity = opacityManager.targetOpacity;
      opacityManager.handleSelectionChange(true);
      expect(opacityManager.targetOpacity).toBe(expectedOpacity);
      jest.advanceTimersByTime(100);
      expect(opacityManager.targetOpacity).toBe(expectedOpacity);
    });
  });
}); 
