import { select } from "d3";
import { getScaleThresholds } from "../../codap/components/data-display/components/legend/choropleth-legend/choropleth-legend";

export function sectionedSizeLegend(
  sizeScale: any,
  svgElt: SVGGElement,
  {
    width,
    marginLeft = 6,
    marginTop = 0,
    marginRight = 6,
    barHeight = 18,
    dotYOffset = 0,
    clickHandler,
    casesInBinSelectedHandler
  }: {
    width: number,
    marginLeft?: number,
    marginTop?: number,
    marginRight?: number,
    barHeight?: number,
    dotYOffset?: number,
    clickHandler: (bin: number, extend: boolean) => void,
    casesInBinSelectedHandler: (bin: number) => boolean
  }
) {
  const sizes = sizeScale.range();
  // The number of bins is determined by the scale's range (which uses NUM_SIZE_BINS in the model)
  const thresholds = getScaleThresholds(sizeScale);
  const nBins = sizes.length;
  const legendWidth = width - marginLeft - marginRight;
  const sectionWidth = legendWidth / nBins;
  const barY = marginTop;
  const barRadius = 4;

  const g = select(svgElt);
  g.selectAll("*").remove();

  // Draw sectioned bar
  g.selectAll("rect")
    .data(sizes)
    .enter()
    .append("rect")
    .attr("x", (_d, i) => marginLeft + i * sectionWidth)
    .attr("y", barY)
    .attr("width", sectionWidth)
    .attr("height", barHeight)
    .attr("rx", barRadius)
    .attr("ry", barRadius)
    .attr("fill", (_d, i) => casesInBinSelectedHandler(i) ? "#e0e0e0" : "#fff")
    .attr("stroke", (_d, i) => casesInBinSelectedHandler(i) ? "#888" : "#ccc")
    .attr("stroke-width", (_d, i) => casesInBinSelectedHandler(i) ? 2 : 1)
    .attr("class", (_d, i) => casesInBinSelectedHandler(i) ? "legend-section legend-section-selected" : "legend-section")
    .on("click", function(this: SVGRectElement, event: any, _d: unknown) {
      const rects = Array.from((this.parentNode as SVGGElement).querySelectorAll("rect"));
      const i = rects.indexOf(this as SVGRectElement);
      clickHandler(i, event.shiftKey);
    });

  // Draw dots centered in each section
  g.selectAll<SVGCircleElement, number>("circle")
    .data(sizes)
    .enter()
    .append("circle")
    .attr("cx", (_d, i) => marginLeft + sectionWidth * (i + 0.5))
    .attr("cy", barY + barHeight / 2 + dotYOffset)
    .attr("r", (d, _i) => (d as number) / 2)
    .attr("fill", "#000")
    .attr("class", "legend-dot");

  // Draw labels (bin edges) below the bar
  g.selectAll("text")
    .data(sizes)
    .enter()
    .append("text")
    .attr("x", (_d, i) => marginLeft + sectionWidth * (i + 0.5))
    .attr("y", barY + barHeight + 16)
    .attr("text-anchor", "middle")
    .text((_d, i) => {
      const min = i === 0 ? "-∞" : thresholds[i - 1]?.toFixed(2);
      const max = i === sizes.length - 1 ? "∞" : thresholds[i]?.toFixed(2);
      return `[${min}, ${max})`;
    });
} 
