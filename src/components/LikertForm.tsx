import { ArrowRight, LockKeyhole, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCopy, likertItems } from "../config/copy";
import type { Language, Ratings, TrialAnswers } from "../types/study";

const ratingKeys: (keyof Ratings)[] = ["geometry", "color", "surface", "detail", "artifacts", "overall"];

const emptyRatings = (): Ratings => ({
  geometry: null,
  color: null,
  surface: null,
  detail: null,
  artifacts: null,
  overall: null,
});

interface LikertFormProps {
  language: Language;
  stimulusId: string;
  onSubmit: (answers: TrialAnswers) => Promise<void>;
  submitLabel?: string;
}

export function LikertForm({ language, stimulusId, onSubmit, submitLabel }: LikertFormProps) {
  const [ratings, setRatings] = useState<Ratings>(emptyRatings);
  const [openVisualObservations, setOpenVisualObservations] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = getCopy(language);

  useEffect(() => {
    setRatings(emptyRatings());
    setOpenVisualObservations("");
    setAttempted(false);
    setSubmitting(false);
    setError(null);
  }, [stimulusId]);

  const complete = useMemo(() => Object.values(ratings).every((value) => value !== null), [ratings]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!complete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ratings, openVisualObservations });
    } catch {
      setError(language === "de"
        ? "Die Antworten konnten nicht gespeichert werden. Bitte prüfen Sie die Verbindung und versuchen Sie es erneut."
        : "The responses could not be saved. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <form className="rating-form" onSubmit={submit} noValidate aria-label={language === "de" ? "Fragebogen zum aktuellen Modell" : "Questionnaire for the current model"}>
      <div className="rating-heading">
        <div>
          <span className="eyebrow">{language === "de" ? "Ihre Einschätzung" : "Your assessment"}</span>
          <h2>{language === "de" ? "Wie beurteilen Sie dieses Modell?" : "How do you rate this model?"}</h2>
        </div>
        <div className="scale-key" aria-hidden="true">
          <span><b>1</b> {t.stronglyDisagree}</span>
          <i />
          <span><b>7</b> {t.stronglyAgree}</span>
        </div>
      </div>

      <div className="likert-items">
        {likertItems[language].map((item, itemIndex) => {
          const key = ratingKeys[itemIndex];
          return (
            <fieldset className="likert-row" key={key}>
              <legend><span>{String(itemIndex + 1).padStart(2, "0")}</span>{item}</legend>
              <div className="likert-options" role="radiogroup" aria-label={item} aria-required="true" aria-invalid={attempted && ratings[key] === null}>
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <label key={value} className={ratings[key] === value ? "selected" : ""}>
                    <input
                      type="radio"
                      name={`${stimulusId}-${key}`}
                      value={value}
                      checked={ratings[key] === value}
                      disabled={submitting}
                      onChange={() => setRatings((current) => ({ ...current, [key]: value }))}
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>

      <div className="open-response">
        <label htmlFor={`${stimulusId}-open-response`}>
          <span className="open-response-label">
            {t.openQuestion}
            <small>{t.optional}</small>
          </span>
          <textarea
            id={`${stimulusId}-open-response`}
            value={openVisualObservations}
            onChange={(event) => setOpenVisualObservations(event.target.value)}
            placeholder={t.openPlaceholder}
            maxLength={5000}
            rows={5}
            disabled={submitting}
          />
        </label>
        <span className="character-count">{openVisualObservations.length} / 5000</span>
      </div>

      <div className="rating-footer">
        <div className="validation-message" aria-live="polite">
          {attempted && !complete && <span>{t.requiredHint}</span>}
          {submitting && <span>{t.saving}</span>}
          {error && <span className="error-text">{error}</span>}
        </div>
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? <LockKeyhole size={18} /> : error ? <RefreshCw size={18} /> : <ArrowRight size={18} />}
          {submitting ? t.saving : error ? t.retrySave : submitLabel ?? t.next}
        </button>
      </div>
    </form>
  );
}
