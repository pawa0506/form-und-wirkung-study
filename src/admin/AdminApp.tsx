import {
  BarChart3,
  CheckCircle2,
  Download,
  Filter,
  LogOut,
  RefreshCw,
  Shield,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { internalVariantLabelByModel } from "../config/stimuli";
import { downloadCsv } from "../lib/csv";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  fetchAdminData,
  getAdminSession,
  signInAdmin,
  signOutAdmin,
} from "../lib/study-data";
import { summarizeModels, summarizeResponses } from "../lib/statistics";
import type { ParticipantRow, TrialResponseRow } from "../types/study";

const itemLabels: Record<string, string> = {
  item_geometry: "Geometrische Stimmigkeit",
  item_color: "Farbtreue",
  item_surface: "Oberfläche / Textur",
  item_detail: "Detailtreue",
  item_artifacts: "Visuelle Artefakte",
  item_overall: "Globale Übereinstimmung",
};

function internalMethod(row: Pick<TrialResponseRow, "sculpture_id" | "hidden_variant_id">): string {
  return internalVariantLabelByModel.get(`${row.sculpture_id}::${row.hidden_variant_id}`) ?? "Unbekannt";
}

function formatNumber(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function participantCsvRows(participants: ParticipantRow[]): Record<string, unknown>[] {
  return participants.map((participant) => ({
    participant_uuid: participant.id,
    consented: participant.consented,
    device_type: participant.device_type,
    started_at: participant.started_at,
    completed: participant.completed,
    completed_at: participant.completed_at,
    randomized_sequence: participant.randomized_sequence,
  }));
}

function responseCsvRows(responses: TrialResponseRow[]): Record<string, unknown>[] {
  return responses.map((response) => ({
    participant_uuid: response.participant_id,
    trial_index: response.trial_index,
    trial_number: response.trial_index + 1,
    sculpture_id: response.sculpture_id,
    hidden_variant_id: response.hidden_variant_id,
    reconstruction_method_internal: internalMethod(response),
    asset_type: response.asset_type,
    renderer_type: response.renderer_type,
    reference_image_path: response.reference_image_path,
    device_type: response.participants?.device_type ?? "",
    participant_completed: response.participants?.completed ?? false,
    item_geometry: response.item_geometry,
    item_color: response.item_color,
    item_surface: response.item_surface,
    item_detail: response.item_detail,
    item_artifacts: response.item_artifacts,
    item_overall: response.item_overall,
    open_visual_observations: response.open_visual_observations,
    trial_started_at: response.trial_started_at,
    trial_submitted_at: response.trial_submitted_at,
    trial_duration_ms: response.trial_duration_ms,
  }));
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInAdmin(email, password);
      onSuccess();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Anmeldung fehlgeschlagen.");
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-page">
      <main className="admin-login-card">
        <div className="admin-logo"><Shield size={22} />FORM&WIRKUNG</div>
        <span className="eyebrow">Geschützter Bereich</span>
        <h1>Studienadministration</h1>
        <p>Melden Sie sich mit einem in Supabase als Administrator markierten Konto an.</p>
        {!isSupabaseConfigured && (
          <div className="admin-config-warning">Supabase ist noch nicht konfiguriert. Hinterlegen Sie zuerst die Umgebungsvariablen.</div>
        )}
        <form onSubmit={submit}>
          <label>E-Mail-Adresse<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Passwort<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={busy || !isSupabaseConfigured}>{busy ? "Anmeldung läuft …" : "Anmelden"}</button>
        </form>
        <a href="#/">Zur Teilnehmeransicht</a>
      </main>
    </div>
  );
}

