import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ThesysChat",
      formats: ["es"],
      fileName: () => "chat.bundle.es.js",
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true,
    minify: "terser",
  },
  server: {
    port: 3000,
    open: "/index.html",
  },
});
