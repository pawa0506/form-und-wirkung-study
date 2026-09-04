import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { practiceStimulus, stimulusById, studyStimuli, validateStimulusManifest } from "../config/stimuli";
import { detectDeviceType } from "../lib/device";
import {
  completeParticipant,
  createParticipant,
  reconcileParticipantSession,
  submitTrialResponse,
} from "../lib/study-data";
import { CompletionPage } from "../pages/CompletionPage";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { ConsentPage } from "../pages/ConsentPage";
import { DeclinedPage } from "../pages/DeclinedPage";
import { InstructionsPage } from "../pages/InstructionsPage";
import { LandingPage } from "../pages/LandingPage";
import { createTrialOrder } from "../study/randomization";
import {
  clearSession,
  loadLanguage,
  loadSession,
  saveLanguage,
  saveSession,
} from "../study/session";
import type { Language, StudySession, StudyStage, TrialAnswers } from "../types/study";

const AdminApp = lazy(() => import("../admin/AdminApp").then((module) => ({ default: module.AdminApp })));
const TrialPage = lazy(() => import("../pages/TrialPage").then((module) => ({ default: module.TrialPage })));

const manifestErrors = validateStimulusManifest();
if (manifestErrors.length) throw new Error(manifestErrors.join(" "));

function isAdminRoute() {
  return window.location.hash.startsWith("#/admin");
}

