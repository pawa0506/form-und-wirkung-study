import { Languages } from "lucide-react";
import { getCopy } from "../config/copy";
import type { Language } from "../types/study";

export function LanguageSwitch({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  const t = getCopy(language);
  return (
    <button
      type="button"
      className="language-switch"
      aria-label={t.languageLabel}
      onClick={() => onChange(language === "de" ? "en" : "de")}
    >
      <Languages size={16} /> {t.language}
    </button>
  );
}
