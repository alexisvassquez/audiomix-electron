// AudioMIX Electron
// Vite config entry point

import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    main: {
        // Electron main process
        build: {
            lib: {
                entry: "electron/main.js"
            }
        }
    },
    preload: {
        // Preload bridge
        build: {
            lib: {
                entry: "electron/preload.cjs"
            }
        }
    },
    renderer: {
        // React app
        plugins: [react()],
        root: ".",
        build: {
            rollupOptions: {
                input: {
                    index: "./index.html"
                }
            }
        }
    }
});