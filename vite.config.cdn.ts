import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// CDN build configuration with React bundled in
// This creates a standalone UMD bundle for <script> tag usage
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    // Don't empty dist folder since we're adding to existing builds
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GenuiWidget",
      formats: ["umd"], // Only UMD for CDN
      fileName: () => "genui-widget.cdn.js", // Use .js for browser compatibility
    },
    rollupOptions: {
      // Don't externalize anything - bundle everything including React
      // This makes it usable directly in browsers via CDN
      output: {
        // Disable code splitting for single file output
        inlineDynamicImports: true,
      },
    },
    minify: "terser",
  },
});
