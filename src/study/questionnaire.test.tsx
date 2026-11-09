import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LikertForm } from "../components/LikertForm";
import { ExperiencePage } from "../pages/ExperiencePage";
import { emptyRatings, ratingKeys, ratingsComplete } from "./ratings";
import { likertItems, getCopy, scaleLabels } from "../config/copy";
import { filterResponses, summarizeResponses, summarizeExperience } from "../lib/statistics";
import { participantCsvRows, responseCsvRows } from "../admin/exports";
import { toCsv } from "../lib/csv";
import type { TrialResponseRow } from "../types/study";
const row = { participant_id: "p1", sculpture_id: "sculpture-01", hidden_variant_id: "variant-a", questionnaire_version: 2,
 item_overall: 6, item_material_realism: 5, item_view_stability: 4,
 participants: {experience_3d: "often", device_type: "desktop", completed: true},
 open_visual_observations: "=formula", trial_index: 0 } as TrialResponseRow;
const filters = {sculpture:"", variant:"", device:"", completion:"", experience:"", version:""};
describe("questionnaire v2", () => {
 it("requires all eight integer ratings in range", () => {
  const ratings = emptyRatings(); expect(ratingsComplete(ratings)).toBe(false);
  ratingKeys.forEach(key => {ratings[key] = 7;}); expect(ratingsComplete(ratings)).toBe(true);
  for (const key of ratingKeys) for (const invalid of [null, 0, 8, 2.5, NaN, undefined]) {
   expect(ratingsComplete({...ratings, [key]: invalid})).toBe(false);
  }
 });
 it.each(["de", "en"] as const)("renders eight questions and seven accessible anchors in %s", language => {
  const html = renderToStaticMarkup(<LikertForm language={language} stimulusId="practice" onSubmit={async () => {}}/>);
  expect(likertItems[language]).toHaveLength(8);
  expect(html.match(/<fieldset/g)).toHaveLength(8);
  expect(html.match(/type="radio"/g)).toHaveLength(56);
  expect(html).toContain(getCopy(language).openQuestion);
  scaleLabels[language].forEach(label => expect(html).toContain(label));
  expect(html).not.toMatch(/textarea[^>]*required/);
  expect(html).not.toMatch(/Hunyuan|TRELLIS|Gaussian/);
 });
 it.each(["de", "en"] as const)("renders explicit experience selection including opt-out in %s", language => {
  const html = renderToStaticMarkup(<ExperiencePage language={language} onLanguageChange={() => {}} onContinue={async () => {}} busy={false} error={null}/>);
  expect(html.match(/type="radio"/g)).toHaveLength(6); expect(html).toContain('value="none"');
  expect(html).toMatch(/type="submit"[^>]*disabled/);
 });
 it("combines all filters and handles unknown historical experience", () => {
  expect(filterResponses([row], {...filters, experience:"often", device:"desktop", completion:"true", sculpture:"sculpture-01", variant:"variant-a", version:"2"})).toHaveLength(1);
  expect(filterResponses([row], {...filters, experience:"often", device:"mobile"})).toHaveLength(0);
  expect(filterResponses([{...row, participants: null}], {...filters, experience:"none"})).toHaveLength(1);
 });
 it("counts people separately from ratings and excludes missing additional items", () => {
  const legacy = {...row, item_material_realism: null, item_view_stability: undefined};
  expect(summarizeExperience([row, legacy]).find(g => g.experience === "often")).toMatchObject({participants:1, count:2, mean:6, median:6});
  expect(summarizeResponses([row, legacy]).find(g => g.field === "item_material_realism")).toMatchObject({count:1, mean:5});
 });
 it("exports new columns and keeps formula protection and missing values", () => {
  const exported = responseCsvRows([row])[0]; expect(exported).toMatchObject({experience_3d:"often", device_type:"desktop", item_material_realism:5, item_view_stability:4, questionnaire_version:2});
  expect(toCsv([exported])).toContain("'=formula");
  expect(responseCsvRows([{...row, item_material_realism:undefined}])[0].item_material_realism).toBeNull();
  expect(participantCsvRows([{id:"p", experience_3d:null} as never])[0].experience_3d).toBeNull();
 });
});
