/**
 * UI component factory registry. The core defines *what* to render (schemas, keys);
 * each platform registers *how* (React DOM or React Native components).
 */
export class ComponentRegistry<TComponent> {
  private readonly components = new Map<string, TComponent>();

  constructor(
    readonly name: string,
    private readonly fallback?: TComponent,
  ) {}

  register(key: string, component: TComponent): this {
    this.components.set(key, component);
    return this;
  }

  registerMany(map: Record<string, TComponent>): this {
    Object.entries(map).forEach(([k, c]) => this.register(k, c));
    return this;
  }

  has(key: string): boolean {
    return this.components.has(key);
  }

  resolve(key: string): TComponent {
    const component = this.components.get(key) ?? this.fallback;
    if (!component) throw new Error(`[${this.name}] No component registered for "${key}"`);
    return component;
  }

  keys(): string[] {
    return [...this.components.keys()];
  }
}
