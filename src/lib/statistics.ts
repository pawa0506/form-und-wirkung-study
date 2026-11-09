import type { TrialResponseRow } from "../types/study";

export const ratingFields = [
  "item_geometry",
  "item_color",
  "item_surface",
  "item_detail",
  "item_material_realism",
  "item_view_stability",
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
    const values = responses.map((response) => response[field]).filter(validRating);
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
      const overallValues = rows.map((row) => row.item_overall).filter(validRating);
      return {
        sculptureId,
        variantId,
        count: overallValues.length,
        meanOverall: mean(overallValues),
        medianOverall: median(overallValues),
      };
    })
    .sort((a, b) => `${a.sculptureId}${a.variantId}`.localeCompare(`${b.sculptureId}${b.variantId}`));
}

export function validRating(value: unknown): value is number {
 return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 7;
}
export interface ResponseFilters { sculpture: string; variant: string; device: string; completion: string; experience: string; version: string; }
export function filterResponses(rows: TrialResponseRow[], f: ResponseFilters) {
 return rows.filter(r => (!f.sculpture || r.sculpture_id === f.sculpture)
 && (!f.variant || r.hidden_variant_id === f.variant)
 && (!f.device || r.participants?.device_type === f.device)
 && (!f.completion || String(r.participants?.completed) === f.completion)
 && (!f.experience || (r.participants?.experience_3d ?? "none") === f.experience)
 && (!f.version || String(r.questionnaire_version ?? 1) === f.version));
}
export function summarizeExperience(rows: TrialResponseRow[]) {
 return ["never", "rarely", "occasionally", "often", "very_often", "none"].map(experience => {
  const group = rows.filter(r => (r.participants?.experience_3d ?? "none") === experience);
  const values = group.map(r => r.item_overall).filter(validRating);
  return {experience, participants: new Set(group.map(r => r.participant_id)).size,
   count: values.length, mean: mean(values), median: median(values)};
 });
}
