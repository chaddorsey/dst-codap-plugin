# Legend Partitioning Toggle Design Document

## Problem Statement

Currently, users can only view quantitative (numeric) legends using a single partitioning method (quantile or quantize). This limits their ability to interpret data distributions in ways that best suit their analysis. We want to provide a user-facing option to toggle between quantile and quantize legend formats, so users can choose the most meaningful partitioning for their data visualization needs.

**Requirements:**
- The toggle should appear as radio buttons next to the legend attribute dropdown.
- Each legend (if multiple are present) should have its own set of radio buttons.
- The toggle should reset to the default (quantile) each time the plugin is loaded/reloaded or a new attribute is selected for a given legend.
- The user's choice does not persist across reloads or attribute changes.
- The default partitioning method is quantile.

---

## User Experience & UI

- **Location:**
  - The radio button toggle appears directly next to the legend attribute dropdown in the legend panel.
  - If multiple legends are present, each legend's controls are independent.

- **Options:**
  - Two radio buttons labeled:
    - "Quantile" (default)
    - "Quantize"

- **Behavior:**
  - When the user selects a different radio button, the legend updates immediately to use the selected partitioning method.
  - When the user selects a new attribute for the legend, the toggle resets to "Quantile".
  - On plugin reload, all toggles reset to "Quantile".

---

## State Management

- The selected partitioning method is stored in the state of each legend's data configuration (not persisted beyond session or attribute change).
- When a new attribute is selected for a legend, the state is reset to "Quantile".
- No persistence to local storage or project state is required.

---

## Integration with Legend Rendering

- The legend rendering logic (and underlying data configuration model) must use the selected partitioning method to determine how to compute bins and thresholds:
  - If "Quantile" is selected, use `scaleQuantile`.
  - If "Quantize" is selected, use `scaleQuantize`.
- The UI and model must be updated so that changes to the toggle are immediately reflected in the legend display.

---

## Testing & TDD Plan

1. **Unit Tests:**
   - Test that the toggle UI appears next to the legend dropdown for each legend.
   - Test that selecting a radio button updates the legend partitioning method in state.
   - Test that selecting a new attribute resets the toggle to "Quantile".
   - Test that on plugin reload, all toggles reset to "Quantile".

2. **Integration Tests:**
   - Test that changing the toggle updates the legend rendering (bins, colors, or sizes change appropriately).
   - Test that each legend's toggle is independent if multiple legends are present.

3. **Manual/Visual Tests:**
   - Confirm that the UI is intuitive and visually aligned with the legend dropdown.
   - Confirm that the legend updates immediately and correctly for both quantile and quantize modes.

---

## Open Questions / Risks

- Are there any edge cases with legends that do not support both quantile and quantize? (If so, the toggle should be hidden or disabled.)
- Are there performance concerns with recomputing bins on every toggle?

---

## Next Steps

- Review and confirm this design.
- Identify all code locations that need to be updated (UI, model, legend rendering).
- Begin TDD implementation in the feature branch. 