// AudioMIX Electron
// React entry point

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(DocumentFragment.getElementById("root"));
root.render(<App />);