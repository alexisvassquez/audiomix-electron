// AudioMIX Electron
// src/components/Studio/Knob.jsx
//
// Starter rotary knob for DSP params.
// Vertical-drag control (up = increase, down = decrease)
// DAW convention, more usable than rotational mouse-tracking
// even though knob reads as rotary.
// Reusable across any single float param via
// min/max/step props.
//
// Sends are throttled: the knob's VISUAL position updates
// freely on every mousemove, but onChange only fires when
// the value crosses a step boundary.
// This is to ensure a fast drag can't flood the NDJSON
// pipe w/ hundreds of near-identical commands p/second.
// onChange fires actual DSP command over bridge.

import React from "react";

// Pixels of vertical drag to sweep the full min-max range.
// Larger = finer control (more mouse travel per unit change)
// 200px feels close to hardware-knob sensitivity for a full sweep.
const FULL_SWEEP_PX = 200;

export default function Knob({
    label,
    value,
    min,
    max,
    step = 0.1,
    unit = "",
    onChange,
    size = 44,
}) {
    const draggingRef = React.useRef(false);

    const clamp = (v) => Math.max(min, Math.min(max, v));

    const quantize = (v) => {
        // snap to the nearest step, then round away float so a
        // step of 0.1 doesn't yield 6.000000000000001
        const snapped = Math.round(v / step) * step;
        const decimals = (step.toString().split(".")[1] || "").length;
        return parseFloat(snapped.toFixed(decimals));
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        draggingRef.current = true;

        const startY = e.clientY;
        const startValue = value;
        const range = max - min;
        let lastSent = value;

        const handleMove = (moveEvent) => {
            if (!draggingRef.current) return;
            // up is negative clientY delta, so subtract to make
            // up=increase
            const deltaPx = startY - moveEvent.clientY;
            const deltaValue = (deltaPx / FULL_SWEEP_PX) * range;
            const next = quantize(clamp(startValue + deltaValue));

            if (next !== lastSent) {
                lastSent = next;
                onChange(next);
            }
        };

        const handleUp = () => {
            draggingRef.current = false;
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
    };

    // Double-click resets to the midpoint of the range.
    // Reasonable neutral default (0dB for gain, 0.5 for a mix)
    // Callers that want a specific reset value can override by passing
    // as the initial value and handling it upstream later.
    const handleDoubleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(quantize((min + max) / 2));
    };

    // Map value to a rotation angle.
    // Knob sweeps 270 degrees (from -135 to +135).
    // Standard hardware-knob dead-zone at the bottom.
    const fraction = (value - min) / (max - min);
    const angle = -135 + fraction * 270;

    const displayValue = () => {
        const decimals = (step.toString().split(".")[1] || "").length;
        return value.toFixed(decimals);
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            userSelect: "none",
        }}>
            <div
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                title={`${label}: ${displayValue()}${unit} (drag to adjust, double-click to reset)`}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: "var(--surface-alt)",
                    border: "1px solid var(--border-bright)",
                    position: "relative",
                    cursor: "ns-resize",
                    flexShrink: 0,
                }}>
                    {/* Pointer line indicating position */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 2,
                        height: size / 2 - 4,
                        background: "var(--accent)",
                        borderRadius: 1,
                        transformOrigin: "top center",
                        transform: `translate(-50%, 0) rotate(${angle}deg)`,
                        boxShadow: "0 0 4px var(--accent)",
                    }} />
                </div>
                <div style={{
                    fontSize: 8,
                    letterSpacing: ".08em",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: 9,
                    color: "var(--text)",
                    fontFamily: "var(--font-mono)",
                }}>
                    {displayValue()}{unit}
                </div>
        </div>
    );
}