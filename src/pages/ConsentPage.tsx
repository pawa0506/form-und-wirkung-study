import { ArrowLeft, ArrowRight, Database, Fingerprint, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { StudyHeader } from "../components/StudyHeader";
import type { Language } from "../types/study";

export function ConsentPage({
  language,
  onLanguageChange,
  onBack,
  onConsent,
  onDecline,
  busy,
  error,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onBack: () => void;
  onConsent: () => void;
  onDecline: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="page inner-page">
      <StudyHeader language={language} onLanguageChange={onLanguageChange} />
      <main className="narrow-main">
        <button type="button" className="text-button" onClick={onBack}><ArrowLeft size={16} />{language === "de" ? "Zurück" : "Back"}</button>
        <span className="eyebrow">{language === "de" ? "Schritt 1 von 2" : "Step 1 of 2"}</span>
        <h1>{language === "de" ? "Einwilligung zur Teilnahme" : "Consent to participate"}</h1>
        <p className="lead">
          {language === "de"
            ? "Bitte lesen Sie die folgenden Hinweise. Ihre Teilnahme ist freiwillig und kann jederzeit durch Schließen der Seite beendet werden. Bereits anonym übermittelte Bewertungen können Ihnen später nicht mehr zugeordnet werden."
            : "Please read the following information. Participation is voluntary and may be stopped at any time by closing the page. Ratings already submitted anonymously cannot later be linked back to you."}
        </p>

        <div className="consent-points">
          <article><Fingerprint /><div><h2>{language === "de" ? "Anonyme Kennung" : "Anonymous identifier"}</h2><p>{language === "de" ? "Erst nach Ihrer Einwilligung erzeugen wir eine zufällige Kennung. Es werden keine direkten Identifikationsdaten erhoben." : "Only after consent do we generate a random identifier. No directly identifying data is collected."}</p></div></article>
          <article><Database /><div><h2>{language === "de" ? "Gespeicherte Angaben" : "Stored data"}</h2><p>{language === "de" ? "Gespeichert werden Ihre Bewertungen, Zeitstempel, die Reihenfolge der Modelle und nur der Gerätetyp (Desktop, Tablet oder Mobilgerät)." : "We store ratings, timestamps, model order, and only the device category (desktop, tablet, or mobile)."}</p></div></article>
          <article><ShieldCheck /><div><h2>{language === "de" ? "Zweck und Verwendung" : "Purpose and use"}</h2><p>{language === "de" ? "Die Daten werden ausschließlich zur Auswertung dieser Bachelorarbeit verwendet und nur in zusammengefasster Form veröffentlicht." : "The data is used solely to evaluate this bachelor thesis and is published only in aggregated form."}</p></div></article>
        </div>

        <label className="consent-check">
          <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
          <span aria-hidden="true" />
          {language === "de"
            ? "Ich habe die Informationen gelesen, bin mindestens 18 Jahre alt und willige freiwillig in die Teilnahme ein."
            : "I have read the information, am at least 18 years old, and voluntarily consent to participate."}
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="consent-actions">
          <button type="button" className="button button-secondary" onClick={onDecline} disabled={busy}>{language === "de" ? "Nicht teilnehmen" : "Do not participate"}</button>
          <button type="button" className="button button-primary" onClick={onConsent} disabled={!checked || busy}>
            {busy ? (language === "de" ? "Wird vorbereitet …" : "Preparing …") : (language === "de" ? "Einwilligen und fortfahren" : "Consent and continue")}
            {!busy && <ArrowRight size={18} />}
          </button>
        </div>
      </main>
    </div>
  );
}
