import { ArrowRight, CheckCircle2, Mouse, Rotate3D, RotateCcw, ZoomIn } from "lucide-react";
import { StudyHeader } from "../components/StudyHeader";
import type { Language } from "../types/study";

export function InstructionsPage({
  language,
  onLanguageChange,
  onContinue,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onContinue: () => void;
}) {
  return (
    <div className="page inner-page">
      <StudyHeader language={language} onLanguageChange={onLanguageChange} />
      <main className="instructions-main">
        <section className="instructions-intro">
          <span className="eyebrow">{language === "de" ? "Schritt 2 von 2" : "Step 2 of 2"}</span>
          <h1>{language === "de" ? "So untersuchen Sie die Modelle" : "How to inspect the models"}</h1>
          <p className="lead">{language === "de" ? "Sie sehen immer genau ein 3D-Modell und das zugehörige Referenzfoto. Nehmen Sie sich Zeit, das Modell aus verschiedenen Blickwinkeln zu betrachten." : "You will see one 3D model and its reference photograph at a time. Take time to inspect the model from different angles."}</p>
        </section>
        <div className="instruction-grid">
          <article><span><Rotate3D /></span><div><b>01</b><h2>{language === "de" ? "Drehen" : "Rotate"}</h2><p>{language === "de" ? "Desktop: Linke Maustaste gedrückt halten und ziehen. Mobil: Mit einem Finger ziehen." : "Desktop: Hold the left mouse button and drag. Mobile: Drag with one finger."}</p></div></article>
          <article><span><ZoomIn /></span><div><b>02</b><h2>{language === "de" ? "Zoomen" : "Zoom"}</h2><p>{language === "de" ? "Desktop: Mausrad verwenden. Mobil: Mit zwei Fingern zoomen." : "Desktop: Use the mouse wheel. Mobile: Pinch with two fingers."}</p></div></article>
          <article><span><RotateCcw /></span><div><b>03</b><h2>{language === "de" ? "Zurücksetzen" : "Reset"}</h2><p>{language === "de" ? "Mit „Ansicht zurücksetzen“ kehren Sie zur Ausgangsansicht zurück." : "Use “Reset view” to return to the initial framing."}</p></div></article>
        </div>
        <div className="instruction-rule"><CheckCircle2 /><p>{language === "de" ? "Das Referenzbild bleibt sichtbar und das Modell kann beim Beantworten jederzeit weiter gedreht, gezoomt und zurückgesetzt werden. Beantworten Sie alle sechs Skalenfragen; die anschließende Freitextfrage ist optional. Nach „Weiter“ ist der Durchgang abgeschlossen und kann nicht erneut geöffnet werden." : "The reference image remains visible, and you can continue rotating, zooming, and resetting the model while answering. Answer all six scale items; the following free-text question is optional. After selecting “Continue,” the trial is complete and cannot be reopened."}</p></div>
        <button type="button" className="button button-primary button-large" onClick={onContinue}>
          <Mouse size={18} />{language === "de" ? "Übungsdurchgang starten" : "Start practice trial"}<ArrowRight size={18} />
        </button>
      </main>
    </div>
  );
}
