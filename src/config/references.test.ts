import { describe, expect, it } from "vitest";
import { practiceStimulus, sculptureReferences, studyStimuli, validateStimulusManifest } from "./stimuli";

describe("reference image manifest", () => {
  it("shares two ordered references in each sculpture and keeps the primary database path", () => {
    expect(validateStimulusManifest()).toEqual([]);
    for (const [id, paths] of Object.entries(sculptureReferences)) {
      const variants = studyStimuli.filter((stimulus) => stimulus.sculptureId === id);
      expect(variants).toHaveLength(3);
      variants.forEach((stimulus) => {
        expect(stimulus.referenceImagePaths).toBe(paths);
        expect(stimulus.referenceImagePath).toBe(paths[0]);
      });
    }
    expect(practiceStimulus.referenceImagePaths).toBeUndefined();
  });

  it("rejects missing, reversed and inconsistent references", () => {
    for (const paths of [undefined, ["a", "a"], ["other", "second"]]) {
      const changed = studyStimuli.map((stimulus, index) => index ? stimulus : {
        ...stimulus, referenceImagePaths: paths as readonly [string, string] | undefined,
      });
      expect(validateStimulusManifest(changed).length).toBeGreaterThan(0);
    }
  });
});
