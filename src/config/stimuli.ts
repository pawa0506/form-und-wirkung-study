import type { Stimulus } from "../types/study";

// Internal method labels are intentionally confined to configuration and admin UI.
// Remove `isPlaceholder` only after the corresponding final asset has been added.
export const studyStimuli: Stimulus[] = [
  {
    id: "sculpture-01-variant-a",
    sculptureId: "sculpture-01",
    sculptureNameInternal: "Bronzemann",
    hiddenVariantId: "variant-a",
    hiddenVariantLabel: "3D Gaussian Splatting",
    assetType: "splat-ply",
    assetPath: "/assets/sculptures/sculpture-01/variant-a/model.ply",
    referenceImagePath: "/assets/sculptures/sculpture-01/Bronzemann.jpeg",
    rendererType: "splat",
    isPlaceholder: true,
    placeholderShape: "figure",
  },
  {
    id: "sculpture-01-variant-b",
    sculptureId: "sculpture-01",
    sculptureNameInternal: "Bronzemann",
    hiddenVariantId: "variant-b",
    hiddenVariantLabel: "Hunyuan3D 2.1",
    assetType: "glb",
    assetPath: "/assets/sculptures/sculpture-01/variant-b/model.glb",
    referenceImagePath: "/assets/sculptures/sculpture-01/Bronzemann.jpeg",
    rendererType: "mesh",
    isPlaceholder: true,
    placeholderShape: "figure",
  },
  {
    id: "sculpture-01-variant-c",
    sculptureId: "sculpture-01",
    sculptureNameInternal: "Bronzemann",
    hiddenVariantId: "variant-c",
    hiddenVariantLabel: "TRELLIS.2",
    assetType: "obj",
    assetPath: "/assets/sculptures/sculpture-01/variant-c/model.obj",
    mtlPath: "/assets/sculptures/sculpture-01/variant-c/model.mtl",
    referenceImagePath: "/assets/sculptures/sculpture-01/Bronzemann.jpeg",
    rendererType: "mesh",
    isPlaceholder: true,
    placeholderShape: "figure",
  },
  {
    id: "sculpture-02-variant-a",
    sculptureId: "sculpture-02",
    sculptureNameInternal: "InZerrissenheit",
    hiddenVariantId: "variant-a",
    hiddenVariantLabel: "Hunyuan3D 2.1",
    assetType: "glb",
    assetPath: "/assets/sculptures/sculpture-02/variant-a/model.glb",
    referenceImagePath: "/assets/sculptures/sculpture-02/InZerrissenheit.jpeg",
    rendererType: "mesh",
    isPlaceholder: true,
    placeholderShape: "arch",
  },
  {
    id: "sculpture-02-variant-b",
    sculptureId: "sculpture-02",
    sculptureNameInternal: "InZerrissenheit",
    hiddenVariantId: "variant-b",
    hiddenVariantLabel: "TRELLIS.2",
    assetType: "obj",
    assetPath: "/assets/sculptures/sculpture-02/variant-b/model.obj",
    mtlPath: "/assets/sculptures/sculpture-02/variant-b/model.mtl",
    referenceImagePath: "/assets/sculptures/sculpture-02/InZerrissenheit.jpeg",
    rendererType: "mesh",
    isPlaceholder: true,
    placeholderShape: "arch",
  },
  {
    id: "sculpture-02-variant-c",
    sculptureId: "sculpture-02",
    sculptureNameInternal: "InZerrissenheit",
    hiddenVariantId: "variant-c",
    hiddenVariantLabel: "3D Gaussian Splatting",
    assetType: "splat-ply",
    assetPath: "/assets/sculptures/sculpture-02/variant-c/model.ply",
    referenceImagePath: "/assets/sculptures/sculpture-02/InZerrissenheit.jpeg",
    rendererType: "splat",
    isPlaceholder: true,
    placeholderShape: "arch",
  },
  {
    id: "sculpture-03-variant-a",
    sculptureId: "sculpture-03",
    sculptureNameInternal: "Stadtmusikanten",
    hiddenVariantId: "variant-a",
    hiddenVariantLabel: "TRELLIS.2",
    assetType: "obj",
    assetPath: "/assets/sculptures/sculpture-03/variant-a/model.obj",
    mtlPath: "/assets/sculptures/sculpture-03/variant-a/model.mtl",
    referenceImagePath: "/assets/sculptures/sculpture-03/Stadtmusikanten.jpeg",
    rendererType: "mesh",
    isPlaceholder: true,
    placeholderShape: "spire",
  },
  {
    id: "sculpture-03-variant-b",
    sculptureId: "sculpture-03",
    sculptureNameInternal: "Stadtmusikanten",
    hiddenVariantId: "variant-b",
    hiddenVariantLabel: "3D Gaussian Splatting",
    assetType: "splat-ply",
    assetPath: "/assets/sculptures/sculpture-03/variant-b/model.ply",
    referenceImagePath: "/assets/sculptures/sculpture-03/Stadtmusikanten.jpeg",
    rendererType: "splat",
    isPlaceholder: true,
    placeholderShape: "spire",
  },
  {
    id: "sculpture-03-variant-c",
    sculptureId: "sculpture-03",
    sculptureNameInternal: "Stadtmusikanten",
    hiddenVariantId: "variant-c",
    hiddenVariantLabel: "Hunyuan3D 2.1",
    assetType: "glb",
    assetPath: "/assets/sculptures/sculpture-03/variant-c/model.glb",
    referenceImagePath: "/assets/sculptures/sculpture-03/Stadtmusikanten.jpeg",
    rendererType: "mesh",
    isPlaceholder: true,
    placeholderShape: "spire",
  },
];

