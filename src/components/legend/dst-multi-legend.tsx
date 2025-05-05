import {observer} from "mobx-react-lite";
import React, {createRef, RefObject, useCallback, useRef, useState, useEffect} from "react";
import { Select, Flex, Text, Spinner } from "@chakra-ui/react";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { DataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { Legend } from "../../codap/components/data-display/components/legend/legend";
import { IBaseLayerModel } from "../../codap/components/data-display/models/base-data-display-content-model";
import { IDataSet } from "../../codap/models/data/data-set";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { useDstDataDisplayModelContext } from "../hooks/use-dst-data-display-model";
import { datasetConfig } from "../../models/dataset-config";
import { getDatasetAttributes } from "../../utilities/codap-dataset-utils";

interface IMultiLegendProps {
  divElt: HTMLDivElement | null
  onChangeAttribute: (dataSet: IDataSet, attrId: string, layer: IBaseLayerModel) => void
}

// Define simpler attribute interface to avoid MobX issues
interface SafeAttribute {
  id: string;
  name: string;
  isTemporary?: boolean;
}

export const DstMultiLegend = observer(function MultiLegend({divElt, onChangeAttribute}: IMultiLegendProps) {
  const dataDisplayModel = useDstDataDisplayModelContext(),
    layout = useDataDisplayLayout(),
    legendRef = useRef() as React.RefObject<HTMLDivElement>,
    divRefs = useRef<RefObject<HTMLDivElement>[]>([]),
    extentsRef = useRef([] as number[]),
    firstDataConfiguration = dataDisplayModel.layers[0].dataConfiguration,
    dataset = firstDataConfiguration.dataset,
    metadata = firstDataConfiguration.metadata;
  
  // Use our safe attribute format to avoid MobX state tree issues
  const [availableAttributes, setAvailableAttributes] = useState<SafeAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Keep track of selected attributes separately from MobX to avoid detached object errors
  const [selectedColorAttribute, setSelectedColorAttribute] = useState<SafeAttribute | null>(null);
  const [selectedSizeAttribute, setSelectedSizeAttribute] = useState<SafeAttribute | null>(null);

  // Partitioning method state for each legend
  const [colorPartitionMethod, setColorPartitionMethod] = useState<"quantile" | "quantize">("quantile");
  const [sizePartitionMethod, setSizePartitionMethod] = useState<"quantile" | "quantize">("quantile");

  // Load attributes from the dataset when component mounts or dataset changes
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => {
    const loadAttributes = async () => {
      if (!dataset) return;
      
      setIsLoading(true);
      console.log("Loading attributes from dataset");
      
      try {
        // Create safe copies of the dataset attributes to avoid MobX issues
        const safeAttributes: SafeAttribute[] = dataset.attributes.map(attr => ({
          id: attr.id,
          name: attr.name,
          isTemporary: false
        }));
        
        console.log("Dataset attributes:", safeAttributes.map(a => a.name));
        
        // Load attributes from CODAP
        if (datasetConfig.dataContextName) {
          try {
            const codapAttrNames = await getDatasetAttributes(datasetConfig.dataContextName);
            console.log("CODAP attributes:", codapAttrNames);
            
            // Create attribute objects for any attributes in CODAP not already in our list
            const existingAttrNames = new Set(safeAttributes.map(attr => attr.name));
            
            for (const attrName of codapAttrNames) {
              if (!existingAttrNames.has(attrName) && attrName) {
                // Create a temporary attribute object for display
                const tempAttr: SafeAttribute = {
                  id: `temp_${attrName.replace(/\s+/g, "_")}`,
                  name: attrName,
                  isTemporary: true
                };
                safeAttributes.push(tempAttr);
                console.log(`Added temporary attribute: ${attrName}`);
              }
            }
          } catch (error) {
            console.error("Error loading CODAP attributes:", error);
          }
        }
        
        // Sort attributes by name for better usability
        safeAttributes.sort((a, b) => a.name.localeCompare(b.name));
        
        // Update state with all available attributes
        setAvailableAttributes(safeAttributes);
        
        // Attempt to find and set the currently selected color attribute
        const colorId = dataDisplayModel.colorDataConfiguration.attributeID("legend");
        if (colorId) {
          const foundAttr = safeAttributes.find(attr => attr.id === colorId);
          if (foundAttr) {
            setSelectedColorAttribute(foundAttr);
          } else if (datasetConfig.colorAttribute) {
            // Try to find by name if ID doesn't match (for temporary attributes)
            const attrByName = safeAttributes.find(attr => attr.name === datasetConfig.colorAttribute);
            if (attrByName) {
              setSelectedColorAttribute(attrByName);
              // Update the configuration with this attribute
              dataDisplayModel.colorDataConfiguration.setAttribute("legend", {attributeID: attrByName.id});
            }
          }
        }
        
        // Attempt to find and set the currently selected size attribute
        const sizeId = dataDisplayModel.sizeDataConfiguration.attributeID("legend");
        if (sizeId) {
          const foundAttr = safeAttributes.find(attr => attr.id === sizeId);
          if (foundAttr) {
            setSelectedSizeAttribute(foundAttr);
          } else if (datasetConfig.sizeAttribute) {
            // Try to find by name if ID doesn't match (for temporary attributes)
            const attrByName = safeAttributes.find(attr => attr.name === datasetConfig.sizeAttribute);
            if (attrByName) {
              setSelectedSizeAttribute(attrByName);
              // Update the configuration with this attribute
              dataDisplayModel.sizeDataConfiguration.setAttribute("legend", {attributeID: attrByName.id});
            }
          }
        }
      } catch (error) {
        console.error("Error loading attributes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAttributes();
  }, [dataset, datasetConfig.dataContextName, datasetConfig.colorAttribute, datasetConfig.sizeAttribute, dataDisplayModel]);

  // Update layout when component mounts to ensure proper initial spacing
  useEffect(() => {
    // Initial layout setup
    const totalHeight = extentsRef.current.reduce((a, b) => a + b, 0);
    if (totalHeight > 0) {
      layout.setDesiredExtent("legend", totalHeight);
    } else {
      // Set a default initial height if no extents are calculated yet
      layout.setDesiredExtent("legend", 180);
    }
    
    // When unmounting, reset the layout
    return () => {
      layout.setDesiredExtent("legend", 0);
    };
  }, [layout]);

  const setDesiredExtent = useCallback((layerIndex: number, extent: number) => {
    // Store the extent for this layer with a minimum height
    extentsRef.current[layerIndex] = Math.max(extent, 75); // Use 75px as minimum height

    // Calculate total height needed and update layout
    const totalHeight = extentsRef.current.reduce((a, b) => a + b, 0) + 10; // Add 10px for spacing
    layout.setDesiredExtent("legend", Math.max(totalHeight, 180)); // Ensure we use at least the minimum height

    // Update the height of the div if needed
    const theDivElt = divRefs.current[layerIndex]?.current;
    if (theDivElt) {
      // Let CSS handle flexible heights
      if (extent > 75) {
        theDivElt.style.height = `${extentsRef.current[layerIndex]}px`;
      } else {
        theDivElt.style.height = ""; // Let CSS flex handle it
      }
    }
  }, [layout]);

  const handleAttributeChange = (label: string, attributeId: string) => {
    if (!dataset || !availableAttributes.length) return;

    let dataConfiguration: Maybe<IDstDataConfigurationModel>;
    switch (label) {
      case "Color":
        dataConfiguration = dataDisplayModel.colorDataConfiguration;
        break;
      case "Size":
        dataConfiguration = dataDisplayModel.sizeDataConfiguration;
        break;
    }
    
    if (!dataConfiguration) return;

    if (attributeId) {
      // Find the attribute in our safe list
      const selectedAttr = availableAttributes.find(attr => attr.id === attributeId);
      if (!selectedAttr) return;
      
      console.log(`Setting ${label} attribute ID: ${attributeId}`);
      
      // Update our internal state
      if (label === "Color") {
        setSelectedColorAttribute(selectedAttr);
        setColorPartitionMethod("quantile");
      } else if (label === "Size") {
        setSelectedSizeAttribute(selectedAttr);
        setSizePartitionMethod("quantile");
      }
      
      // Set it in the data configuration
      dataConfiguration.setAttribute("legend", {attributeID: attributeId});
      
      // Save the name in the datasetConfig
      if (label === "Color") {
        datasetConfig.setColorAttribute(selectedAttr.name);
      } else if (label === "Size") {
        datasetConfig.setSizeAttribute(selectedAttr.name);
      }
      
      // Set binning type for non-temporary attributes
      if (!selectedAttr.isTemporary && metadata) {
        metadata.setAttributeBinningType(attributeId, "quantile");
      }
    } else {
      console.log(`Clearing ${label} attribute`);
      // Reset the attribute when "None" is selected
      dataConfiguration.setAttribute("legend", undefined);
      
      // Clear our internal state
      if (label === "Color") {
        setSelectedColorAttribute(null);
        datasetConfig.setColorAttribute(undefined);
      } else if (label === "Size") {
        setSelectedSizeAttribute(null);
        datasetConfig.setSizeAttribute(undefined);
      }
    }
  };

  const renderLegend = (label: string, index: number, dataConfiguration?: IDstDataConfigurationModel) => {
    const selectedAttribute = label === "Color" 
      ? selectedColorAttribute 
      : (label === "Size" ? selectedSizeAttribute : null);
    
    const divRef = divRefs.current[index] || createRef<HTMLDivElement>();
    divRefs.current[index] = divRef;
    
    // Get current attribute ID safely from configuration
    const legendAttributeId = dataConfiguration?.attributeID("legend") || "";
    
    return (
      <div className="legend" key={index} ref={divRef}>
        <div className="legend-section">
          <Flex align="center" mb={1}>
            <Text fontWeight="bold" fontSize="sm" mr={2}>{label}:</Text>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <Select 
                size="xs"
                width="auto"
                value={legendAttributeId || ""}
                onChange={(e) => handleAttributeChange(label, e.target.value)}
                placeholder={`Select attribute`}
              >
                <option value="">None</option>
                {availableAttributes.map(attr => (
                  <option key={attr.id} value={attr.id}>{attr.name}</option>
                ))}
              </Select>
            )}
            {/* Controlled radio button group for quantile/quantize toggle */}
            <div data-testid={`legend-partition-toggle-${label.toLowerCase()}`} style={{ marginLeft: 8 }}>
              <label>
                <input
                  type="radio"
                  name={`partition-${label}`}
                  value="quantile"
                  checked={label === "Color" ? colorPartitionMethod === "quantile" : sizePartitionMethod === "quantile"}
                  onChange={() => label === "Color" ? setColorPartitionMethod("quantile") : setSizePartitionMethod("quantile")}
                  data-testid={`partition-radio-quantile-${label.toLowerCase()}`}
                />
                Quantile
              </label>
              <label style={{ marginLeft: 4 }}>
                <input
                  type="radio"
                  name={`partition-${label}`}
                  value="quantize"
                  checked={label === "Color" ? colorPartitionMethod === "quantize" : sizePartitionMethod === "quantize"}
                  onChange={() => label === "Color" ? setColorPartitionMethod("quantize") : setSizePartitionMethod("quantize")}
                  data-testid={`partition-radio-quantize-${label.toLowerCase()}`}
                />
                Quantize
              </label>
            </div>
          </Flex>
          
          {/* For regular attributes, we can safely show the full legend */}
          {selectedAttribute && !selectedAttribute.isTemporary && (
            <div className="legend-display">
              <DataConfigurationContext.Provider value={dataConfiguration}>
                <Legend layerIndex={index}
                       setDesiredExtent={setDesiredExtent}
                       onDropAttribute={(place, dataSet, attributeID) => onChangeAttribute(dataSet, attributeID, dataDisplayModel.layers[index])}
                       partitionMethod={label === "Color" ? colorPartitionMethod : sizePartitionMethod}
                />
              </DataConfigurationContext.Provider>
            </div>
          )}
          
          {/* For temporary attributes, just show a message */}
          {selectedAttribute && selectedAttribute.isTemporary && (
            <div className="legend-display">
              <Text fontSize="xs" mt={1}>
                Using attribute: {selectedAttribute.name}
                <br />
                <Text as="em" fontSize="10px" color="gray.500">
                  (Legend preview not available for this attribute)
                </Text>
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={legendRef} className="multi-legend">      
      {renderLegend("Color", 0, dataDisplayModel.colorDataConfiguration)}
      {renderLegend("Size", 1, dataDisplayModel.sizeDataConfiguration)}
    </div>
  );
});
