import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DIMENSIONS,
  ADDITIONAL_LEVELS,
  OPERATORS,
  VALENCES,
  SYSTEM_LABELS,
  OPERATOR_LABELS,
  VALENCE_LABELS,
  SYSTEM_GROUP_LABELS,
} from "@shared/eemm-types";
import type { System, Operator, Valence } from "@shared/eemm-types";
import type { ChangeProcess, ProcessValence } from "@shared/eemm-processes";

interface Patient {
  id: number;
  name: string;
  date_of_birth: string | null;
}

/** Resposta de GET /api/eemm/processes — buscada uma vez na montagem da página. */
interface ProcessesResponse {
  processes: Record<System, ChangeProcess[]>;
  processValenceLabels: Record<ProcessValence, string>;
  valenceDefinitions: Record<Valence, string>;
}

interface Cell {
  system: System;
  operator: Operator;
  valence: Valence;
  severity_score: number | null;
  notes: string | null;
  updated_at: string | null;
}

interface ValenceDraft {
  score: number;
  notes: string;
  saving: boolean;
  saved: boolean;
}

interface PanelState {
  system: System;
  operator: Operator;
  drafts: Record<Valence, ValenceDraft>;
}

/**
 * Grupos de linhas da matriz. Existem apenas para espelhar visualmente as chaves
 * "Dimensions" / "Levels" da Figura 1 de Hayes et al. (2020) — as oito linhas são,
 * estruturalmente, irmãs do MESMO eixo. Nenhum cruzamento é produzido aqui.
 */
const SYSTEM_GROUPS: { label: string; systems: readonly System[] }[] = [
  { label: SYSTEM_GROUP_LABELS.dimensions, systems: DIMENSIONS },
  { label: SYSTEM_GROUP_LABELS.additionalLevels, systems: ADDITIONAL_LEVELS },
];

/**
 * Codificação visual da célula bivalente:
 *   - MATIZ  indica a valência  (verde = adaptativo, vermelho = desadaptativo)
 *   - SATURAÇÃO indica o escore (mais escuro = escore mais alto)
 *   - Metade tracejada e cinza = valência ainda não registrada
 *
 * Assim, uma célula com só o adaptativo preenchido, só o desadaptativo, ambos ou
 * nenhum é sempre distinguível à primeira vista, sem que a cor confunda "grave"
 * com "desadaptativo" — que são eixos independentes no metamodelo.
 */
function halfClass(valence: Valence, score: number | null): string {
  if (score === null || score === 0) {
    return "bg-gray-50 border-dashed border-gray-200 text-gray-300";
  }
  if (valence === "adaptive") {
    if (score <= 3) return "bg-emerald-50 border-emerald-300 text-emerald-700";
    if (score <= 6) return "bg-emerald-100 border-emerald-400 text-emerald-800";
    return "bg-emerald-200 border-emerald-500 text-emerald-900";
  }
  if (score <= 3) return "bg-rose-50 border-rose-300 text-rose-700";
  if (score <= 6) return "bg-rose-100 border-rose-400 text-rose-800";
  return "bg-rose-200 border-rose-500 text-rose-900";
}

const VALENCE_ACCENT: Record<
  Valence,
  { dot: string; button: string; label: string; ring: string }
> = {
  adaptive: {
    dot: "bg-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700",
    label: "text-emerald-700",
    ring: "border-emerald-400 text-emerald-700",
  },
  maladaptive: {
    dot: "bg-rose-500",
    button: "bg-rose-600 hover:bg-rose-700",
    label: "text-rose-700",
    ring: "border-rose-400 text-rose-700",
  },
};

const VALENCE_SHORT: Record<Valence, string> = {
  adaptive: "A",
  maladaptive: "D",
};

