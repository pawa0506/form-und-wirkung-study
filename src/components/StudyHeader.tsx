import type { Language } from "../types/study";
import { LanguageSwitch } from "./LanguageSwitch";

interface StudyHeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  step?: number;
  total?: number;
  compact?: boolean;
}

export function StudyHeader({ language, onLanguageChange, step, total, compact }: StudyHeaderProps) {
  const progress = step && total ? Math.min(100, (step / total) * 100) : 0;
  return (
    <header className={`site-header${compact ? " site-header-compact" : ""}`}>
      <div className="brand-lockup" aria-label="Form und Wirkung">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>FORM<span className="brand-amp">&</span>WIRKUNG</span>
      </div>
      {step && total ? (
        <div className="header-progress" aria-label={`${step} / ${total}`}>
          <span>{language === "de" ? `Modell ${step} von ${total}` : `Model ${step} of ${total}`}</span>
          <span className="progress-track"><i style={{ width: `${progress}%` }} /></span>
        </div>
      ) : <span className="header-study-code">VIS·3D / 2026</span>}
      <LanguageSwitch language={language} onChange={onLanguageChange} />
    </header>
  );
}
