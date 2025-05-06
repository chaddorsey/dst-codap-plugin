import "@testing-library/jest-dom";

// Polyfill ResizeObserver for Jest/jsdom
if (typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