export function App() {
  const [adminRoute, setAdminRoute] = useState(isAdminRoute);
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const [session, setSession] = useState<StudySession | null>(loadSession);
  const [preConsentStage, setPreConsentStage] = useState<Extract<StudyStage, "landing" | "consent" | "declined">>("landing");
  const [creating, setCreating] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [resumeState, setResumeState] = useState<"ready" | "checking" | "error">("ready");
  const [resumeAttempt, setResumeAttempt] = useState(0);

  useEffect(() => {
    const onHashChange = () => setAdminRoute(isAdminRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [session?.stage, session?.currentTrialIndex, preConsentStage]);

  const orderedStimuli = useMemo(() => {
    if (!session) return [];
    return session.orderedStimulusIds.map((id) => {
      const stimulus = stimulusById.get(id);
      if (!stimulus) throw new Error(`Unknown stimulus in saved sequence: ${id}`);
      return stimulus;
    });
  }, [session]);

  useEffect(() => {
    if (!session || session.stage !== "trials" || session.trialStartedAt) return;
    const updated = { ...session, trialStartedAt: new Date().toISOString() };
    setSession(updated);
    saveSession(updated);
  }, [session]);

  useEffect(() => {
    if (!session || session.stage !== "trials" || adminRoute) {
      setResumeState("ready");
      return;
    }
    let cancelled = false;
    setResumeState("checking");
    reconcileParticipantSession(session)
      .then((reconciled) => {
        if (cancelled) return;
        saveSession(reconciled);
        setSession(reconciled);
        setResumeState("ready");
      })
      .catch(() => {
        if (!cancelled) setResumeState("error");
      });
    return () => { cancelled = true; };
  }, [session?.participantId, session?.stage, adminRoute, resumeAttempt]);

  const updateSession = (updates: Partial<StudySession>) => {
    setSession((current) => {
      if (!current) return current;
      const updated = { ...current, ...updates };
      saveSession(updated);
      return updated;
    });
  };

  const startParticipant = async () => {
    setCreating(true);
    setConsentError(null);
    try {
      const deviceType = detectDeviceType();
      const orderedStimuli = createTrialOrder(studyStimuli);
      const identity = await createParticipant(deviceType, orderedStimuli);
      const nextSession: StudySession = {
        version: 2,
        participantId: identity.id,
        deviceType,
        startedAt: identity.startedAt,
        stage: "instructions",
        orderedStimulusIds: orderedStimuli.map((stimulus) => stimulus.id),
        currentTrialIndex: 0,
        trialStartedAt: null,
        completedAt: null,
      };
      saveSession(nextSession);
      setSession(nextSession);
    } catch {
      setConsentError(language === "de"
        ? "Die Studie konnte nicht gestartet werden. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut."
        : "The study could not be started. Please check your internet connection and try again.");
    } finally {
      setCreating(false);
    }
  };

  const submitPractice = async (_answers: TrialAnswers) => {
    updateSession({ stage: "trials", currentTrialIndex: 0, trialStartedAt: new Date().toISOString() });
  };

  const submitRealTrial = async (answers: TrialAnswers) => {
    if (!session) return;
    const stimulus = orderedStimuli[session.currentTrialIndex];
    if (!stimulus) throw new Error("Stimulus not found.");
    const submittedAt = new Date().toISOString();
    const startedAt = session.trialStartedAt ?? submittedAt;

    await submitTrialResponse({
      participantId: session.participantId,
      trialIndex: session.currentTrialIndex,
      stimulus,
      answers,
      startedAt,
      submittedAt,
    });

    const isLastTrial = session.currentTrialIndex === orderedStimuli.length - 1;
    if (isLastTrial) {
      await completeParticipant(session.participantId, submittedAt);
      updateSession({ stage: "completed", completedAt: submittedAt, trialStartedAt: null });
    } else {
      updateSession({
        currentTrialIndex: session.currentTrialIndex + 1,
        trialStartedAt: new Date().toISOString(),
      });
    }
  };

  if (adminRoute) return <Suspense fallback={<div className="route-loading">Ansicht wird geladen …</div>}><AdminApp /></Suspense>;

  if (session?.stage === "trials" && resumeState === "checking") {
    return <div className="route-loading">{language === "de" ? "Sitzung wird wiederhergestellt …" : "Restoring session …"}</div>;
  }

  if (session?.stage === "trials" && resumeState === "error") {
    return (
      <div className="fatal-error">
        <LanguageSwitch language={language} onChange={setLanguage} />
        <span>{language === "de" ? "SITZUNGSFEHLER" : "SESSION ERROR"}</span>
        <h1>{language === "de" ? "Die Studie konnte nicht sicher fortgesetzt werden." : "The study could not be resumed safely."}</h1>
        <p>{language === "de" ? "Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut. Falls die anonyme Sitzung nicht mehr vorhanden ist, können Sie eine neue Teilnahme beginnen." : "Check your internet connection and try again. If the anonymous session is no longer available, you can begin a new participation."}</p>
        <div className="recovery-actions">
          <button type="button" className="button button-primary" onClick={() => setResumeAttempt((attempt) => attempt + 1)}>{language === "de" ? "Erneut versuchen" : "Try again"}</button>
          <button type="button" className="button button-secondary" onClick={() => { clearSession(); setSession(null); setPreConsentStage("landing"); setResumeState("ready"); }}>{language === "de" ? "Neue Teilnahme beginnen" : "Begin new participation"}</button>
        </div>
      </div>
    );
  }

  if (!session) {
    if (preConsentStage === "consent") {
      return <ConsentPage language={language} onLanguageChange={setLanguage} onBack={() => setPreConsentStage("landing")} onConsent={startParticipant} onDecline={() => setPreConsentStage("declined")} busy={creating} error={consentError} />;
    }
    if (preConsentStage === "declined") return <DeclinedPage language={language} onLanguageChange={setLanguage} />;
    return <LandingPage language={language} onLanguageChange={setLanguage} onContinue={() => setPreConsentStage("consent")} />;
  }

  if (session.stage === "instructions") {
    return <InstructionsPage language={language} onLanguageChange={setLanguage} onContinue={() => updateSession({ stage: "practice" })} />;
  }
  if (session.stage === "practice") {
    return <Suspense fallback={<div className="route-loading">{language === "de" ? "Ansicht wird geladen …" : "Loading view …"}</div>}><TrialPage language={language} onLanguageChange={setLanguage} stimulus={practiceStimulus} practice onSubmit={submitPractice} /></Suspense>;
  }
  if (session.stage === "trials") {
    const stimulus = orderedStimuli[session.currentTrialIndex];
    if (!stimulus) throw new Error("The saved study order contains an unknown stimulus.");
    return <Suspense fallback={<div className="route-loading">{language === "de" ? "Ansicht wird geladen …" : "Loading view …"}</div>}><TrialPage language={language} onLanguageChange={setLanguage} stimulus={stimulus} practice={false} trialNumber={session.currentTrialIndex + 1} totalTrials={orderedStimuli.length} onSubmit={submitRealTrial} /></Suspense>;
  }
  return <CompletionPage language={language} onLanguageChange={setLanguage} />;
}
