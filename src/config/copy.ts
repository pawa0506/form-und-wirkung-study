import type { Language } from "../types/study";

export const likertItems = {
  "de": [
    "Die Form und die Proportionen des 3D-Modells entsprechen der abgebildeten Skulptur.",
    "Die Farben des 3D-Modells stimmen mit denen der Skulptur auf den Referenzfotos überein.",
    "Die Oberflächenstruktur der Skulptur ist im 3D-Modell gut wiedergegeben.",
    "Feine Details der Skulptur sind im 3D-Modell gut wiedergegeben.",
    "Das 3D-Modell vermittelt einen realistischen Eindruck des dargestellten Materials (z. B. Bronze oder Stein).",
    "Beim Drehen des 3D-Modells bleiben Formen und Details visuell stabil.",
    "Das 3D-Modell ist weitgehend frei von störenden visuellen Darstellungsfehlern.",
    "Insgesamt stimmt das 3D-Modell visuell gut mit der fotografierten Skulptur überein."
  ],
  "en": [
    "The shape and proportions of the 3D model correspond to the sculpture shown.",
    "The colors of the 3D model match those of the sculpture in the reference photographs.",
    "The surface structure of the sculpture is well reproduced in the 3D model.",
    "Fine details of the sculpture are well reproduced in the 3D model.",
    "The 3D model conveys a realistic impression of the material depicted (e.g. bronze or stone).",
    "When rotating the 3D model, shapes and details remain visually stable.",
    "The 3D model is largely free of distracting visual rendering errors.",
    "Overall, the 3D model visually matches the photographed sculpture well."
  ]
} as const;

export const likertConstructs = [
  "Geometrische Stimmigkeit",
  "Farbtreue",
  "Oberflächen- / Texturtreue",
  "Detailtreue",
  "Materialrealismus",
  "Blickwinkelstabilität",
  "Visuelle Artefakte",
  "Globale visuelle Übereinstimmung",
] as const;

const copy = {
  de: {
    studyLabel: "Bachelorstudie · 3D-Rekonstruktion",
    duration: "Dauer wird im Pilottest ermittelt",
    language: "EN",
    languageLabel: "Switch to English",
    next: "Weiter",
    start: "Zur Studie",
    reset: "Ansicht zurücksetzen",
    model: "3D-Modell",
    reference: "Referenzobjekt",
    rotateHint: "Ziehen zum Drehen",
    zoomHint: "Scrollen oder Pinch zum Zoomen",
    loading: "3D-Modell wird geladen …",
    assetError: "Das 3D-Modell konnte nicht geladen werden.",
    retry: "Erneut versuchen",
    stronglyDisagree: "stimme überhaupt nicht zu",
    stronglyAgree: "stimme voll zu",
    requiredHint: "Bitte beantworten Sie alle acht Aussagen.",
    saving: "Antworten werden gespeichert …",
    retrySave: "Erneut speichern",
    optional: "optional",
    openQuestion: "Welche visuellen Eigenschaften oder Darstellungsfehler sind Ihnen beim Betrachten des 3D-Modells besonders aufgefallen?",
    openPlaceholder: "Ihre Beobachtungen …",
  },
  en: {
    studyLabel: "Bachelor study · 3D reconstruction",
    duration: "Duration to be established in the pilot study",
    language: "DE",
    languageLabel: "Auf Deutsch wechseln",
    next: "Continue",
    start: "Start study",
    reset: "Reset view",
    model: "3D model",
    reference: "Reference object",
    rotateHint: "Drag to rotate",
    zoomHint: "Scroll or pinch to zoom",
    loading: "Loading 3D model …",
    assetError: "The 3D model could not be loaded.",
    retry: "Try again",
    stronglyDisagree: "strongly disagree",
    stronglyAgree: "strongly agree",
    requiredHint: "Please answer all eight statements.",
    saving: "Saving responses …",
    retrySave: "Save again",
    optional: "optional",
    openQuestion: "Which visual properties or rendering errors particularly stood out to you while viewing the 3D model?",
    openPlaceholder: "Your observations …",
  },
} as const;

export function getCopy(language: Language) {
  return copy[language];
}

export const scaleLabels = { de: ["Stimme überhaupt nicht zu", "Stimme nicht zu", "Stimme eher nicht zu", "Weder noch", "Stimme eher zu", "Stimme zu", "Stimme voll zu"], en: ["Strongly disagree", "Disagree", "Somewhat disagree", "Neither agree nor disagree", "Somewhat agree", "Agree", "Strongly agree"] } as const;
