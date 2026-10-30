// Shared server instances persist between requests and development module reloads.
export function cachedServerValue<T>(state: Record<string, unknown>, key: string, factory: unknown, create: () => T, dependency?: unknown): T {
  const factoryKey = `${key}Factory`, dependencyKey = `${key}Dependency`;
  if (state[key] == null || state[factoryKey] !== factory || state[dependencyKey] !== dependency) {
    state[key] = create(); state[factoryKey] = factory; state[dependencyKey] = dependency;
  }
  return state[key] as T;
}
