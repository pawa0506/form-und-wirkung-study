import { ArrowRight, Clock3, Eye, Lock, MousePointer2 } from "lucide-react";
import type { Language } from "../types/study";
import { StudyHeader } from "../components/StudyHeader";
import { getCopy } from "../config/copy";

export function LandingPage({
  language,
  onLanguageChange,
  onContinue,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onContinue: () => void;
}) {
  const t = getCopy(language);
  return (
    <div className="page landing-page">
      <StudyHeader language={language} onLanguageChange={onLanguageChange} />
      <main className="landing-main">
        <section className="landing-copy">
          <span className="eyebrow">{t.studyLabel}</span>
          <h1>{language === "de" ? (
            <>Wie nah kommt ein <em>3D-Modell</em> dem Original?</>
          ) : (
            <>How closely does a <em>3D model</em> match the original?</>
          )}</h1>
          <p className="landing-intro">
            {language === "de"
              ? "In dieser Studie betrachten Sie digitale Rekonstruktionen öffentlicher Skulpturen und vergleichen deren visuelle Qualität mit Fotografien der Originale."
              : "In this study, you will inspect digital reconstructions of public sculptures and compare their visual quality with photographs of the originals."}
          </p>
          <p className="landing-details">
            {language === "de"
              ? "Sie untersuchen neun interaktive 3D-Modelle und bewerten sichtbare Form-, Farb-, Oberflächen- und Detailmerkmale. Die Teilnahme dauert ungefähr 12 Minuten, ist anonym und freiwillig; Sie können die Studie jederzeit durch Schließen des Fensters beenden."
              : "You will inspect nine interactive 3D models and rate visible shape, color, surface, and detail characteristics. Participation takes about 12 minutes, is anonymous and voluntary; you may stop at any time by closing the window."}
          </p>
          <button type="button" className="button button-primary button-large" onClick={onContinue}>
            {t.start}<ArrowRight size={19} />
          </button>
          <p className="landing-note">
            <Lock size={15} />
            {language === "de"
              ? "Anonym · keine Namen, Kontaktdaten oder demografischen Angaben"
              : "Anonymous · no names, contact details, or demographic information"}
          </p>
        </section>

        <aside className="landing-visual" aria-label={language === "de" ? "Studienübersicht" : "Study overview"}>
          <div className="visual-index">01—09</div>
          <div className="sculpture-stage" aria-hidden="true">
            <span className="plinth" />
            <span className="sculpture-form form-one" />
            <span className="sculpture-form form-two" />
            <span className="sculpture-form form-three" />
            <span className="orbit-line" />
          </div>
          <div className="study-facts">
            <div><Eye size={19} /><span><strong>9</strong>{language === "de" ? "Modelle" : "models"}</span></div>
            <div><MousePointer2 size={19} /><span><strong>6</strong>{language === "de" ? "Aussagen je Modell" : "statements each"}</span></div>
            <div><Clock3 size={19} /><span><strong>12</strong>{language === "de" ? "Minuten" : "minutes"}</span></div>
          </div>
        </aside>
      </main>
      <footer className="landing-footer"><span>FORM / WIRKUNG</span><span>{language === "de" ? "Freiwillig · anonym · jederzeit beendbar" : "Voluntary · anonymous · may be stopped at any time"}</span></footer>
    </div>
  );
}
