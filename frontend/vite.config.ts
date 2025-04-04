import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { nodePolyfills } from "vite-plugin-node-polyfills"

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      // appDirectory: "app",
      // assetsBuildDirectory: "public/build",
      // publicPath: "/build/",
      // serverBuildPath: "build/index.js",
      ignoredRouteFiles: ["**/.*"],
    }),

    {
      name: "remix-manifest-resolver",
      resolveId(id) {
        if (id === "remix:manifest") {
          return id
        }
      },
      // Optional: warning is suppressed without this hook
      // Provides an empty object for 'remix:manifest' if HMR triggers, but HMR remains non-functional
      load(id) {
        if (id === "remix:manifest") {
          return "export default {}"
        }
      },
    },
    tsconfigPaths(),
  ],

  build: { modulePreload: { polyfill: true } },
})
