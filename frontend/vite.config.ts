import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 5173, // Default Vite port
    proxy: {
      '/api': { // if a request starts with /api
        target: 'http://127.0.0.1:8000', // proxy it to the django backend
        changeOrigin: true, // this is neeeded for virtual hosts
      },
    },
  },
});
