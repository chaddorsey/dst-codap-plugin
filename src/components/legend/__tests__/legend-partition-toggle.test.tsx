import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DstMultiLegend } from "../dst-multi-legend";

// Mock props for DstMultiLegend
const mockOnChangeAttribute = jest.fn();

// Mock for dataset attributes (simulate at least two attributes)
jest.mock("../../../../models/dataset-config", () => ({
  datasetConfig: {
    dataContextName: "mockContext",
    colorAttribute: undefined,
    sizeAttribute: undefined,
    setColorAttribute: jest.fn(),
    setSizeAttribute: jest.fn(),
  }
}));

jest.mock("../../utilities/codap-dataset-utils", () => ({
  getDatasetAttributes: async () => ["Attr1", "Attr2"]
}));

describe("Legend Partitioning Toggle", () => {
  it("renders radio button toggle next to the legend dropdown for each legend", () => {
    // Render with minimal required props
    render(<DstMultiLegend divElt={null} onChangeAttribute={mockOnChangeAttribute} />);

    // Check for the toggle for Color legend
    const colorToggle = screen.getByTestId("legend-partition-toggle-color");
    expect(colorToggle).toBeInTheDocument();
    expect(screen.getByTestId("partition-radio-quantile-color")).toBeInTheDocument();
    expect(screen.getByTestId("partition-radio-quantize-color")).toBeInTheDocument();

    // Check for the toggle for Size legend
    const sizeToggle = screen.getByTestId("legend-partition-toggle-size");
    expect(sizeToggle).toBeInTheDocument();
    expect(screen.getByTestId("partition-radio-quantile-size")).toBeInTheDocument();
    expect(screen.getByTestId("partition-radio-quantize-size")).toBeInTheDocument();
  });

  it("updates the legend partitioning method in state when a radio button is selected", () => {
    render(<DstMultiLegend divElt={null} onChangeAttribute={mockOnChangeAttribute} />);
    // Color legend: select Quantize
    const colorQuantize = screen.getByTestId("partition-radio-quantize-color");
    fireEvent.click(colorQuantize);
    expect(colorQuantize).toBeChecked();
    expect(screen.getByTestId("partition-radio-quantile-color")).not.toBeChecked();
    // Color legend: select Quantile
    const colorQuantile = screen.getByTestId("partition-radio-quantile-color");
    fireEvent.click(colorQuantile);
    expect(colorQuantile).toBeChecked();
    expect(colorQuantize).not.toBeChecked();
    // Size legend: select Quantize
    const sizeQuantize = screen.getByTestId("partition-radio-quantize-size");
    fireEvent.click(sizeQuantize);
    expect(sizeQuantize).toBeChecked();
    expect(screen.getByTestId("partition-radio-quantile-size")).not.toBeChecked();
  });

  it("resets the toggle to 'Quantile' when a new attribute is selected", async () => {
    render(<DstMultiLegend divElt={null} onChangeAttribute={mockOnChangeAttribute} />);
    // Color legend: select Quantize
    const colorQuantize = await screen.findByTestId("partition-radio-quantize-color");
    fireEvent.click(colorQuantize);
    expect(colorQuantize).toBeChecked();
    // Simulate attribute change (select second option in dropdown)
    const colorDropdown = await screen.findByRole("combobox", { name: /color/i });
    fireEvent.change(colorDropdown, { target: { value: "temp_Attr2" } });
    // After attribute change, Quantile should be checked
    const colorQuantile = await screen.findByTestId("partition-radio-quantile-color");
    expect(colorQuantile).toBeChecked();
    expect(colorQuantize).not.toBeChecked();
  });

  it("resets all toggles to 'Quantile' on plugin reload", () => {
    // TODO: Simulate reload and check that toggles reset
  });

  it("updates the legend rendering when the toggle is changed", async () => {
    render(<DstMultiLegend divElt={null} onChangeAttribute={mockOnChangeAttribute} />);
    // Simulate selecting a numeric attribute for Color legend
    const colorDropdown = await screen.findByRole("combobox", { name: /color/i });
    fireEvent.change(colorDropdown, { target: { value: "temp_Attr1" } });
    // Wait for legend keys to render
    await waitFor(() => expect(screen.getAllByTestId("legend-key").length).toBeGreaterThan(0));
    const initialKeys = screen.getAllByTestId("legend-key");
    // Toggle to Quantize
    const colorQuantize = screen.getByTestId("partition-radio-quantize-color");
    fireEvent.click(colorQuantize);
    // Wait for legend keys to update
    await waitFor(() => {
      const updatedKeys = screen.getAllByTestId("legend-key");
      expect(updatedKeys.length).not.toBe(initialKeys.length);
    });
  });

  it("maintains independent toggles for multiple legends", () => {
    // TODO: Render multiple legends and check that toggles are independent
  });
}); 