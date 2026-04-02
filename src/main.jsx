/**
 * @file main.jsx
 * @description Application entry point — mounts <App /> into the DOM.
 */

// Patch: some browser extensions strip clearMarks/clearMeasures from the
// Performance API, breaking React 19's internal profiling timers.
if (typeof performance !== "undefined") {
  if (typeof performance.clearMarks !== "function") {
    performance.clearMarks = () => {};
  }
  if (typeof performance.clearMeasures !== "function") {
    performance.clearMeasures = () => {};
  }
  if (typeof performance.mark !== "function") {
    performance.mark = () => {};
  }
  if (typeof performance.measure !== "function") {
    performance.measure = () => {};
  }
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