export function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [responses, setResponses] = useState<TrialResponseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sculptureFilter, setSculptureFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [completionFilter, setCompletionFilter] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminData();
      setParticipants(data.participants);
      setResponses(data.responses);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminSession().then((isAdmin) => {
      setAuthenticated(isAdmin);
      if (isAdmin) void load();
    });
  }, []);

  const filteredResponses = useMemo(() => responses.filter((response) => {
    const participant = response.participants;
    return (!sculptureFilter || response.sculpture_id === sculptureFilter)
      && (!variantFilter || response.hidden_variant_id === variantFilter)
      && (!deviceFilter || participant?.device_type === deviceFilter)
      && (!completionFilter || String(participant?.completed) === completionFilter);
  }), [responses, sculptureFilter, variantFilter, deviceFilter, completionFilter]);

  const summaries = useMemo(() => summarizeResponses(filteredResponses), [filteredResponses]);
  const modelSummaries = useMemo(() => summarizeModels(filteredResponses), [filteredResponses]);
  const openResponses = useMemo(
    () => filteredResponses.filter((response) => response.open_visual_observations?.trim()),
    [filteredResponses],
  );
  const sculptures = [...new Set(responses.map((response) => response.sculpture_id))].sort();
  const variants = [...new Set(responses.map((response) => response.hidden_variant_id))].sort();
  const completedCount = participants.filter((participant) => participant.completed).length;

  if (authenticated === null) return <div className="admin-loading"><RefreshCw className="spin" />Zugriff wird geprüft …</div>;
  if (!authenticated) return <AdminLogin onSuccess={() => { setAuthenticated(true); void load(); }} />;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div><span className="admin-logo"><Shield size={20} />FORM&WIRKUNG</span><span>Studienadministration</span></div>
        <div><button type="button" className="button button-ghost" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""} />Aktualisieren</button><button type="button" className="button button-ghost" onClick={async () => { await signOutAdmin(); setAuthenticated(false); }}><LogOut size={16} />Abmelden</button></div>
      </header>
      <main className="admin-main">
        <div className="admin-title"><div><span className="eyebrow">Live-Auswertung</span><h1>Studienübersicht</h1><p>Aggregierte Kennzahlen und einzelne, anonymisierte Bewertungen.</p></div><span>Stand {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}</span></div>
        {error && <div className="admin-error" role="alert">{error}</div>}

        <section className="metric-grid" aria-label="Teilnehmerzahlen">
          <article><Users /><div><span>Gestartet</span><strong>{participants.length}</strong></div></article>
          <article><CheckCircle2 /><div><span>Abgeschlossen</span><strong>{completedCount}</strong></div></article>
          <article><UserX /><div><span>Unvollständig</span><strong>{participants.length - completedCount}</strong></div></article>
          <article><BarChart3 /><div><span>Bewertungen</span><strong>{responses.length}</strong></div></article>
        </section>

        <section className="admin-section filter-section">
          <div className="section-heading"><div><Filter size={18} /><h2>Filter</h2></div><button type="button" className="text-button" onClick={() => { setSculptureFilter(""); setVariantFilter(""); setDeviceFilter(""); setCompletionFilter(""); }}>Zurücksetzen</button></div>
          <div className="filter-grid">
            <label>Skulptur<select value={sculptureFilter} onChange={(event) => setSculptureFilter(event.target.value)}><option value="">Alle</option>{sculptures.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>Interne Variante<select value={variantFilter} onChange={(event) => setVariantFilter(event.target.value)}><option value="">Alle</option>{variants.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>Gerät<select value={deviceFilter} onChange={(event) => setDeviceFilter(event.target.value)}><option value="">Alle</option><option value="desktop">Desktop</option><option value="tablet">Tablet</option><option value="mobile">Mobil</option></select></label>
            <label>Abschlussstatus<select value={completionFilter} onChange={(event) => setCompletionFilter(event.target.value)}><option value="">Alle</option><option value="true">Abgeschlossen</option><option value="false">Unvollständig</option></select></label>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading"><div><BarChart3 size={18} /><h2>Statistik nach Aussage</h2></div><span>{filteredResponses.length} Bewertungen im Filter</span></div>
          <div className="summary-grid">
            {summaries.map((summary) => <article key={summary.field}><span>{itemLabels[summary.field]}</span><div><strong>{formatNumber(summary.mean)}</strong><small>Mittelwert</small></div><div><strong>{formatNumber(summary.median)}</strong><small>Median</small></div><i>n = {summary.count}</i></article>)}
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading"><div><BarChart3 size={18} /><h2>Modelle und Varianten</h2></div></div>
          <div className="table-scroll">
            <table><thead><tr><th>Skulptur</th><th>Variante</th><th>Methode (intern)</th><th>n</th><th>Mittelwert Gesamtitem</th><th>Median Gesamtitem</th></tr></thead><tbody>{modelSummaries.length ? modelSummaries.map((row) => <tr key={`${row.sculptureId}-${row.variantId}`}><td>{row.sculptureId}</td><td><code>{row.variantId}</code></td><td>{internalVariantLabelByModel.get(`${row.sculptureId}::${row.variantId}`) ?? "Unbekannt"}</td><td>{row.count}</td><td>{formatNumber(row.meanOverall)}</td><td>{formatNumber(row.medianOverall)}</td></tr>) : <tr><td colSpan={6}>Keine Daten für diesen Filter.</td></tr>}</tbody></table>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading"><div><Users size={18} /><h2>Offene Antworten</h2></div><span>{openResponses.length} Antworten im Filter</span></div>
          <div className="open-response-list">
            {openResponses.length ? openResponses.map((row) => (
              <article key={`open-${row.id ?? `${row.participant_id}-${row.trial_index}`}`}>
                <div><strong>{row.sculpture_id} · {row.hidden_variant_id}</strong><span>{internalMethod(row)} · Modell {row.trial_index + 1} · {formatDate(row.trial_submitted_at)}</span></div>
                <p>{row.open_visual_observations}</p>
              </article>
            )) : <p className="empty-state">Keine offenen Antworten für diesen Filter.</p>}
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading"><div><Users size={18} /><h2>Rohdaten</h2></div><div className="export-actions"><button type="button" className="button button-secondary" disabled={!participants.length} onClick={() => downloadCsv("participants.csv", participantCsvRows(participants))}><Download size={16} />Teilnehmende CSV</button><button type="button" className="button button-primary" disabled={!responses.length} onClick={() => downloadCsv("trial-responses.csv", responseCsvRows(responses))}><Download size={16} />Antworten CSV</button></div></div>
          <div className="table-scroll raw-table">
            <table><thead><tr><th>Zeitpunkt</th><th>Teilnehmer-UUID</th><th>Index</th><th>Skulptur</th><th>Variante</th><th>Methode (intern)</th><th>Gerät</th><th>Geometrie</th><th>Farbe</th><th>Oberfläche</th><th>Details</th><th>Artefakte</th><th>Gesamt</th><th>Dauer</th><th>Freitext</th></tr></thead><tbody>{filteredResponses.length ? filteredResponses.map((row) => <tr key={row.id ?? `${row.participant_id}-${row.trial_index}`}><td>{formatDate(row.trial_submitted_at)}</td><td><code>{row.participant_id}</code></td><td>{row.trial_index + 1}</td><td>{row.sculpture_id}</td><td><code>{row.hidden_variant_id}</code></td><td>{internalMethod(row)}</td><td>{row.participants?.device_type ?? "—"}</td><td>{row.item_geometry}</td><td>{row.item_color}</td><td>{row.item_surface}</td><td>{row.item_detail}</td><td>{row.item_artifacts}</td><td>{row.item_overall}</td><td>{Math.round(row.trial_duration_ms / 1000)} s</td><td className="open-cell">{row.open_visual_observations ?? "—"}</td></tr>) : <tr><td colSpan={15}>Keine Rohdaten für diesen Filter.</td></tr>}</tbody></table>
          </div>
        </section>
      </main>
    </div>
  );
}
