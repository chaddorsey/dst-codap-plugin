import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { DndContext, useSensors } from "@dnd-kit/core";

import { FocusIgnoreFn, ITileSelection, TileSelectionContext } from "../codap/hooks/use-tile-selection-context";
import { DataDisplayLayoutContext } from "../codap/components/data-display/hooks/use-data-display-layout";
import { DataDisplayLayout } from "../codap/components/data-display/models/data-display-layout";
import { legendComponentManager } from "../codap/components/data-display/components/legend/legend";
import { IBaseLegendProps } from "../codap/components/data-display/components/legend/legend-common";
import { dstContainer } from "../models/dst-container";
import { IDstDataConfigurationModel } from "../models/dst-data-configuration-model";
import { kInitialDimensions } from "../utilities/constants";
import { DstDataDisplayModelContext } from "./hooks/use-dst-data-display-model";
import { CategoricalSizeLegend } from "./legend/categorical-size-legend";
import { DstMultiLegend } from "./legend/dst-multi-legend";
import { NumericSizeLegendReboot } from "./legend/numeric-size-legend-reboot";
import { datasetConfig } from "../models/dataset-config";

import "./dst-legend.scss";

const sizeLegendComponentMap: Partial<Record<string, React.ComponentType<IBaseLegendProps>>> = {
  categorical: CategoricalSizeLegend,
  numeric: NumericSizeLegendReboot
};

// register our new legends
legendComponentManager.getLegendComponent = (dataConfig) => {
  const type = dataConfig.attributeType("legend");
  const representation = (dataConfig as IDstDataConfigurationModel).legendRepresentation;

  if (representation === "size" && type) {
    const component = sizeLegendComponentMap[type];
    if (component) return component;
  }

  // If the representation is size by the type is numeric or date then the result is currently
  // broken. The legend will show as color numeric legend. But the points will get rendered
  // based on a size scale
  return type && legendComponentManager.legendComponentMap[type];
};

const tileSelection: ITileSelection = {
  isTileSelected() {
    throw new Error("Function not implemented.");
  },
  selectTile() {
    throw new Error("Function not implemented.");
  },
  addFocusIgnoreFn(ignoreFn: FocusIgnoreFn) {
    throw new Error("Function not implemented.");
  }
};

// Set up layout with proper sizing for the legends
const dataDisplayLayout = new DataDisplayLayout({
  tileWidth: kInitialDimensions.width,
  // Account for tabs and allocate sufficient space for legends
  tileHeight: kInitialDimensions.height
});

// Initialize layout with default legend height to prevent jumping on load
dataDisplayLayout.setDesiredExtent("legend", 180);

export const DstLegend = observer(function DstLegend() {
  // Disable Drag and Drop
  const sensors = useSensors();
  
  console.log("Rendering DstLegend component");
  
  // Initialize legend configurations from dataset configuration if available
  useEffect(() => {
    console.log("DstLegend useEffect running");
    const dataset = dstContainer.dataSet;
    const { colorAttribute, sizeAttribute } = datasetConfig;
    
    console.log("Dataset config:", { colorAttribute, sizeAttribute });
    
    // Set up color attribute if configured and not already set
    if (colorAttribute && dataset && !dstContainer.dataDisplayModel.colorDataConfiguration.attributeID("legend")) {
      const colorAttr = dataset.getAttributeByName(colorAttribute);
      if (colorAttr) {
        console.log(`Setting color attribute to ${colorAttribute} (ID: ${colorAttr.id})`);
        const configuration = dstContainer.dataDisplayModel.colorDataConfiguration;
        configuration.setAttribute("legend", { attributeID: colorAttr.id });
        if (configuration.metadata) {
          configuration.metadata.setAttributeBinningType(colorAttr.id, "quantile");
        }
      }
    }
    
    // Set up size attribute if configured and not already set
    if (sizeAttribute && dataset && !dstContainer.dataDisplayModel.sizeDataConfiguration.attributeID("legend")) {
      const sizeAttr = dataset.getAttributeByName(sizeAttribute);
      if (sizeAttr) {
        console.log(`Setting size attribute to ${sizeAttribute} (ID: ${sizeAttr.id})`);
        const configuration = dstContainer.dataDisplayModel.sizeDataConfiguration;
        configuration.setAttribute("legend", { attributeID: sizeAttr.id });
        if (configuration.metadata) {
          configuration.metadata.setAttributeBinningType(sizeAttr.id, "quantile");
        }
      }
    }
  }, []);

  // Create a simpler legend structure
  return (
    <div className="dst-legend">
      <DndContext sensors={sensors}>
        <DataDisplayLayoutContext.Provider value={dataDisplayLayout}>
          <TileSelectionContext.Provider value={tileSelection}>
            <DstDataDisplayModelContext.Provider value={dstContainer.dataDisplayModel}>
              <DstMultiLegend divElt={null} 
                onChangeAttribute={(dataSet, attrId, layer) => {
                  // TODO: handle mis-matched dataSet
                  if (!layer) {
                    console.warn("No layer available when changing legend attribute");
                    return;
                  }
                  const configuration = layer.dataConfiguration;
                  if (attrId) {
                    console.log(`Changing legend attribute to ID: ${attrId}`);
                    configuration.setAttribute("legend", {attributeID: attrId});
                    configuration.metadata?.setAttributeBinningType(attrId, "quantile");  
                  } else {
                    console.log("Clearing legend attribute");
                    configuration.setAttribute("legend");
                  }
                }}
              />
            </DstDataDisplayModelContext.Provider>
          </TileSelectionContext.Provider>
        </DataDisplayLayoutContext.Provider>
      </DndContext>
    </div>
  );
});
