export type AssetType = "glb" | "obj" | "splat-ply";
export type RendererType = "mesh" | "splat";
export type DeviceType = "desktop" | "tablet" | "mobile";
export type Language = "de" | "en";
export type StudyStage =
  | "landing"
  | "consent"
  | "declined"
  | "instructions"
  | "practice"
  | "trials"
  | "completed";

export type PlaceholderShape = "figure" | "arch" | "spire" | "study";

export interface RandomizedTrialRecord {
  stimulus_id: string;
  sculpture_id: string;
  hidden_variant_id: string;
}

export interface Stimulus {
  id: string;
  sculptureId: string;
  sculptureNameInternal: string;
  hiddenVariantId: string;
  hiddenVariantLabel: string;
  assetType: AssetType;
  assetPath: string;
  mtlPath?: string;
  referenceImagePath: string;
  rendererType: RendererType;
  initialRotation?: [number, number, number];
  isPlaceholder?: boolean;
  placeholderShape?: PlaceholderShape;
}

export interface Ratings {
  geometry: number | null;
  color: number | null;
  surface: number | null;
  detail: number | null;
  artifacts: number | null;
  overall: number | null;
}

export interface TrialAnswers {
  ratings: Ratings;
  openVisualObservations: string;
}

export interface StudySession {
  version: 2;
  participantId: string;
  deviceType: DeviceType;
  startedAt: string;
  stage: Exclude<StudyStage, "landing" | "consent" | "declined">;
  orderedStimulusIds: string[];
  currentTrialIndex: number;
  trialStartedAt: string | null;
  completedAt: string | null;
}

export interface ParticipantRow {
  id: string;
  consented: boolean;
  device_type: DeviceType;
  started_at: string;
  completed: boolean;
  completed_at: string | null;
  randomized_sequence: RandomizedTrialRecord[];
}

export interface TrialResponseRow {
  id?: string;
  participant_id: string;
  trial_index: number;
  sculpture_id: string;
  hidden_variant_id: string;
  asset_type: AssetType;
  renderer_type: RendererType;
  reference_image_path: string;
  item_geometry: number;
  item_color: number;
  item_surface: number;
  item_detail: number;
  item_artifacts: number;
  item_overall: number;
  open_visual_observations: string | null;
  trial_started_at: string;
  trial_submitted_at: string;
  trial_duration_ms: number;
  participants?: Pick<ParticipantRow, "device_type" | "completed"> | null;
}
