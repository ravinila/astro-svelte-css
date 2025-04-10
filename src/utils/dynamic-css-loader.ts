// Add this as a module that will be included in your client-side bundle

type CssManifest = Record<string, string>;

declare global {
  interface Window {
    __SVELTE_USED_COMPONENTS?: Set<string>;
  }
}

export function setupDynamicCssLoader() {
  if (typeof window === 'undefined') return;

  let cssManifest: CssManifest = {};
  const loadedCssFiles = new Set<string>();
  const pendingComponents = new Set<string>();
  let manifestLoaded = false;

  async function loadCssManifest(): Promise<void> {
    try {
      const response = await fetch('/css-manifest.json');
      cssManifest = await response.json();
      manifestLoaded = true;
      loadPendingComponentCss();
    } catch (error) {
      console.error('Failed to load CSS manifest:', error);
    }
  }

  function loadComponentCss(componentName: string): void {
    if (!manifestLoaded) {
      pendingComponents.add(componentName);
      return;
    }

    const cssPath = cssManifest[componentName];
    if (cssPath && !loadedCssFiles.has(cssPath)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      document.head.appendChild(link);
      loadedCssFiles.add(cssPath);
      console.log(`Dynamically loaded CSS for ${componentName}: ${cssPath}`);
    }
  }

  function loadPendingComponentCss(): void {
    pendingComponents.forEach(componentName => {
      loadComponentCss(componentName);
    });
    pendingComponents.clear();
  }

  // Initialize global set
  if (!window.__SVELTE_USED_COMPONENTS) {
    window.__SVELTE_USED_COMPONENTS = new Set<string>();
  }

  const originalAdd = window.__SVELTE_USED_COMPONENTS.add;
  window.__SVELTE_USED_COMPONENTS.add = function (componentName: string) {
    originalAdd.call(this, componentName);
    loadComponentCss(componentName);
    return this;
  };

  loadCssManifest();

  return {
    loadComponentCss,
    registerComponent: (componentName: string) =>
      window.__SVELTE_USED_COMPONENTS!.add(componentName),
  };
}