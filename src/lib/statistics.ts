import type { TrialResponseRow } from "../types/study";

export const ratingFields = [
  "item_geometry",
  "item_color",
  "item_surface",
  "item_detail",
  "item_artifacts",
  "item_overall",
] as const;

export type RatingField = (typeof ratingFields)[number];

export function mean(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function summarizeResponses(responses: TrialResponseRow[]) {
  return ratingFields.map((field) => {
    const values = responses.map((response) => response[field]);
    return { field, mean: mean(values), median: median(values), count: values.length };
  });
}

export function summarizeModels(responses: TrialResponseRow[]) {
  const groups = new Map<string, TrialResponseRow[]>();
  responses.forEach((response) => {
    const key = `${response.sculpture_id}::${response.hidden_variant_id}`;
    groups.set(key, [...(groups.get(key) ?? []), response]);
  });

  return [...groups.entries()]
    .map(([key, rows]) => {
      const [sculptureId, variantId] = key.split("::");
      const overallValues = rows.map((row) => row.item_overall);
      return {
        sculptureId,
        variantId,
        count: rows.length,
        meanOverall: mean(overallValues),
        medianOverall: median(overallValues),
      };
    })
    .sort((a, b) => `${a.sculptureId}${a.variantId}`.localeCompare(`${b.sculptureId}${b.variantId}`));
}
