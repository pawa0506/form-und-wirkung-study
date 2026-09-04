import { Check, ShieldCheck } from "lucide-react";
import { StudyHeader } from "../components/StudyHeader";
import type { Language } from "../types/study";

export function CompletionPage({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  return (
    <div className="page completion-page">
      <StudyHeader language={language} onLanguageChange={onLanguageChange} />
      <main className="completion-main">
        <div className="completion-seal"><Check size={38} strokeWidth={1.5} /></div>
        <span className="eyebrow">{language === "de" ? "Studie abgeschlossen" : "Study completed"}</span>
        <h1>{language === "de" ? "Vielen Dank für Ihre Teilnahme." : "Thank you for participating."}</h1>
        <p>{language === "de" ? "Ihre Antworten wurden vollständig übermittelt. Sie können dieses Fenster jetzt schließen." : "Your responses have been submitted in full. You may now close this window."}</p>
        <p className="privacy-confirmation"><ShieldCheck size={17} />{language === "de" ? "Es wurden keine direkten Identifikationsdaten erfasst." : "No directly identifying data was collected."}</p>
      </main>
    </div>
  );
}
