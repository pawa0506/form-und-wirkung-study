import type {
  DeviceType,
  ParticipantRow,
  RandomizedTrialRecord,
  StudySession,
  Stimulus,
  TrialAnswers,
  TrialResponseRow,
} from "../types/study";
import { supabase } from "./supabase";

export interface ParticipantIdentity {
  id: string;
  startedAt: string;
}

export async function createParticipant(
  deviceType: DeviceType,
  orderedStimuli: Stimulus[],
): Promise<ParticipantIdentity> {
  const startedAt = new Date().toISOString();
  const randomizedSequence: RandomizedTrialRecord[] = orderedStimuli.map((stimulus) => ({
    stimulus_id: stimulus.id,
    sculpture_id: stimulus.sculptureId,
    hidden_variant_id: stimulus.hiddenVariantId,
  }));

  if (!supabase) {
    return { id: crypto.randomUUID(), startedAt };
  }

  const existingSession = await supabase.auth.getSession();
  if (existingSession.data.session) await supabase.auth.signOut();

  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "Anonymous sign-in failed.");
  }

  const participant: ParticipantRow = {
    id: authData.user.id,
    consented: true,
    device_type: deviceType,
    started_at: startedAt,
    completed: false,
    completed_at: null,
    randomized_sequence: randomizedSequence,
  };

  const { error } = await supabase.from("participants").insert(participant);
  if (error) {
    await supabase.auth.signOut();
    throw new Error(error.message);
  }

  return { id: participant.id, startedAt };
}

export async function reconcileParticipantSession(session: StudySession): Promise<StudySession> {
  if (!supabase) return session;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || userData.user?.id !== session.participantId) {
    throw new Error("Die anonyme Sitzung konnte nicht wiederhergestellt werden.");
  }

  const [participantResult, responsesResult] = await Promise.all([
    supabase
      .from("participants")
      .select("completed, completed_at, randomized_sequence")
      .eq("id", session.participantId)
      .single(),
    supabase
      .from("trial_responses")
      .select("trial_index")
      .eq("participant_id", session.participantId),
  ]);

  if (participantResult.error) throw new Error(participantResult.error.message);
  if (responsesResult.error) throw new Error(responsesResult.error.message);

  const storedSequence = (participantResult.data.randomized_sequence ?? []) as RandomizedTrialRecord[];
  const orderedStimulusIds = storedSequence.map((trial) => trial.stimulus_id);
  if (orderedStimulusIds.length !== 9) throw new Error("Die gespeicherte Studienreihenfolge ist ungültig.");

  if (participantResult.data.completed) {
    return {
      ...session,
      orderedStimulusIds,
      stage: "completed",
      currentTrialIndex: 8,
      trialStartedAt: null,
      completedAt: participantResult.data.completed_at,
    };
  }

  const submitted = new Set((responsesResult.data ?? []).map((row) => row.trial_index));
  const nextTrialIndex = Array.from({ length: 9 }, (_, index) => index)
    .find((index) => !submitted.has(index));

  if (nextTrialIndex === undefined) {
    const completedAt = new Date().toISOString();
    await completeParticipant(session.participantId, completedAt);
    return {
      ...session,
      orderedStimulusIds,
      stage: "completed",
      currentTrialIndex: 8,
      trialStartedAt: null,
      completedAt,
    };
  }

  return {
    ...session,
    orderedStimulusIds,
    currentTrialIndex: nextTrialIndex,
    trialStartedAt: nextTrialIndex === session.currentTrialIndex ? session.trialStartedAt : new Date().toISOString(),
  };
}

export async function submitTrialResponse(input: {
  participantId: string;
  trialIndex: number;
  stimulus: Stimulus;
  answers: TrialAnswers;
  startedAt: string;
  submittedAt: string;
}): Promise<void> {
  if (!supabase) return;

  const { ratings, openVisualObservations } = input.answers;
  const { stimulus } = input;
  if (Object.values(ratings).some((value) => value === null)) {
    throw new Error("Incomplete ratings cannot be submitted.");
  }

  const row: Omit<TrialResponseRow, "id" | "participants"> = {
    participant_id: input.participantId,
    trial_index: input.trialIndex,
    sculpture_id: stimulus.sculptureId,
    hidden_variant_id: stimulus.hiddenVariantId,
    asset_type: stimulus.assetType,
    renderer_type: stimulus.rendererType,
    reference_image_path: stimulus.referenceImagePath,
    item_geometry: ratings.geometry as number,
    item_color: ratings.color as number,
    item_surface: ratings.surface as number,
    item_detail: ratings.detail as number,
    item_artifacts: ratings.artifacts as number,
    item_overall: ratings.overall as number,
    open_visual_observations: openVisualObservations.trim() || null,
    trial_started_at: input.startedAt,
    trial_submitted_at: input.submittedAt,
    trial_duration_ms: (() => {
      const duration = Date.parse(input.submittedAt) - Date.parse(input.startedAt);
      return Number.isFinite(duration) ? Math.max(0, duration) : 0;
    })(),
  };

  const { error } = await supabase.from("trial_responses").insert(row);
  if (!error) return;
  if (error.code !== "23505") throw new Error(error.message);

  const existing = await supabase
    .from("trial_responses")
    .select("sculpture_id, hidden_variant_id")
    .eq("participant_id", input.participantId)
    .eq("trial_index", input.trialIndex)
    .maybeSingle();
  if (existing.error || !existing.data
    || existing.data.sculpture_id !== stimulus.sculptureId
    || existing.data.hidden_variant_id !== stimulus.hiddenVariantId) {
    throw new Error(existing.error?.message ?? "Conflicting trial response already exists.");
  }
}

export async function completeParticipant(participantId: string, completedAt: string): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("participants")
    .update({ completed: true, completed_at: completedAt })
    .eq("id", participantId)
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Participant completion failed.");
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase ist noch nicht konfiguriert.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(error?.message ?? "Anmeldung fehlgeschlagen.");
  if (data.user.app_metadata.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("Dieses Konto besitzt keine Administratorberechtigung.");
  }
}

export async function getAdminSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  return data.user?.app_metadata.role === "admin";
}

export async function signOutAdmin(): Promise<void> {
  await supabase?.auth.signOut();
}

export async function fetchAdminData(): Promise<{
  participants: ParticipantRow[];
  responses: TrialResponseRow[];
}> {
  if (!supabase) return { participants: [], responses: [] };

  const [participantsResult, responsesResult] = await Promise.all([
    supabase.from("participants").select("*").order("started_at", { ascending: false }),
    supabase
      .from("trial_responses")
      .select("*, participants(device_type, completed)")
      .order("trial_submitted_at", { ascending: false }),
  ]);

  if (participantsResult.error) throw new Error(participantsResult.error.message);
  if (responsesResult.error) throw new Error(responsesResult.error.message);

  return {
    participants: (participantsResult.data ?? []) as ParticipantRow[],
    responses: (responsesResult.data ?? []) as TrialResponseRow[],
  };
}