export const practiceStimulus: Stimulus = {
  id: "practice-neutral-01",
  sculptureId: "practice",
  sculptureNameInternal: "Practice object",
  hiddenVariantId: "practice",
  hiddenVariantLabel: "Practice only — never persisted",
  assetType: "glb",
  assetPath: "/assets/practice/model/practice.glb",
  referenceImagePath: "/assets/practice/reference.svg",
  rendererType: "mesh",
  isPlaceholder: true,
  placeholderShape: "study",
};

export const stimulusById = new Map(studyStimuli.map((stimulus) => [stimulus.id, stimulus]));
export const internalVariantLabelByStimulusId = new Map(
  studyStimuli.map((stimulus) => [stimulus.id, stimulus.hiddenVariantLabel]),
);
export const internalVariantLabelByModel = new Map(
  studyStimuli.map((stimulus) => [`${stimulus.sculptureId}::${stimulus.hiddenVariantId}`, stimulus.hiddenVariantLabel]),
);

export function validateStimulusManifest(stimuli: Stimulus[] = studyStimuli): string[] {
  const errors: string[] = [];
  const grouped = new Map<string, Stimulus[]>();
  stimuli.forEach((stimulus) => {
    grouped.set(stimulus.sculptureId, [...(grouped.get(stimulus.sculptureId) ?? []), stimulus]);
  });

  if (grouped.size !== 3) errors.push("The manifest must contain exactly three sculpture blocks.");
  if (stimuli.length !== 9) errors.push("The manifest must contain exactly nine real stimuli.");

  grouped.forEach((block, sculptureId) => {
    if (block.length !== 3) errors.push(`${sculptureId} must contain exactly three variants.`);
    if (new Set(block.map((stimulus) => stimulus.hiddenVariantId)).size !== block.length) {
      errors.push(`${sculptureId} contains duplicate hidden variant IDs.`);
    }
    if (new Set(block.map((stimulus) => stimulus.referenceImagePath)).size !== 1) {
      errors.push(`${sculptureId} must use one shared reference image.`);
    }
  });

  if (new Set(stimuli.map((stimulus) => stimulus.id)).size !== stimuli.length) {
    errors.push("Stimulus IDs must be unique.");
  }

  stimuli.forEach((stimulus) => {
    const compatible = stimulus.rendererType === "splat"
      ? stimulus.assetType === "splat-ply"
      : stimulus.assetType === "glb" || stimulus.assetType === "obj";
    if (!compatible) errors.push(`${stimulus.id} has an incompatible asset and renderer type.`);
  });

  return errors;
}
