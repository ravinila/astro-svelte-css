import { parse } from 'svelte/compiler';
import { getComponentName } from '.';

/**
 * Vite plugin that adds custom code snippets to all Svelte components
 * @param {string} codeSnippet - The custom code snippet to inject into each component
 */
export default function svelteCustomCodePlugin(codeSnippet = '') {
  // Default code snippet if none provided - just logs component usage
  const defaultSnippet = `console.log('[Component Used]', componentName, new Date().toISOString());`;

  // Use provided snippet or default
  const snippetToInject = codeSnippet || defaultSnippet;

  return {
    name: 'vite-plugin-svelte-custom-code',
    enforce: 'pre', // Run before the svelte plugin

    transform(code, id) {
      // Only process .svelte files
      if (!id.endsWith('.svelte')) {
        return null;
      }

      try {
        // Parse the Svelte component
        const ast = parse(code);

        // Get component name from filename or the component itself
        const fileName = getComponentName(id); // id.split('/').pop().replace('.svelte', '');
        const componentName = ast.instance?.context?.name || fileName;

        // The code to inject - with component name available as a variable
        const injectionCode = `
        // Component name available as a variable
        const componentName = '${componentName}';
        // custom code snippet
        ${snippetToInject}
      `;

        // Add code to the component
        let modifiedCode = code;

        // Check if there's a script tag
        if (code.includes('<script>') || code.includes('<script lang="ts">')) {
          // Add to existing script
          const scriptMatch = /<script([^>]*)>([\s\S]*?)<\/script>/;
          const match = scriptMatch.exec(code);

          if (match) {
            const scriptTag = match[0];
            const scriptAttrs = match[1] || '';
            const scriptContent = match[2];

            // Add custom code to the beginning of the script content
            const modifiedScript = `<script${scriptAttrs}>${injectionCode}${scriptContent}</script>`;
            modifiedCode = code.replace(scriptTag, modifiedScript);
          }
        } else {
          // No script tag, add one
          const scriptTag = `<script>\n${injectionCode}\n</script>\n`;
          modifiedCode = scriptTag + code;
        }

        return {
          code: modifiedCode,
          map: null // Skip sourcemap generation for simplicity
        };
      } catch (error) {
        console.error(`Error processing ${id}:`, error);
        return null;
      }
    }
  };
}