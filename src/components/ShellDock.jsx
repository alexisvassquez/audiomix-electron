// AudioMIX Electron
// src/components/ShellDock.jsx
//
// The AS Shell panel
// A collapsible dock living at the bottom of STUDIO mode,
// below the Arrangement and above the Transport row.
// Talks to the FastAPI bridge exclusively through
// useShellConnection(), which itself only talks to
// window.audiomix.shell (exposed by preload).
//
// Reuses the app's existing .am-panel-header / .am-panel-title / .am-btn
// utility classes from src/styles/tokens.css so this panel reads as
// native to the rest of AudioMIX rather than a bolted-on piece with its
// own visual language.
//
// This component owns its own local command log (an array of entries),
// since useShellConnection only exposes the *latest* lastOutput/session
// update, not history — every submitted command and every result/error
// that arrives gets appended here.
//
// NOTE: the IR/LIVE toggle currently only *displays* the branch from
// session.audioscript_branch — clicking it does not yet call
// /shell/live/enter or /shell/live/exit. 
// That wiring is a deliberate follow-up step, not done here.

import { useState, useEffect, useRef, useCallback } from "react";
import { useShellConnection } from "../hooks/useShellConnection";
import "../styles/ShellDock.css";

/* TODO */