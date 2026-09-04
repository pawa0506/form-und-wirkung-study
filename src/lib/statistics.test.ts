import { describe, expect, it } from "vitest";
import type { TrialResponseRow } from "../types/study";
import { summarizeModels, summarizeResponses } from "./statistics";

function response(overall: number, geometry: number): TrialResponseRow {
  return {
    participant_id: crypto.randomUUID(),
    trial_index: 0,
    sculpture_id: "sculpture-01",
    hidden_variant_id: "variant-a",
    asset_type: "glb",
    renderer_type: "mesh",
    reference_image_path: "/reference.svg",
    item_geometry: geometry,
    item_color: 4,
    item_surface: 4,
    item_detail: 4,
    item_artifacts: 4,
    item_overall: overall,
    open_visual_observations: null,
    trial_started_at: "2026-01-01T00:00:00.000Z",
    trial_submitted_at: "2026-01-01T00:01:00.000Z",
    trial_duration_ms: 60000,
  };
}

describe("admin statistics", () => {
  it("reports all six item summaries", () => {
    const summaries = summarizeResponses([response(6, 2), response(4, 6)]);
    expect(summaries).toHaveLength(6);
    expect(summaries.find((summary) => summary.field === "item_geometry")).toMatchObject({ mean: 4, median: 4, count: 2 });
  });

  it("summarizes the overall item per model rather than pooling all items", () => {
    expect(summarizeModels([response(2, 7), response(6, 7)])[0]).toMatchObject({
      count: 2,
      meanOverall: 4,
      medianOverall: 4,
    });
  });
});
