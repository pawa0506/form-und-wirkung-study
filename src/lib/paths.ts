export function resolvePublicPath(path: string): string {
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return new URL(path.replace(/^\//, ""), document.baseURI).href;
}
