import { useState } from "react";
import { StudyHeader } from "../components/StudyHeader";
import { experienceLabels, experienceValues } from "../config/experience";
import type { Experience3D, Language } from "../types/study";
export function ExperiencePage({language, onLanguageChange, onContinue, busy, error}: {
 language: Language; onLanguageChange: (language: Language) => void;
 onContinue: (experience: Experience3D | null) => Promise<void>; busy: boolean; error: string | null;
}) {
 const [selected, setSelected] = useState<string>("");
 return <div className="page inner-page"><StudyHeader language={language} onLanguageChange={onLanguageChange}/>
 <main className="narrow-main"><span className="eyebrow">{language === "de" ? "Schritt 2 von 3" : "Step 2 of 3"}</span>
 <h1>{language === "de" ? "Ihre bisherige Erfahrung" : "Your previous experience"}</h1>
 <form onSubmit={event => {event.preventDefault(); if (selected && !busy) void onContinue(selected === "none" ? null : selected as Experience3D);}}>
 <fieldset className="experience-options"><legend>{language === "de" ? "Wie häufig haben Sie bisher interaktive 3D-Modelle am Computer, Tablet oder Smartphone betrachtet?" : "How often have you previously viewed interactive 3D models on a computer, tablet or smartphone?"}</legend>
 {[...experienceValues, "none"].map((value, index) => <label key={value}><input type="radio" name="experience" value={value} required checked={selected === value} disabled={busy} onChange={() => setSelected(value)}/>{experienceLabels[language][index]}</label>)}
 </fieldset>{error && <p role="alert" className="form-error">{error}</p>}
 <button type="submit" className="button button-primary" disabled={!selected || busy}>{busy ? (language === "de" ? "Wird gespeichert …" : "Saving …") : (language === "de" ? "Weiter" : "Continue")}</button>
 </form></main></div>;
}
