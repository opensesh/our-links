export const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/our-links" : "";

export function assetPath(path: string): string {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${cleaned}`;
}
