import type { ParticipantRow, TrialResponseRow } from "../types/study";
import { internalVariantLabelByModel } from "../config/stimuli";
function internalMethod(row: Pick<TrialResponseRow, "sculpture_id" | "hidden_variant_id">): string {
  return internalVariantLabelByModel.get(`${row.sculpture_id}::${row.hidden_variant_id}`) ?? "Unbekannt";
}

export function participantCsvRows(participants: ParticipantRow[]): Record<string, unknown>[] {
  return participants.map((participant) => ({
    participant_uuid: participant.id,
    consented: participant.consented,
    experience_3d: participant.experience_3d ?? null,
    questionnaire_version: participant.questionnaire_version ?? 1,
    device_type: participant.device_type,
    started_at: participant.started_at,
    completed: participant.completed,
    completed_at: participant.completed_at,
    randomized_sequence: participant.randomized_sequence,
  }));
}

export function responseCsvRows(responses: TrialResponseRow[]): Record<string, unknown>[] {
  return responses.map((response) => ({
    participant_uuid: response.participant_id,
    trial_index: response.trial_index,
    trial_number: response.trial_index + 1,
    sculpture_id: response.sculpture_id,
    hidden_variant_id: response.hidden_variant_id,
    reconstruction_method_internal: internalMethod(response),
    asset_type: response.asset_type,
    renderer_type: response.renderer_type,
    reference_image_path: response.reference_image_path,
    experience_3d: response.participants?.experience_3d ?? null,
    questionnaire_version: response.questionnaire_version ?? 1,
    item_material_realism: response.item_material_realism ?? null,
    item_view_stability: response.item_view_stability ?? null,
    device_type: response.participants?.device_type ?? "",
    participant_completed: response.participants?.completed ?? false,
    item_geometry: response.item_geometry,
    item_color: response.item_color,
    item_surface: response.item_surface,
    item_detail: response.item_detail,
    item_artifacts: response.item_artifacts,
    item_overall: response.item_overall,
    open_visual_observations: response.open_visual_observations,
    trial_started_at: response.trial_started_at,
    trial_submitted_at: response.trial_submitted_at,
    trial_duration_ms: response.trial_duration_ms,
  }));
}

