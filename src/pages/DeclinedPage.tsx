import { StudyHeader } from "../components/StudyHeader";
import type { Language } from "../types/study";

export function DeclinedPage({ language, onLanguageChange }: { language: Language; onLanguageChange: (language: Language) => void }) {
  return (
    <div className="page inner-page">
      <StudyHeader language={language} onLanguageChange={onLanguageChange} />
      <main className="message-main">
        <span className="eyebrow">{language === "de" ? "Teilnahme beendet" : "Participation ended"}</span>
        <h1>{language === "de" ? "Es wurden keine Daten gespeichert." : "No data has been stored."}</h1>
        <p>{language === "de" ? "Sie haben der Teilnahme nicht zugestimmt. Sie können dieses Fenster nun schließen." : "You did not consent to participate. You may now close this window."}</p>
      </main>
    </div>
  );
}
