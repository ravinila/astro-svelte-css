import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import node from "@astrojs/node";
import { compile } from "svelte/compiler";
import path from "path";
import fs from "fs/promises";
import { createHash } from "crypto";

// Custom Svelte preprocess to extract compiled CSS
function extractSvelteCSS() {
  const cssMap = new Map(); // Use Map for uniqueness
  return {
    name: "extract-svelte-css",
    async markup({ content, filename }) {
      console.log(`Processing ${filename}`);
      const relativePath = path.relative(
        path.join(process.cwd(), "src/components"),
        filename
      );
      // Simplify nested names: 'Footer/index.svelte' -> 'Footer'
      const componentName = relativePath
        .replace(/\.svelte$/, "")
        .replace(/[/\\]index$/, "") // Remove '/index' from nested paths
        .replace(/[/\\]/g, "-"); // Replace remaining separators with hyphens
      const cssFileName = `assets/svelte/${componentName}-[hash].css`;

      const { css } = await compile(content, {
        filename,
        generate: "ssr",
        css: "external",
        hydratable: true,
      });

      if (css && css.code) {
        const tempDir = path.join(process.cwd(), "dist/temp-svelte-css");
        await fs.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `${componentName}.css`);
        await fs.writeFile(tempPath, css.code);
        console.log(`Wrote temp CSS for ${componentName}: ${tempPath}`);
        cssMap.set(componentName, cssFileName);
      } else {
        console.log(`No CSS found for ${componentName}`);
      }

      return { code: content };
    },
    getCSSMap: () => Object.fromEntries(cssMap), // Convert Map to object for manifest
  };
}

const svelteCSSPreprocess = extractSvelteCSS();

// Custom Astro integration to finalize CSS files with content-based hashing
function svelteCSSFinalizer() {
  return {
    name: "svelte-css-finalizer",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        console.log("astro:build:done hook triggered");
        const distDir = path.join(process.cwd(), "dist");
        const tempDir = path.join(distDir, "temp-svelte-css");
        const finalDir = path.join(distDir, "assets/svelte");
        const cssMap = svelteCSSPreprocess.getCSSMap();

        console.log("Finalizing CSS files...", {
          tempDir,
          finalDir,
          components: Object.keys(cssMap),
        });

        await fs.mkdir(finalDir, { recursive: true });

        for (const component in cssMap) {
          const cssFileTemplate = cssMap[component];
          const tempPath = path.join(tempDir, `${component}.css`);
          try {
            const cssContent = await fs.readFile(tempPath, "utf8");
            const hash = createHash("md5")
              .update(cssContent)
              .digest("hex")
              .slice(0, 8); // 8-char hash
            const finalPath = path.join(
              distDir,
              cssFileTemplate.replace("[hash]", hash)
            );
            await fs.mkdir(path.dirname(finalPath), { recursive: true });
            await fs.copyFile(tempPath, finalPath);
            cssMap[component] = finalPath.replace(distDir + "/", ""); // Relative path for manifest
            console.log(`Finalized CSS: ${finalPath} (hash: ${hash})`);
          } catch (err) {
            console.warn(`Failed to process ${tempPath}: ${err.message}`);
          }
        }

        const manifestPath = path.join(distDir, "css-manifest.json");
        await fs.writeFile(manifestPath, JSON.stringify(cssMap, null, 2));
        console.log("CSS manifest written:", cssMap);

        try {
          await fs.rm(tempDir, { recursive: true, force: true });
          console.log("Cleaned up temp directory");
        } catch (err) {
          console.warn(`Failed to clean up temp directory: ${err.message}`);
        }
      },
    },
  };
}

export default defineConfig({
  integrations: [
    svelte({
      preprocess: [svelteCSSPreprocess],
    }),
    svelteCSSFinalizer(),
  ],
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith(".svelte.css")) {
              const componentName = assetInfo.name.replace(".svelte.css", "");
              return `assets/svelte/${componentName}-[hash].css`;
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
      assetsInclude: ["**/*.svelte.css"],
    },
    css: {
      extract: true,
    },
    ssr: {
      noExternal: ["svelte"],
    },
  },
  output: "server",
  server: {
    port: 5000,
  },
  adapter: node({
    mode: "standalone",
  }),
});
