import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

export function extractSvelteCSS() {
  const cssMap = new Map();
  return {
    name: "extract-svelte-css",
    async markup({ content, filename }) {
      if (!filename.includes("src/components")) return { code: content };
      const relativePath = path.relative(
        path.join(process.cwd(), "src/components"),
        filename
      );
      const componentName = relativePath
        .replace(/\.svelte$/, "")
        .replace(/[/\\]index$/, "")
        .replace(/[/\\]/g, "-");
      const cssFileName = `_astro/assets/svelte/${componentName}-[hash].css`;

      const { css } = await compile(content, {
        filename,
        generate: "ssr",
        css: "external",
        hydratable: true,
      });

      if (css?.code) {
        const tempDir = path.join(process.cwd(), "dist/temp-svelte-css");
        await fs.mkdir(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `${componentName}.css`);
        console.log(`[extractSvelteCSS] Writing ${tempPath}`);
        await fs.writeFile(tempPath, css.code);
        cssMap.set(componentName, cssFileName);
      }

      return { code: content };
    },
    getCSSMap: () => Object.fromEntries(cssMap),
  };
}

export function svelteCSSFinalizer() {
  return {
    name: "svelte-css-finalizer",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const distDir = dir.pathname.replace(/^file:\/\//, "");
        const tempDir = path.join(process.cwd(), "dist/temp-svelte-css");
        const finalDir = path.join(distDir, "_astro/assets/svelte");
        const cssMap = svelteCSSPreprocess.getCSSMap();

        console.log("[svelteCSSFinalizer] Starting", {
          distDir,
          tempDir,
          cssMap,
        });

        await fs.mkdir(finalDir, { recursive: true });

        for (const [component, cssFileTemplate] of Object.entries(cssMap)) {
          const tempPath = path.join(tempDir, `${component}.css`);
          console.log(`[svelteCSSFinalizer] Processing ${tempPath}`);
          try {
            const cssContent = await fs.readFile(tempPath, "utf8");
            const hash = createHash("md5")
              .update(cssContent)
              .digest("hex")
              .slice(0, 8);
            const finalPath = path.join(
              distDir,
              cssFileTemplate.replace("[hash]", hash)
            );
            await fs.mkdir(path.dirname(finalPath), { recursive: true });
            await fs.copyFile(tempPath, finalPath);
            cssMap[component] = `/${finalPath
              .replace(distDir, "")
              .replace(/\\/g, "/")}`;
          } catch (err) {
            console.error(
              `[svelteCSSFinalizer] Error processing ${tempPath}: ${err.message}`
            );
          }
        }

        const manifestPath = path.join(distDir, "css-manifest.json");
        await fs.writeFile(manifestPath, JSON.stringify(cssMap, null, 2));
        console.log(`[svelteCSSFinalizer] Manifest written: ${manifestPath}`);

        await fs
          .rm(tempDir, { recursive: true, force: true })
          .catch((err) =>
            console.warn(`[svelteCSSFinalizer] Cleanup failed: ${err.message}`)
          );
      },
    },
  };
}
