import React, { useState, useMemo, useEffect } from "react";
import { Outlines } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { observer } from "mobx-react-lite";
import { codapData } from "../../models/codap-data";
import { dstContainer } from "../../models/dst-container";
import { ui } from "../../models/ui";

// Colors from the choropleth scale
const colors = ["#eff3ff", "#b5cbe6", "#7ca2ce", "#427ab5", "#08519c"];
const DEFAULT_COLOR = "#e6805b";

interface IPointProps {
  id: string;
  visible?: boolean;
  x: number;
  y: number;
  z: number;
}

export const Point = observer(function Point({ id, visible, x, y, z }: IPointProps) {
  const [isPointerOver, setPointerOver] = useState(false);
  
  const colorDataConfig = dstContainer.dataDisplayModel.colorDataConfiguration;
  const sizeDataConfig = dstContainer.dataDisplayModel.sizeDataConfiguration;
  
  // Check if a color legend attribute is set
  const colorLegendId = colorDataConfig?.attributeID("legend");
  const hasColorConfig = !!colorDataConfig;
  const legendValue = colorDataConfig?.dataset?.getStrValue(id, colorLegendId || "");
  const legendType = colorDataConfig?.attributeType("legend");
  
  // Get the color based on the configuration
  const color = colorDataConfig?.getLegendColorForCase(id) || DEFAULT_COLOR;
  
  // Get the size based on the configuration (partition-aware, safe fallback)
  let size = 10;
  if (sizeDataConfig && typeof sizeDataConfig.getLegendSizeForCase === "function") {
    size = sizeDataConfig.getLegendSizeForCase(id) || 10;
  }
  
  // Calculate the thresholds for the current legend attribute once per render
  // This ensures all points use the same thresholds
  const thresholds = useMemo(() => {
    if (!colorDataConfig?.dataset || !colorLegendId || legendType !== "numeric") {
      return [];
    }
    
    const numericValues = Array.from(colorDataConfig.numericValuesForAttrRole("legend") || []);
    if (numericValues.length === 0) {
      return [];
    }
    
    // Sort the values to determine quantile thresholds
    const sortedValues = [...numericValues].sort((a, b) => a - b);
    const valueCount = sortedValues.length;
    
    // Calculate threshold indices for approximately equal groups
    const step = Math.max(1, Math.floor(valueCount / colors.length));
    const result = [];
    
    for (let i = 1; i < colors.length; i++) {
      const thresholdIndex = Math.min(i * step, valueCount - 1);
      result.push(sortedValues[thresholdIndex]);
    }
    
    return result;
  }, [colorDataConfig, colorLegendId, legendType, colorDataConfig.partitionMethod]);
  
  // Dynamic color assignment that will respond to legend changes
  let dotColor = color; // Default color
  
  if (colorLegendId && legendValue) {
    // Try the standard CODAP color first
    const standardColor = colorDataConfig.getLegendColorForCase(id);
    
    if (standardColor && standardColor !== "#888888") {
      // If the standard system provides a non-missing color, use it
      dotColor = standardColor;
    } else if (legendType === "numeric") {
      // Otherwise fall back to our manual color calculation
      const numericValue = colorDataConfig?.dataset?.getNumeric(id, colorLegendId);
      
      if (numericValue !== undefined && numericValue !== null) {
        if (thresholds.length > 0) {
          // Determine which color to use based on thresholds
          let colorIndex = 0;
          for (let i = 0; i < thresholds.length; i++) {
            if (numericValue >= thresholds[i]) {
              colorIndex = i + 1;
            }
          }
          
          dotColor = colors[colorIndex];
        } else {
          // If for some reason we don't have thresholds, use a linear scale based on the value
          // Find min and max values in the dataset for this attribute
          const allValues = colorDataConfig.dataset && colorLegendId ? 
            Array.from(colorDataConfig.numericValuesForAttrRole("legend") || []) : [];
          
          if (allValues.length > 0) {
            const min = Math.min(...allValues);
            const max = Math.max(...allValues);
            const range = max - min;
            
            if (range > 0) {
              // Normalize the value to 0-1 range
              const normalizedValue = Math.max(0, Math.min(1, (numericValue - min) / range));
              // Map to color index
              const colorIndex = Math.min(colors.length - 1, Math.floor(normalizedValue * colors.length));
              dotColor = colors[colorIndex];
            } else {
              // All values are the same, use middle color
              dotColor = colors[Math.floor(colors.length / 2)];
            }
          } else {
            dotColor = DEFAULT_COLOR;
          }
        }
      } else {
        // Not a valid number
        dotColor = DEFAULT_COLOR;
      }
    } else if (legendType === "categorical") {
      // For categorical values, try to get a computed color or use default
      const categoryColor = colorDataConfig.getLegendColorForCase(id);
      if (categoryColor && categoryColor !== "#888888" && categoryColor.startsWith("#")) {
        dotColor = categoryColor;
      }
    }
  }
  
  const dotDiameterInPixels = size;
  const basePointSize = dotDiameterInPixels * 0.0195;
  const isSelected = codapData.isSelected(id);
  const selectedExtra = isSelected ? .02 : 0;
  const hoverMultiplier = isPointerOver ? 1.5 : 1;
  const targetPointSize = (basePointSize + selectedExtra) * hoverMultiplier;
  const pointSizeSpeed = 0.5;
  const [pointSize, setPointSize] = useState(targetPointSize);
  const outlineColor = isSelected ? "#FF0000" : "#FFFFFF";
  const outlineWidth = isSelected ? 2 : 1;
  
  // Transform slider value to perceived opacity using a quadratic curve
  const transformOpacity = (sliderValue: number): number => {
    // Use quadratic curve to make middle range more sensitive
    // This will create an S-curve that's more sensitive in the middle range
    return Math.pow(sliderValue, 1.5);
  };
  
  // Update opacity calculation to use OpacityManager
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const pointOpacity = useMemo(() => {
    // Selected points are always fully opaque
    if (isSelected) return 1;
    
    // In see-through mode, use the slider opacity directly
    if (ui.seeThroughMode) {
      return ui.unselectedPointsOpacity;
    }
    
    // In normal mode, respect the checkbox setting
    return ui.showUnselectedPoints ? 1 : 0;
  }, [isSelected, ui.seeThroughMode, ui.showUnselectedPoints, ui.unselectedPointsOpacity]);

  // Effect to handle selection changes
  useEffect(() => {
    if (!isSelected && ui.seeThroughMode) {
      ui.opacityManager.handleSelectionChange(false);
    }
  }, [isSelected]);
  
  // Determine if the point should be visible at all
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const pointVisible = useMemo(() => {
    if (isSelected) {
      // Selected points visibility is controlled by the selected checkbox
      return ui.showSelectedPoints;
    }
    
    // For unselected points in see-through mode, they're visible
    // if opacity > 0 (controlled by slider)
    if (ui.seeThroughMode) {
      return ui.unselectedPointsOpacity > 0;
    }
    
    // In normal mode, visibility is controlled by the unselected checkbox
    return ui.showUnselectedPoints;
  }, [isSelected, ui.seeThroughMode, ui.showSelectedPoints, ui.showUnselectedPoints, ui.unselectedPointsOpacity]);

  useFrame((_state, delta) => {
    if (pointSize < targetPointSize) {
      setPointSize(Math.min(pointSize + delta * pointSizeSpeed, targetPointSize));
    } else if (pointSize > targetPointSize) {
      setPointSize(Math.max(pointSize - delta * pointSizeSpeed, targetPointSize));
    }
  });

  // Determine the position of the point in graph space.
  const position = new Vector3(x, y, z);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (ui.mode === "pointer") {
      event.stopPropagation();
      if (event.shiftKey) {
        if (isSelected) {
          codapData.dataSet.selectCases([id], false);
        } else {
          codapData.dataSet.selectCases([id]);
        }
      } else {
        codapData.dataSet.setSelectedCases([id]);
      }
    }
  };

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    if (ui.mode === "pointer") {
      event.stopPropagation();
      setPointerOver(true);
    }
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    if (ui.mode === "pointer") {
      event.stopPropagation();
      setPointerOver(false);
    }
  };

  // Don't render anything if point shouldn't be visible
  if (!pointVisible || !visible) {
    return null;
  }

  /* eslint-disable react/no-unknown-property */
  return (
    <mesh
      position={position}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      visible={visible}
    >
      <sphereGeometry args={[pointSize, 16, 16]} />
      <meshBasicMaterial 
        color={dotColor}
        transparent={true}
        opacity={pointOpacity}
      />
      <Outlines 
        color={outlineColor}
        thickness={outlineWidth * 0.4}
        opacity={pointOpacity}
        transparent={true}
      />
    </mesh>
  );
  /* eslint-enable react/no-unknown-property */
});
