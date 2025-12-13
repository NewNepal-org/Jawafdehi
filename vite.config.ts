import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isSSRBuild = process.env.VITE_SSR_BUILD === 'true';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      !isSSRBuild && VitePluginRadar({
        analytics: {
          id: "G-ZDV84KYJDJ",
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: isSSRBuild ? {
      // SSR build configuration
      ssr: true,
      outDir: 'dist/server',
      rollupOptions: {
        input: './src/entry-server.tsx',
        output: {
          format: 'es',
        },
      },
    } : undefined,
  };
});
