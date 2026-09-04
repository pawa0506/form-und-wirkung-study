import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("CSV export", () => {
  it("quotes commas and neutralizes spreadsheet formulas in participant text", () => {
    const csv = toCsv([{ participant_uuid: "abc", open_visual_observations: "=HYPERLINK(\"x\"), test" }]);
    expect(csv).toContain("participant_uuid,open_visual_observations");
    expect(csv).toContain("\"'=HYPERLINK(\"\"x\"\"), test\"");
  });
});
