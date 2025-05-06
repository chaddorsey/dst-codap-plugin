import {axisBottom, scaleLinear, select} from "d3";
import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
import { IBaseLegendProps } from "../../codap/components/data-display/components/legend/legend-common";
import { useDataConfigurationContext } from "../../codap/components/data-display/hooks/use-data-configuration-context";
import { useDataDisplayLayout } from "../../codap/components/data-display/hooks/use-data-display-layout";
import { mstReaction } from "../../codap/utilities/mst-reaction";
import { mstAutorun } from "../../codap/utilities/mst-autorun";
import { IDstDataConfigurationModel } from "../../models/dst-data-configuration-model";
import { NumericSizeLegendModel, labelHeight, NumericSizeLegendKey } from "./numeric-size-legend-model";

import "./size-legend.scss";

const margin = 30;

// This is not an observing component because all of its real rendering happens in
// a mstAutorun.
export const NumericSizeLegend =
  function NumericSizeLegend({layerIndex, setDesiredExtent, partitionMethod}: IBaseLegendProps) {

    const dataConfiguration = useDataConfigurationContext() as IDstDataConfigurationModel;
    const dataDisplayLayout = useDataDisplayLayout();
    const keysElt = useRef(null);

    // useMemo to re-create the model when partitionMethod, dataConfiguration, or dataDisplayLayout changes
    const legendModel = useMemo(
      () => new NumericSizeLegendModel(dataConfiguration, dataDisplayLayout, partitionMethod ?? "quantile"),
      [dataConfiguration, dataDisplayLayout, partitionMethod]
    );

    // Keep the model's partitionMethod in sync if it changes after creation
    useEffect(() => {
      legendModel.setPartitionMethod(partitionMethod ?? "quantile");
    }, [legendModel, partitionMethod]);

    // This is outside of the main autorun because setDesiredExtent might 
    // cause extra re-renders, so it only
    // runs when the desiredExtent actually changes
    useEffect(function updateDesiredExtent() {
      return mstReaction(
        () => {
          if (dataConfiguration?.placeCanHaveZeroExtent("legend")) {
            return 0;
          }
          // There is just one row so this is a basic calculation
          // We are just hacking the height of the axis for now
          const axisHeight = 20;
          return labelHeight + legendModel.layoutData.rowHeight + axisHeight;
        },
        (desiredExtent) => {
          setDesiredExtent(layerIndex, desiredExtent);
        },
        {name: "NumericSizeLegend updateDesiredExtent", fireImmediately: true},
        dataConfiguration
      );
    }, [dataConfiguration, setDesiredExtent, layerIndex, legendModel]);

    // These variables should not change, but theoretically it is possible
    useEffect(function updateContextVariables() {
      legendModel.setDataConfiguration(dataConfiguration);
      legendModel.setDataDisplayLayout(dataDisplayLayout);
    }, [dataConfiguration, dataDisplayLayout, legendModel]);

    useEffect(() => {
      return function cleanup() {
        setDesiredExtent(layerIndex, 0);
      };
    }, [layerIndex, setDesiredExtent]);

    // Updated click handler: use getCasesForLegendBin with partitionMethod
    const handleLegendKeyClick = useCallback((event: any, d: NumericSizeLegendKey) => {
      const caseIds = dataConfiguration?.getCasesForLegendBin(d.index, partitionMethod);
      if (caseIds) {
        if (event.shiftKey) dataConfiguration?.dataset?.selectCases(caseIds);
        else dataConfiguration?.dataset?.setSelectedCases(caseIds);
      }
    }, [dataConfiguration, partitionMethod]);

    useEffect(() => { return mstAutorun(function d3Render() {
      if (!keysElt.current) return;

      const keySize = legendModel.circleMaxDiameter;

      const keysSelection = select(keysElt.current)
        .select(".legend-size-numeric-points")
        .selectAll<SVGGElement, NumericSizeLegendKey>("circle")
        .data(legendModel.pointsData)
        .join(
          (enter) => {
            return enter.append("circle")
              .attr("class", "legend-key")
              .attr("data-testid", "legend-key")
              .on("click", handleLegendKeyClick);
          }
        );

      const ticks = legendModel.ticks;
      if (ticks.length < 2) {
        console.warn("Not enough ticks");
        return;
      }
      const firstTick = ticks[0];
      const lastTick = ticks[ticks.length-1];
      const axisScale = scaleLinear([firstTick, lastTick], [margin, legendModel.layoutData.fullWidth - margin*2]);
  
      keysSelection
        .attr("r", d => d.size/2)
        .attr("cx", d => axisScale(d.canonicalValue))
        .attr("cy", labelHeight + keySize/2)
        .classed("legend-key-selected", (d) => {
          return dataConfiguration?.casesInBinAreSelected(d.index, partitionMethod) ?? false;
        });
      
      const axis = axisBottom(axisScale).ticks(ticks.length);

      select(keysElt.current)
        .selectAll<SVGGElement, any>(".legend-size-numeric-axis")
        .call(axis)
        .attr("transform", `translate(0 ${labelHeight + legendModel.layoutData.rowHeight})`);

    }, {name: "NumericSizeLegend d3 render"}, dataConfiguration); },
      [dataConfiguration, handleLegendKeyClick, legendModel, partitionMethod]
    );

    return (
      <g ref={keysElt} className="legend-size-numeric" data-testid="legend-size-numeric">
        <g className="legend-size-numeric-points"></g>
        <g className="legend-size-numeric-axis"></g>
      </g>
    );
  };
