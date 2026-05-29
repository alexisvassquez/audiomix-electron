// AudioMIX Electron
// src/main.jsx
//
// React entry point

import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import App from "./App.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);