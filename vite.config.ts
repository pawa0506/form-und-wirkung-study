import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  const rawBase = env.VITE_BASE_PATH || "/";
  const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;
  const siteUrl = (env.VITE_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
  const ogImage = `${siteUrl}${base}og.png`;
  return {
    plugins: [
      react(),
      {
        name: "study-social-meta",
        transformIndexHtml: (html: string) => html.replaceAll("__OG_IMAGE__", ogImage),
      },
    ],
    base,
    build: {
      target: "es2022",
      sourcemap: true,
    },
  };
});
