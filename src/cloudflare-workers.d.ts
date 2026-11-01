// What `src/` imports from the Worker runtime's module. adapter-cloudflare resolves the module
// and ships no declaration for it. An ambient file of its own: inside `app.d.ts`, which is a
// module, the same block would be an augmentation of a module TypeScript cannot find.
declare module 'cloudflare:workers' {
  export function waitUntil(promise: Promise<unknown>): void;
}
