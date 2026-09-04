import type { Language, StudySession } from "../types/study";

const SESSION_KEY = "form-wirkung.study-session.v2";
const LANGUAGE_KEY = "form-wirkung.language";

export function loadSession(): StudySession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudySession;
    return parsed.version === 2 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StudySession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function loadLanguage(): Language {
  try {
    return sessionStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

export function saveLanguage(language: Language): void {
  try {
    sessionStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // The current in-memory language still works when browser storage is unavailable.
  }
}

export function clearSessionForDevelopment(): void {
  if (import.meta.env.DEV) localStorage.removeItem(SESSION_KEY);
}