export default function EEMMForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [processData, setProcessData] = useState<ProcessesResponse | null>(null);
  // Ajuda contextual aberta, por valência — cada seção do painel controla a sua.
  const [helpOpen, setHelpOpen] = useState<Record<Valence, boolean>>({
    adaptive: false,
    maladaptive: false,
  });

  async function loadData() {
    setLoading(true);
    try {
      const [patRes, cellRes, procRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/patients/${id}/eemm`),
        fetch(`/api/eemm/processes`),
      ]);
      if (patRes.status === 404) {
        setNotFound(true);
        return;
      }
      const pat = await patRes.json();
      const cls = await cellRes.json();
      setPatient(pat);
      setCells(cls);
      if (procRes.ok) setProcessData(await procRes.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  function getCell(
    system: System,
    operator: Operator,
    valence: Valence
  ): Cell | undefined {
    return cells.find(
      (c) =>
        c.system === system &&
        c.operator === operator &&
        c.valence === valence
    );
  }

  function openPanel(system: System, operator: Operator) {
    const drafts = {} as Record<Valence, ValenceDraft>;
    for (const valence of VALENCES) {
      const cell = getCell(system, operator, valence);
      drafts[valence] = {
        score: cell?.severity_score ?? 0,
        notes: cell?.notes ?? "",
        saving: false,
        saved: false,
      };
    }
    setPanel({ system, operator, drafts });
    setHelpOpen({ adaptive: false, maladaptive: false });
  }

  function updateDraft(valence: Valence, patch: Partial<ValenceDraft>) {
    setPanel((prev) =>
      prev
        ? {
            ...prev,
            drafts: {
              ...prev.drafts,
              [valence]: { ...prev.drafts[valence], ...patch },
            },
          }
        : prev
    );
  }

  /**
   * Salva UMA valência por vez. O registro adaptativo e o desadaptativo da mesma
   * célula são linhas independentes no banco, então cada um tem seu próprio PUT.
   */
  async function saveValence(p: PanelState, valence: Valence, silent = false) {
    const draft = p.drafts[valence];
    if (!silent) updateDraft(valence, { saving: true, saved: false });

    try {
      const res = await fetch(`/api/patients/${id}/eemm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: p.system,
          operator: p.operator,
          valence,
          severity_score: draft.score > 0 ? draft.score : null,
          notes: draft.notes.trim() || null,
        }),
      });
      if (res.ok) {
        const updated: Cell = await res.json();
        setCells((prev) =>
          prev.map((c) =>
            c.system === updated.system &&
            c.operator === updated.operator &&
            c.valence === updated.valence
              ? updated
              : c
          )
        );
        if (!silent) updateDraft(valence, { saving: false, saved: true });
      } else if (!silent) {
        updateDraft(valence, { saving: false });
      }
    } catch {
      if (!silent) updateDraft(valence, { saving: false });
    }
  }

  function isDirty(p: PanelState, valence: Valence): boolean {
    const cell = getCell(p.system, p.operator, valence);
    const draft = p.drafts[valence];
    return (
      draft.score !== (cell?.severity_score ?? 0) ||
      draft.notes.trim() !== (cell?.notes ?? "")
    );
  }

  // Autosave ao fechar — por valência, não pela célula inteira.
  const closePanel = useCallback(async () => {
    if (!panel) return;
    for (const valence of VALENCES) {
      if (isDirty(panel, valence)) {
        await saveValence(panel, valence, true);
      }
    }
    setPanel(null);
  }, [panel, cells]);

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
            <p className="text-xs text-gray-400">
              Formulação EEMM — sistema × operador evolucionário × valência
            </p>
          </div>
          {/* Transparencia de retencao (T8): fica no cabecalho, visivel durante
              todo o fluxo de registro — nao atras de um menu. O avaliador precisa
              conseguir localizar a informacao no momento em que ela lhe ocorre,
              que e enquanto esta inserindo conteudo, nao depois. */}
          <button
            onClick={() => navigate("/privacidade")}
            className="ml-auto text-sm font-medium text-gray-500 hover:text-blue-600 hover:underline transition-colors"
          >
            Privacidade e Retenção de Dados
          </button>
          <button
            onClick={() => navigate(`/patients/${id}/formulation`)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Gerar Formulação Final
          </button>
        </div>
      </div>

      {/* Grid 8 sistemas × 4 operadores, cada célula bivalente */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="w-48 min-w-48 bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Sistema
                </th>
                {OPERATORS.map((operator) => (
                  <th
                    key={operator}
                    className="bg-gray-50 border-b border-r last:border-r-0 border-gray-200 px-3 py-3 text-center text-xs font-semibold text-gray-600"
                  >
                    {OPERATOR_LABELS[operator]}
                  </th>
                ))}
              </tr>
            </thead>
            {/*
              Um <tbody> por grupo, com uma linha de cabeçalho de seção. O
              agrupamento é apenas visual (HU2 — correspondência com o raciocínio
              clínico e com as chaves da Figura 1); as oito linhas pertencem ao
              mesmo eixo.
            */}
            {SYSTEM_GROUPS.map((group) => (
              <tbody key={group.label}>
                <tr>
                  <td
                    colSpan={OPERATORS.length + 1}
                    className="bg-slate-100 border-y border-slate-200 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.systems.map((system, si) => (
                  <tr
                    key={system}
                    className={
                      si < group.systems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }
                  >
                    <td className="bg-gray-50 border-r border-gray-200 px-4 py-4 font-semibold text-gray-700 text-sm">
                      {SYSTEM_LABELS[system]}
                    </td>
                    {OPERATORS.map((operator) => {
                      const isActive =
                        panel?.system === system && panel?.operator === operator;

                      return (
                        <td
                          key={operator}
                          onClick={() => openPanel(system, operator)}
                          className={`border-r last:border-r-0 border-gray-100 p-2 cursor-pointer transition-colors ${
                            isActive ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`flex gap-1 rounded-lg p-1 ${
                              isActive ? "ring-2 ring-blue-300" : ""
                            }`}
                          >
                            {VALENCES.map((valence) => {
                              const score =
                                getCell(system, operator, valence)
                                  ?.severity_score ?? null;
                              return (
                                <div
                                  key={valence}
                                  title={`${SYSTEM_LABELS[system]} × ${
                                    OPERATOR_LABELS[operator]
                                  } — ${VALENCE_LABELS[valence]}: ${
                                    score ?? "não registrado"
                                  }`}
                                  className={`flex-1 rounded-md border px-2 py-2 min-h-14 flex flex-col items-center justify-center gap-0.5 transition-all ${halfClass(
                                    valence,
                                    score
                                  )}`}
                                >
                                  <span className="text-[10px] font-bold uppercase opacity-70 leading-none">
                                    {VALENCE_SHORT[valence]}
                                  </span>
                                  {score ? (
                                    <span className="text-base font-bold leading-none">
                                      {score}
                                    </span>
                                  ) : (
                                    <span className="text-xs leading-none">
                                      —
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        {/* Legenda */}
        <div className="mt-4 space-y-2 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-medium">Valência (matiz):</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-400 inline-block" />
              A — Adaptativo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-200 border border-rose-400 inline-block" />
              D — Desadaptativo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gray-50 border border-dashed border-gray-300 inline-block" />
              Não registrado
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-medium">Escore (saturação):</span>
            <span>1–3 mais claro</span>
            <span>4–6 intermediário</span>
            <span>7–10 mais escuro</span>
          </div>
          <p className="pt-1 leading-relaxed">
            Os oito sistemas formam um eixo único: "Dimensões" e "Níveis Adicionais"
            são apenas agrupamentos de leitura, não um cruzamento entre si.
          </p>
        </div>
      </div>

      {/* Painel lateral — as duas valências da mesma célula, lado a lado */}
      {panel && (
        <>
          <div className="fixed inset-0 bg-black/20 z-20" onClick={closePanel} />
          <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-30 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                  {SYSTEM_LABELS[panel.system]} —{" "}
                  {OPERATOR_LABELS[panel.operator]}
                </p>
                <h2 className="text-base font-semibold text-gray-900">
                  Processos adaptativos e desadaptativos
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

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {VALENCES.map((valence) => {
                const draft = panel.drafts[valence];
                const accent = VALENCE_ACCENT[valence];

                return (
                  <section
                    key={valence}
                    className="border border-gray-200 rounded-xl p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-semibold flex items-center gap-2 ${accent.label}`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${accent.dot}`}
                          />
                          {VALENCE_LABELS[valence]}
                        </h3>
                        {/* Ajuda no ponto de uso (HU10): abre dentro do proprio
                            painel de edicao, sem tirar o profissional do fluxo. */}
                        <button
                          type="button"
                          aria-expanded={helpOpen[valence]}
                          onClick={() =>
                            setHelpOpen((prev) => ({
                              ...prev,
                              [valence]: !prev[valence],
                            }))
                          }
                          title={`O que registrar como ${VALENCE_LABELS[
                            valence
                          ].toLowerCase()} neste sistema`}
                          className="w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-xs font-bold leading-none hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          ?
                        </button>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                          draft.score === 0
                            ? "border-gray-200 text-gray-300"
                            : accent.ring
                        }`}
                      >
                        <span className="text-base font-bold leading-none">
                          {draft.score === 0 ? "—" : draft.score}
                        </span>
                      </div>
                    </div>

                    {/* Conteudo da ajuda contextual — renderizado em CADA secao e
                        sempre referido explicitamente a valencia da secao, para
                        nao ficar ambiguo sobre qual metade da celula ele cobre.
                        Os processos vem indexados por SISTEMA: uma celula de
                        Biofisiologico ou Sociocultural mostra processos proprios
                        desse sistema, nao processos psicologicos reaproveitados. */}
                    {helpOpen[valence] && (
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-3 text-xs">
                        <div>
                          <p className={`font-semibold mb-1 ${accent.label}`}>
                            O que conta como {VALENCE_LABELS[valence].toLowerCase()}
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            {processData?.valenceDefinitions[valence] ??
                              "Definição indisponível."}
                          </p>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700 mb-1.5">
                            Processos de mudança — {SYSTEM_LABELS[panel.system]}
                          </p>
                          {processData ? (
                            <ul className="space-y-2">
                              {processData.processes[panel.system].map((proc) => (
                                <li key={proc.name} className="leading-relaxed">
                                  <span className="font-medium text-gray-800">
                                    {proc.name}
                                  </span>
                                  <span className="text-gray-400">
                                    {" "}
                                    ({processData.processValenceLabels[
                                      proc.typicalValence
                                    ] ?? proc.typicalValence})
                                  </span>
                                  <br />
                                  <span className="text-gray-600">
                                    {proc.description}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400">
                              Referências de processos indisponíveis.
                            </p>
                          )}
                          <p className="text-gray-400 mt-2 leading-relaxed">
                            Lista de referência. A valência indicada é a associação
                            típica na literatura, não uma classificação do caso — o
                            registro da valência nesta célula é seu.
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Nível de Severidade
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={draft.score}
                        onChange={(e) =>
                          updateDraft(valence, {
                            score: Number(e.target.value),
                            saved: false,
                          })
                        }
                        className="w-full accent-blue-600"
                      />
                      <div className="grid grid-cols-11 gap-1 mt-2">
                        {Array.from({ length: 11 }, (_, i) => (
                          <button
                            key={i}
                            onClick={() =>
                              updateDraft(valence, { score: i, saved: false })
                            }
                            className={`text-xs py-1 rounded font-medium transition-colors ${
                              draft.score === i
                                ? i === 0
                                  ? "bg-gray-300 text-gray-700"
                                  : `${accent.button} text-white`
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>0 — Não registrado</span>
                        <span>10 — Máximo</span>
                      </div>
                    </div>

                    {/*
                      Campo de caracterização processual (atributo A4, Sec. 4.8.4).
                      O rótulo e o texto de apoio NÃO são cosméticos: é o que torna
                      A4 verificável na prática. Sem eles, o campo lê como "notas
                      genéricas" e o atributo fica presente em teoria e vazio no uso.
                    */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Caracterização processual —{" "}
                        {OPERATOR_LABELS[panel.operator]}
                      </label>
                      <p className="text-[11px] text-gray-400 mb-1.5 leading-relaxed">
                        Descreva como este processo se manifesta em termos de{" "}
                        <span className="font-medium text-gray-500">
                          {OPERATOR_LABELS[panel.operator].toLowerCase()}
                        </span>{" "}
                        para o sistema{" "}
                        <span className="font-medium text-gray-500">
                          {SYSTEM_LABELS[panel.system].toLowerCase()}
                        </span>{" "}
                        — esta caracterização é o que sustenta a fidelidade do
                        artefato ao modelo teórico.
                      </p>
                      <textarea
                        value={draft.notes}
                        onChange={(e) =>
                          updateDraft(valence, {
                            notes: e.target.value,
                            saved: false,
                          })
                        }
                        rows={3}
                        placeholder={`Como a ${OPERATOR_LABELS[
                          panel.operator
                        ].toLowerCase()} se manifesta neste processo ${VALENCE_LABELS[
                          valence
                        ].toLowerCase()}...`}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {draft.saved ? (
                          <span className="text-green-600">✓ Salvo</span>
                        ) : (
                          "Auto-save ao fechar"
                        )}
                      </span>
                      <button
                        onClick={() => saveValence(panel, valence)}
                        disabled={draft.saving}
                        className={`${accent.button} disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors`}
                      >
                        {draft.saving ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
