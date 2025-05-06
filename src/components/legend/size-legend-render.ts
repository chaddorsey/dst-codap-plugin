import { select } from "d3";
import { getScaleThresholds } from "../../codap/components/data-display/components/legend/choropleth-legend/choropleth-legend";

export function sizeLegend(
  sizeScale: any,
  svgElt: SVGGElement,
  {
    width,
    marginLeft = 6,
    marginTop = 0,
    marginRight = 6,
    clickHandler,
    casesInBinSelectedHandler
  }: {
    width: number,
    marginLeft?: number,
    marginTop?: number,
    marginRight?: number,
    clickHandler: (bin: number, extend: boolean) => void,
    casesInBinSelectedHandler: (bin: number) => boolean
  }
) {
  const sizes = sizeScale.range();
  const thresholds = getScaleThresholds(sizeScale);
  const nBins = sizes.length;
  const legendWidth = width - marginLeft - marginRight;
  const spacing = legendWidth / nBins;

  const g = select(svgElt);
  g.selectAll("*").remove();

  // Draw circles
  g.selectAll<SVGCircleElement, number>("circle")
    .data(sizes)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => marginLeft + spacing * (i + 0.5))
    .attr("cy", (d, _i) => marginTop + Math.max(...(sizes as number[])) / 2)
    .attr("r", (d, _i) => (d as number) / 2)
    .attr("class", (d, i) => casesInBinSelectedHandler(i) ? "legend-key legend-key-selected" : "legend-key")
    .on("click", function(this: SVGCircleElement, event: any, d: unknown) {
      const datum = d as number;
      // D3 v7: 'this' is the element, 'event' is the event, 'd' is the datum
      // Get the index from the current element
      const circles = Array.from((this.parentNode as SVGGElement).querySelectorAll("circle"));
      const i = circles.indexOf(this as SVGCircleElement);
      clickHandler(i, event.shiftKey);
    });

  // Draw labels (bin edges)
  g.selectAll("text")
    .data(sizes)
    .enter()
    .append("text")
    .attr("x", (d, i) => marginLeft + spacing * (i + 0.5))
    .attr("y", (d, _i) => marginTop + Math.max(...(sizes as number[])) + 16)
    .attr("text-anchor", "middle")
    .text((d, i) => {
      // Show bin range as label
      const min = i === 0 ? "-∞" : thresholds[i - 1]?.toFixed(2);
      const max = i === sizes.length - 1 ? "∞" : thresholds[i]?.toFixed(2);
      return `[${min}, ${max})`;
    });
} 
