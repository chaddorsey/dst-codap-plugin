import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import { setOrExtendSelection } from "../../codap/models/data/data-set-utils";
import { mstAutorun } from "../../codap/utilities/mst-autorun";
import { axisGap } from "../../codap/components/axis/axis-types";
import { getStringBounds } from "../../codap/components/axis/axis-utils";
import { kChoroplethHeight } from "../../codap/components/data-display/data-display-types";
import { useDataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { IBaseLegendProps } from "../../codap/components/data-display/components/legend/legend-common";
import { sizeLegend } from "./size-legend-render";
import { sectionedSizeLegend } from "./sectioned-size-legend-render";

import vars from "../../codap/components/vars.scss";

// TODO: Replace choroplethLegend with a new sizeLegend rendering function

export const NumericSizeLegendReboot =
  observer(function NumericSizeLegendReboot({layerIndex, setDesiredExtent, partitionMethod}: IBaseLegendProps) {
    const dataConfiguration = useDataConfigurationContext(),
      tileWidth = useDataDisplayLayout().tileWidth,
      [legendElt, setLegendElt] = useState<SVGGElement | null>(null),
      legendAttrID = dataConfiguration?.attributeID("legend") ?? "",

      getLabelHeight = useCallback(() => {
        const labelFont = vars.labelFont;
        return getStringBounds(dataConfiguration?.dataset?.attrFromID(legendAttrID)?.name ?? "", labelFont).height;
      }, [dataConfiguration, legendAttrID]);

    useEffect(() => mstAutorun(
      () => {
        // Reference partitionMethod to ensure reactivity
        const currentPartitionMethod = partitionMethod;
        const numberHeight = getStringBounds("0").height;
        const labelHeight = getLabelHeight();
        const computeDesiredExtent = () => {
          if (dataConfiguration?.placeCanHaveZeroExtent("legend")) {
            return 0;
          }
          return labelHeight + kChoroplethHeight + numberHeight + 2 * axisGap;
        };

        if (!legendElt || !dataConfiguration) return;

        setDesiredExtent(layerIndex, computeDesiredExtent());

        // Use partition-aware size scale
        const sizeDataConfig = dataConfiguration as any; // IDstDataConfigurationModel
        let sizeScale;
        if (currentPartitionMethod === "quantize") {
          sizeScale = sizeDataConfig.getLegendNumericSizeScale("quantize");
        } else {
          sizeScale = sizeDataConfig.getLegendNumericSizeScale("quantile");
        }
        // The number of bins in the legend is determined by the scale's range, which is set by NUM_SIZE_BINS in the model.
        // Render the sectioned size legend
        sectionedSizeLegend(sizeScale, legendElt, {
          width: tileWidth,
          marginLeft: 6,
          marginTop: labelHeight,
          marginRight: 6,
          barHeight: 18,
          dotYOffset: 0,
          clickHandler: (bin: number, extend: boolean) => {
            const dataset = dataConfiguration.dataset;
            const binCases = sizeDataConfig.getCasesForLegendBin(bin, currentPartitionMethod);
            if (binCases) {
              setOrExtendSelection(binCases, dataset, extend);
            }
          },
          casesInBinSelectedHandler: (bin: number) => {
            return !!sizeDataConfig?.casesInBinAreSelected(bin, currentPartitionMethod);
          }
        });
      },
      { name: "NumericSizeLegendReboot render" },
      dataConfiguration
    ),
    [legendElt, dataConfiguration, getLabelHeight, setDesiredExtent, tileWidth, layerIndex, partitionMethod]);

    useEffect(function cleanup () {
      return () => {
        setDesiredExtent(layerIndex, 0);
      };
    }, [setDesiredExtent, layerIndex]);

    return (
      <svg
        ref={elt => setLegendElt(elt as SVGGElement)}
        className="legend-size-categories"
        data-testid="legend-size-categories"
        width={tileWidth}
        height={60}
        viewBox={`0 0 ${tileWidth} 60`}
        style={{ display: "block", width: "100%" }}
      >
      </svg>
    );
  }); 
