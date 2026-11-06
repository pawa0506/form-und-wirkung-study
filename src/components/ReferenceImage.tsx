import { useState } from "react";
import { ZoomableReference } from "./ZoomableReference";
import { ImageOff } from "lucide-react";
import { getCopy } from "../config/copy";
import { resolvePublicPath } from "../lib/paths";
import type { Language } from "../types/study";

export function ReferenceImage({ path, paths, language }: { path: string; paths?: readonly [string, string]; language: Language }) {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState(false);
  const images = paths ?? [path];
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
        <ZoomableReference key={images[selected]} language={language} src={resolvePublicPath(images[selected])} alt={paths ? `${t.reference} – ${language === "de" ? "Ansicht" : "View"} ${selected + 1}` : t.reference} onError={() => setFailed(true)} />
      )}
      <figcaption>
        <span>{t.reference}</span>
        {paths ? (
          <div className="reference-options" role="group" aria-label={language === "de" ? "Referenzansicht auswählen" : "Choose reference view"}>
            {images.map((image, index) => (
              <button key={image} type="button" aria-pressed={selected === index}
                onClick={() => { setSelected(index); setFailed(false); }}>
                {language === "de" ? "Ansicht" : "View"} {index + 1}
              </button>
            ))}
          </div>
        ) : <span>{language === "de" ? "Fotografie" : "Photograph"}</span>}
      </figcaption>
    </figure>
  );
}
