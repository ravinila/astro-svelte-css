import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to the components directory (relative to this script)
const componentsDir = path.join(__dirname, '../../src/components'); // Adjusted to go up two levels
const componentNames = new Map();

function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      scanDirectory(fullPath); // Recursively scan nested directories
    } else if (file.name.endsWith('.svelte') && file.name !== 'index.svelte') {
      const componentName = path.basename(file.name, '.svelte');
      const relativePath = path.relative(componentsDir, fullPath);

      if (componentNames.has(componentName)) {
        console.error(
          `Duplicate component name found: "${componentName}" at "${relativePath}" and "${componentNames.get(componentName)}"`
        );
        process.exit(1); // Exit with error
      } else {
        componentNames.set(componentName, relativePath);
      }
    }
  }
}

try {
  scanDirectory(componentsDir);
  console.log('No duplicate component names found.');
} catch (error) {
  console.error('Error scanning components:', error);
  process.exit(1);
}
