import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Patient {
  id: number;
  name: string;
  date_of_birth: string | null;
}

interface Cell {
  dimension: string;
  level: string;
  severity_score: number | null;
  notes: string | null;
  updated_at: string | null;
}

const DIMENSIONS: { key: string; label: string }[] = [
  { key: "cognition", label: "Cognição" },
  { key: "affect", label: "Afeto" },
  { key: "attention", label: "Atenção" },
  { key: "self", label: "Self" },
  { key: "behavior", label: "Comportamento" },
  { key: "motivation", label: "Motivação" },
];

const LEVELS: { key: string; label: string }[] = [
  { key: "variation", label: "Variação" },
  { key: "selection", label: "Seleção" },
  { key: "retention", label: "Retenção" },
];

function scoreColor(score: number | null): string {
  if (!score) return "bg-gray-100 text-gray-400 border-gray-200";
  if (score <= 3) return "bg-green-100 text-green-800 border-green-300";
  if (score <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-red-100 text-red-800 border-red-300";
}

function scoreDotColor(score: number | null): string {
  if (!score) return "";
  if (score <= 3) return "bg-green-500";
  if (score <= 6) return "bg-yellow-500";
  return "bg-red-500";
}

interface PanelState {
  dimension: string;
  level: string;
  score: number;
  notes: string;
  saving: boolean;
  saved: boolean;
}

export default function EEMMForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [panel, setPanel] = useState<PanelState | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [patRes, cellRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/patients/${id}/eemm`),
      ]);
      if (patRes.status === 404) {
        setNotFound(true);
        return;
      }
      const pat = await patRes.json();
      const cls = await cellRes.json();
      setPatient(pat);
      setCells(cls);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  function getCell(dimension: string, level: string): Cell | undefined {
    return cells.find((c) => c.dimension === dimension && c.level === level);
  }

  function openPanel(dimension: string, level: string) {
    const cell = getCell(dimension, level);
    setPanel({
      dimension,
      level,
      score: cell?.severity_score ?? 0,
      notes: cell?.notes ?? "",
      saving: false,
      saved: false,
    });
  }

  const closePanel = useCallback(async () => {
    if (!panel) return;

    if (
      panel.score > 0 ||
      panel.notes.trim() !== (getCell(panel.dimension, panel.level)?.notes ?? "")
    ) {
      await savePanel(panel, true);
    }

    setPanel(null);
  }, [panel, cells]);

  async function savePanel(p: PanelState = panel!, silent = false) {
    if (!p) return;
    if (!silent) setPanel((prev) => prev && { ...prev, saving: true, saved: false });

    try {
      const res = await fetch(`/api/patients/${id}/eemm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dimension: p.dimension,
          level: p.level,
          severity_score: p.score > 0 ? p.score : null,
          notes: p.notes.trim() || null,
        }),
      });
      if (res.ok) {
        const updated: Cell = await res.json();
        setCells((prev) =>
          prev.map((c) =>
            c.dimension === updated.dimension && c.level === updated.level
              ? updated
              : c
          )
        );
        if (!silent)
          setPanel((prev) => prev && { ...prev, saving: false, saved: true });
      }
    } catch {
      if (!silent) setPanel((prev) => prev && { ...prev, saving: false });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Carregando...
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Paciente não encontrado.</p>
        <button
          onClick={() => navigate("/patients")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Voltar à lista
        </button>
      </div>
    );
  }

  const dimLabel = (key: string) =>
    DIMENSIONS.find((d) => d.key === key)?.label ?? key;
  const lvlLabel = (key: string) =>
    LEVELS.find((l) => l.key === key)?.label ?? key;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/patients")}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded"
            title="Voltar à lista"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{patient.name}</h1>
            <p className="text-xs text-gray-400">Formulação EEMM</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="w-36 min-w-36 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dimensão
                </th>
                {LEVELS.map((lv) => (
                  <th
                    key={lv.key}
                    className="bg-gray-50 border-b border-r last:border-r-0 border-gray-200 px-4 py-3 text-center text-xs font-semibold text-gray-600"
                  >
                    {lv.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((dim, di) => (
                <tr
                  key={dim.key}
                  className={di < DIMENSIONS.length - 1 ? "border-b border-gray-100" : ""}
                >
                  <td className="bg-gray-50 border-r border-gray-200 px-4 py-4 font-semibold text-gray-700 text-sm">
                    {dim.label}
                  </td>
                  {LEVELS.map((lv) => {
                    const cell = getCell(dim.key, lv.key);
                    const score = cell?.severity_score ?? null;
                    const isActive =
                      panel?.dimension === dim.key && panel?.level === lv.key;

                    return (
                      <td
                        key={lv.key}
                        onClick={() => openPanel(dim.key, lv.key)}
                        className={`border-r last:border-r-0 border-gray-100 p-2 cursor-pointer transition-colors ${
                          isActive ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`rounded-lg border px-3 py-3 min-h-16 flex flex-col items-center justify-center gap-1 transition-all ${
                            isActive
                              ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                              : scoreColor(score)
                          }`}
                        >
                          {score ? (
                            <>
                              <div
                                className={`w-2 h-2 rounded-full ${scoreDotColor(score)}`}
                              />
                              <span className="text-lg font-bold leading-none">
                                {score}
                              </span>
                              <span className="text-xs opacity-60">/10</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
          <span className="font-medium">Severidade:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-200 border border-green-300 inline-block" />
            1–3 Leve
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-yellow-200 border border-yellow-300 inline-block" />
            4–6 Moderado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-300 inline-block" />
            7–10 Grave
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200 inline-block" />
            Não avaliado
          </span>
        </div>
      </div>

      {/* Painel lateral */}
      {panel && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-20"
            onClick={closePanel}
          />
          <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-30 flex flex-col">
            {/* Painel header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                  {dimLabel(panel.dimension)} — {lvlLabel(panel.level)}
                </p>
                <h2 className="text-base font-semibold text-gray-900">
                  Avaliação de Severidade
                </h2>
              </div>
              <button
                onClick={closePanel}
                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors mt-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Painel body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              {/* Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nível de Severidade
                </label>

                {/* Score display */}
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${
                      panel.score === 0
                        ? "border-gray-200 text-gray-300"
                        : panel.score <= 3
                        ? "border-green-400 text-green-700"
                        : panel.score <= 6
                        ? "border-yellow-400 text-yellow-700"
                        : "border-red-400 text-red-700"
                    }`}
                  >
                    <span className="text-2xl font-bold leading-none">
                      {panel.score === 0 ? "—" : panel.score}
                    </span>
                    {panel.score > 0 && (
                      <span className="text-xs opacity-60">/10</span>
                    )}
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={panel.score}
                  onChange={(e) =>
                    setPanel((prev) =>
                      prev
                        ? { ...prev, score: Number(e.target.value), saved: false }
                        : prev
                    )
                  }
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0 — Não avaliado</span>
                  <span>10 — Máximo</span>
                </div>

                {/* Quick buttons */}
                <div className="grid grid-cols-11 gap-1 mt-3">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setPanel((prev) =>
                          prev ? { ...prev, score: i, saved: false } : prev
                        )
                      }
                      className={`text-xs py-1 rounded font-medium transition-colors ${
                        panel.score === i
                          ? i === 0
                            ? "bg-gray-300 text-gray-700"
                            : i <= 3
                            ? "bg-green-500 text-white"
                            : i <= 6
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>

                {panel.score > 0 && (
                  <p className="text-xs text-center mt-2 font-medium">
                    {panel.score <= 3 ? (
                      <span className="text-green-600">Leve</span>
                    ) : panel.score <= 6 ? (
                      <span className="text-yellow-600">Moderado</span>
                    ) : (
                      <span className="text-red-600">Grave</span>
                    )}
                  </p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Clínicas
                </label>
                <textarea
                  value={panel.notes}
                  onChange={(e) =>
                    setPanel((prev) =>
                      prev
                        ? { ...prev, notes: e.target.value, saved: false }
                        : prev
                    )
                  }
                  rows={6}
                  placeholder="Observações clínicas sobre esta célula..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Painel footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {panel.saved ? (
                  <span className="text-green-600">✓ Salvo</span>
                ) : (
                  "Auto-save ao fechar"
                )}
              </span>
              <button
                onClick={() => savePanel()}
                disabled={panel.saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {panel.saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
