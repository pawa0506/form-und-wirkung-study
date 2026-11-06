import { useEffect, useRef } from "react";
import type { Language } from "../types/study";

export function ZoomableReference({ src, alt, language, onError }: {
  src: string; alt: string; language: Language; onError: () => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const reset = useRef(() => {});
  const zoom = useRef((_factor: number) => {});

  useEffect(() => {
    const element = frame.current!;
    let scale = 1, x = 0, y = 0;
    const pointers = new Map<number, { x: number; y: number }>();
    const paint = () => {
      const maxX = element.clientWidth * (scale - 1) / 2;
      const maxY = element.clientHeight * (scale - 1) / 2;
      x = Math.max(-maxX, Math.min(maxX, x));
      y = Math.max(-maxY, Math.min(maxY, y));
      if (image.current) image.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    };
    const applyZoom = (factor: number, cx = 0, cy = 0) => {
      const next = Math.max(1, Math.min(5, scale * factor));
      x = cx - (cx - x) * next / scale;
      y = cy - (cy - y) * next / scale;
      scale = next;
      paint();
    };
    zoom.current = applyZoom;
    reset.current = () => { scale = 1; x = 0; y = 0; paint(); };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const bounds = element.getBoundingClientRect();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      applyZoom(Math.exp(-Math.max(-200, Math.min(200, delta)) * .002),
        event.clientX - bounds.left - bounds.width / 2,
        event.clientY - bounds.top - bounds.height / 2);
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      element.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      const before = [...pointers.values()];
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const after = [...pointers.values()];
      if (before.length === 2) {
        const distance = (points: typeof before) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const oldDistance = distance(before);
        const bounds = element.getBoundingClientRect();
        const cx = (before[0].x + before[1].x) / 2;
        const cy = (before[0].y + before[1].y) / 2;
        if (oldDistance > 0) applyZoom(distance(after) / oldDistance, cx - bounds.left - bounds.width / 2, cy - bounds.top - bounds.height / 2);
        x += (after[0].x + after[1].x) / 2 - cx;
        y += (after[0].y + after[1].y) / 2 - cy;
      } else if (before.length === 1 && scale > 1) {
        x += event.clientX - previous.x;
        y += event.clientY - previous.y;
      }
      paint();
    };
    const up = (event: PointerEvent) => pointers.delete(event.pointerId);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("lostpointercapture", up);
    const observer = new ResizeObserver(paint);
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("lostpointercapture", up);
    };
  }, []);

  return <div className="reference-zoom-shell">
    <div ref={frame} className="reference-zoom-frame">
      <img ref={image} src={src} alt={alt} draggable={false} onError={onError} />
    </div>
    <div className="reference-zoom-tools">
      <span>{language === "de" ? "Scrollen oder Pinch zum Zoomen · Ziehen zum Verschieben" : "Scroll or pinch to zoom · Drag to move"}</span>
      <button type="button" onClick={() => zoom.current(1.25)} aria-label={language === "de" ? "Referenzbild vergrößern" : "Zoom in reference"}>+</button>
      <button type="button" onClick={() => zoom.current(.8)} aria-label={language === "de" ? "Referenzbild verkleinern" : "Zoom out reference"}>−</button>
      <button type="button" onClick={() => reset.current()}>{language === "de" ? "Zurücksetzen" : "Reset"}</button>
    </div>
  </div>;
}
