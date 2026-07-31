// AudioMIX Electron
// Vite config entry point

import { defineConfig } from "electron-vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
    main: {
        // Electron main process
        build: {
            lib: {
                entry: resolve(__dirname, "electron/main.js")
            }
        }
    },
    preload: {
        // Preload bridge
        build: {
            lib: {
                entry: resolve(__dirname, "electron/preload.cjs"),
                formats: ["cjs"],
                fileName: () => "preload.cjs"
            }
        }
    },
    renderer: {
        // React app
        root: ".",
        plugins: [react()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, "index.html")
                }
            }
        }
    }
});