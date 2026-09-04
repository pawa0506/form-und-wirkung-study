import { Info } from "lucide-react";
import { LikertForm } from "../components/LikertForm";
import { ReferenceImage } from "../components/ReferenceImage";
import { StudyHeader } from "../components/StudyHeader";
import { StudyViewer } from "../viewer/StudyViewer";
import type { Language, Stimulus, TrialAnswers } from "../types/study";

export function TrialPage({
  language,
  onLanguageChange,
  stimulus,
  practice,
  trialNumber,
  totalTrials,
  onSubmit,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
  stimulus: Stimulus;
  practice: boolean;
  trialNumber?: number;
  totalTrials?: number;
  onSubmit: (answers: TrialAnswers) => Promise<void>;
}) {
  return (
    <div className="page trial-page">
      <StudyHeader
        compact
        language={language}
        onLanguageChange={onLanguageChange}
        step={practice ? undefined : trialNumber}
        total={practice ? undefined : totalTrials}
      />
      <main className="trial-main">
        {practice ? (
          <div className="practice-banner"><Info size={17} /><span><strong>{language === "de" ? "Übungsdurchgang" : "Practice trial"}</strong> · {language === "de" ? "Diese Bewertung wird nicht gespeichert." : "This rating will not be saved."}</span></div>
        ) : (
          <div className="trial-kicker"><span>{language === "de" ? `Modell ${trialNumber} von ${totalTrials}` : `Model ${trialNumber} of ${totalTrials}`}</span><span>{language === "de" ? "Vergleichsansicht" : "Comparison view"}</span></div>
        )}
        <div className="trial-workspace">
          <aside className="media-stack" aria-label={language === "de" ? "Modell und Referenzbild" : "Model and reference image"}>
            <div className="model-panel">
              <div className="panel-label"><span>01</span>{language === "de" ? "Interaktives 3D-Modell" : "Interactive 3D model"}</div>
              <StudyViewer stimulus={stimulus} language={language} />
            </div>
            <div className="reference-panel">
              <div className="panel-label"><span>02</span>{language === "de" ? "Fotografie des Originals" : "Photograph of the original"}</div>
              <ReferenceImage key={stimulus.referenceImagePath} path={stimulus.referenceImagePath} language={language} />
            </div>
          </aside>
          <LikertForm
            language={language}
            stimulusId={stimulus.id}
            onSubmit={onSubmit}
            submitLabel={practice ? (language === "de" ? "Studie beginnen" : "Begin study") : undefined}
          />
        </div>
      </main>
    </div>
  );
}
