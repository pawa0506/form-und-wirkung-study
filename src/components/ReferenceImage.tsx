import { useState } from "react";
import { ImageOff } from "lucide-react";
import { getCopy } from "../config/copy";
import { resolvePublicPath } from "../lib/paths";
import type { Language } from "../types/study";

export function ReferenceImage({ path, language }: { path: string; language: Language }) {
  const [failed, setFailed] = useState(false);
  const t = getCopy(language);
  return (
    <figure className="reference-card">
      {failed ? (
        <div className="reference-fallback" role="alert">
          <ImageOff size={24} />
          <span>{language === "de" ? "Referenzbild nicht verfügbar" : "Reference image unavailable"}</span>
          <button type="button" className="button button-ghost" onClick={() => setFailed(false)}>{t.retry}</button>
        </div>
      ) : (
        <img src={resolvePublicPath(path)} alt={t.reference} onError={() => setFailed(true)} />
      )}
      <figcaption>
        <span>{t.reference}</span>
        <span>{language === "de" ? "Fotografie" : "Photograph"}</span>
      </figcaption>
    </figure>
  );
}
