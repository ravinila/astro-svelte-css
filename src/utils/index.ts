export const componentTracker = {
    usedComponents: new Set(),
    clear() {
        this.usedComponents.clear();
    },
    add(componentName: string) {
        this.usedComponents.add(componentName);
    },
    getComponents() {
        return Array.from(this.usedComponents);
    },
};

export function createTrackedComponent(Component: any, name: string) {
    return (props: any) => {
        componentTracker.add(name);
        return Component(props);
    };
}