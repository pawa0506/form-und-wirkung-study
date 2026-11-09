import type { Ratings } from "../types/study";
export const ratingKeys = ["geometry", "color", "surface", "detail", "material_realism", "view_stability", "artifacts", "overall"] as const;
export const emptyRatings = (): Ratings => Object.fromEntries(ratingKeys.map(key => [key, null])) as unknown as Ratings;
export function ratingsComplete(ratings: Ratings): boolean {
  return ratingKeys.every(key => Number.isInteger(ratings[key]) && Number(ratings[key]) >= 1 && Number(ratings[key]) <= 7);
}
