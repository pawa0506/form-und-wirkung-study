import { describe, expect, it } from "vitest";
import { studyStimuli, validateStimulusManifest } from "../config/stimuli";
import { likertItems } from "../config/copy";
import { createTrialOrder } from "./randomization";

describe("stimulus manifest", () => {
  it("contains three complete blocks with shared reference images", () => {
    expect(validateStimulusManifest()).toEqual([]);
    expect(studyStimuli).toHaveLength(9);
    expect(likertItems.de).toHaveLength(6);
    expect(likertItems.en).toHaveLength(6);
  });

  it("keeps reconstruction methods internal and configures all supported adapters", () => {
    expect(new Set(studyStimuli.map((stimulus) => stimulus.hiddenVariantLabel))).toEqual(new Set([
      "3D Gaussian Splatting",
      "Hunyuan3D 2.1",
      "TRELLIS.2",
    ]));
    expect(new Set(studyStimuli.map((stimulus) => stimulus.assetType))).toEqual(new Set(["glb", "obj", "splat-ply"]));
  });
});

describe("createTrialOrder", () => {
  it("keeps sculpture blocks contiguous and includes every variant once", () => {
    for (let run = 0; run < 100; run += 1) {
      const order = createTrialOrder(studyStimuli);
      expect(new Set(order.map((stimulus) => stimulus.id)).size).toBe(9);
      for (let blockIndex = 0; blockIndex < 3; blockIndex += 1) {
        const block = order.slice(blockIndex * 3, blockIndex * 3 + 3);
        expect(new Set(block.map((stimulus) => stimulus.sculptureId)).size).toBe(1);
      }
    }
  });

  it("randomizes blocks and each block without mutating the manifest", () => {
    const originalIds = studyStimuli.map((stimulus) => stimulus.id);
    const unchangedOrder = createTrialOrder(studyStimuli, () => 0.999999).map((stimulus) => stimulus.id);
    const swappedOrder = createTrialOrder(studyStimuli, () => 0).map((stimulus) => stimulus.id);

    expect(unchangedOrder).toEqual(originalIds);
    expect(swappedOrder).not.toEqual(originalIds);
    expect(studyStimuli.map((stimulus) => stimulus.id)).toEqual(originalIds);
  });
});
