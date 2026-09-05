import { useEffect, useRef, useState } from "react";
import { Rotate3D, RotateCcw, Search } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getCopy } from "../config/copy";
import type { Language, Stimulus } from "../types/study";
import { loadStudyAsset, normalizeObject } from "./loaders";

interface StudyViewerProps {
  stimulus: Stimulus;
  language: Language;
}

export function StudyViewer({ stimulus, language }: StudyViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [retryKey, setRetryKey] = useState(0);
  const t = getCopy(language);

  useEffect(() => {
    mountRef.current?.querySelector("canvas")?.setAttribute("aria-label", t.model);
  }, [t.model]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    setStatus("loading");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2c2e2d);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
    camera.position.set(0, 0.15, 4.15);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setStatus("error");
      return;
    }
    const mobileLike = window.matchMedia("(pointer: coarse)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobileLike ? 1.35 : 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute("aria-label", t.model);
    renderer.domElement.style.touchAction = "none";
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setStatus("error");
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.screenSpacePanning = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 7;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.78;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
    controls.target.set(0, 0, 0);
    controls.update();
    controls.saveState();
    controlsRef.current = controls;

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3.2, 4.5, 4.3);
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.25);
    fillLight.position.set(-4, 1.5, 2.5);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(1, 3, -4);
    const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 1.3);
    scene.add(keyLight, fillLight, rimLight, ambient);

    let disposed = false;
    let frame = 0;
    let cleanupAsset: (() => void) | undefined;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const animate = () => {
      controls.update();
      if (!document.hidden) renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    loadStudyAsset(stimulus, renderer, scene)
      .then((asset) => {
        if (disposed) {
          asset.dispose();
          return;
        }
        try {
          normalizeObject(asset.object, asset.boundingBox, stimulus.initialRotation);
          if (!asset.object.parent) scene.add(asset.object);
          cleanupAsset = asset.dispose;
        } catch (error) {
          asset.dispose();
          throw error;
        }
        setStatus("ready");
      })
     .catch((error) => {
  console.error("Failed to load study asset:", stimulus, error);
  if (!disposed) setStatus("error");
});

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      controlsRef.current = null;
      cleanupAsset?.();
      scene.clear();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [stimulus, retryKey]);

  return (
    <section className="viewer-shell" aria-label={t.model}>
      <div ref={mountRef} className="viewer-canvas" />

      {status === "loading" && (
        <div className="viewer-state" role="status">
          <span className="loader-orbit" />
          <span>{t.loading}</span>
        </div>
      )}
      {status === "error" && (
        <div className="viewer-state viewer-error" role="alert">
          <span>{t.assetError}</span>
          <button type="button" className="button button-ghost light" onClick={() => setRetryKey((key) => key + 1)}>
            {t.retry}
          </button>
        </div>
      )}

      <div className="viewer-toolbar">
        <div className="viewer-hints" aria-hidden="true">
          <span><Rotate3D size={16} /> {t.rotateHint}</span>
          <span><Search size={16} /> {t.zoomHint}</span>
        </div>
        <button
          type="button"
          className="reset-button"
          onClick={() => controlsRef.current?.reset()}
          disabled={status !== "ready"}
        >
          <RotateCcw size={16} /> {t.reset}
        </button>
      </div>
    </section>
  );
}
