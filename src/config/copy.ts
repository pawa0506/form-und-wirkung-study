import type { Language } from "../types/study";

export const likertItems = {
  de: [
    "Die sichtbare Form und die Proportionen des 3D-Modells entsprechen dem Referenzobjekt.",
    "Die Farben des 3D-Modells entsprechen dem Referenzobjekt.",
    "Die Oberflächenstruktur des Referenzobjekts ist im 3D-Modell gut wiedergegeben.",
    "Feine Details des Referenzobjekts sind im 3D-Modell gut wiedergegeben.",
    "Das 3D-Modell weist nur wenige störende visuelle Fehler oder Artefakte auf.",
    "Insgesamt empfinde ich die visuelle Übereinstimmung des 3D-Modells mit dem Referenzobjekt als hoch.",
  ],
  en: [
    "The visible shape and proportions of the 3D model correspond to the reference object.",
    "The colors of the 3D model correspond to the reference object.",
    "The surface structure of the reference object is well reproduced in the 3D model.",
    "Fine details of the reference object are well represented in the 3D model.",
    "The 3D model has only a few distracting visual errors or artifacts.",
    "Overall, I consider the visual correspondence between the 3D model and the reference object to be high.",
  ],
} as const;

export const likertConstructs = [
  "Geometrische Stimmigkeit",
  "Farbtreue",
  "Oberflächen- / Texturtreue",
  "Detailtreue",
  "Visuelle Artefakte",
  "Globale visuelle Übereinstimmung",
] as const;

const copy = {
  de: {
    studyLabel: "Bachelorstudie · 3D-Rekonstruktion",
    duration: "ca. 12 Minuten",
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
    requiredHint: "Bitte beantworten Sie alle sechs Aussagen.",
    saving: "Antworten werden gespeichert …",
    retrySave: "Erneut speichern",
    optional: "optional",
    openQuestion: "Gab es bei der Betrachtung des 3D-Modells visuelle Eigenschaften oder Fehler, die Ihnen besonders aufgefallen sind?",
    openPlaceholder: "Ihre Beobachtungen …",
  },
  en: {
    studyLabel: "Bachelor study · 3D reconstruction",
    duration: "about 12 minutes",
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
    requiredHint: "Please answer all six statements.",
    saving: "Saving responses …",
    retrySave: "Save again",
    optional: "optional",
    openQuestion: "Did you notice any visual properties or errors while viewing the 3D model that particularly stood out?",
    openPlaceholder: "Your observations …",
  },
} as const;

export function getCopy(language: Language) {
  return copy[language];
}
