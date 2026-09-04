import { Component, type ErrorInfo, type ReactNode } from "react";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { loadLanguage, saveLanguage } from "../study/session";
import type { Language } from "../types/study";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; language: Language }> {
  state: { failed: boolean; language: Language } = { failed: false, language: loadLanguage() };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application error", error, info);
  }

  render() {
    if (this.state.failed) {
      const english = this.state.language === "en";
      return (
        <main className="fatal-error">
          <LanguageSwitch language={this.state.language} onChange={(language) => {
            saveLanguage(language);
            this.setState({ language });
          }} />
          <span>FORM&WIRKUNG</span>
          <h1>{english ? "The application could not be loaded." : "Die Anwendung konnte nicht geladen werden."}</h1>
          <p>{english ? "Reload the page. If the error occurs again, contact the study lead." : "Bitte laden Sie die Seite neu. Falls der Fehler erneut auftritt, wenden Sie sich an die Studienleitung."}</p>
          <button type="button" className="button button-primary" onClick={() => window.location.reload()}>{english ? "Reload page" : "Seite neu laden"}</button>
        </main>
      );
    }
    return this.props.children;
  }
}
