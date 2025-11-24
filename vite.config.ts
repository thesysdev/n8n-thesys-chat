import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GenuiWidget",
      formats: ["es"],
      fileName: (format) => `genui-widget.${format}.js`,
    },
    rollupOptions: {
      // Externalize peer dependencies
      // external: ["react", "react-dom"],
      output: {
        // globals: {
        //   react: "React",
        //   "react-dom": "ReactDOM",
        // },
      },
    },
  },
  define: {
    "process.env": {},
  },
  server: {
    port: 3000,
    open: "/index.html",
  },
});
