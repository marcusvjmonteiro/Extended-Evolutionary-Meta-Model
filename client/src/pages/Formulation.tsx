import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { System } from "@shared/eemm-types";

interface FormulationBlock {
  system: System;
  systemLabel: string;
  assessed: boolean;
  sentences: string[];
  notAssessedNotice: string | null;
}

interface Formulation {
  patientId: number;
  patientName: string;
  generatedAt: string;
  disclaimer: string;
  blocks: FormulationBlock[];
  summary: {
    totalRecords: number;
    assessedSystems: number;
    totalSystems: number;
  };
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function Formulation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<Formulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/patients/${id}/formulation`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        setData(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Carregando...
      </div>
    );
  }

  if (notFound || !data) {
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(`/patients/${id}/eemm`)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded"
            title="Voltar à matriz"
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
            <h1 className="text-lg font-bold text-gray-900">
              {data.patientName}
            </h1>
            <p className="text-xs text-gray-400">
              Formulação de caso — gerada em {formatDateTime(data.generatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/*
          Aviso de escopo. Peso visual deliberadamente proporcional a sua funcao de
          protecao (HC3): borda de destaque, fundo ambar e corpo de texto legivel —
          nao letra miuda de rodape.
        */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-5 py-4">
          <p className="text-sm font-semibold text-amber-900 mb-2">
            Escopo e limites deste documento
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>

        {/* Contagens — conferencia, nao interpretacao */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 text-sm text-gray-600">
          {data.summary.totalRecords} registro(s) em{" "}
          {data.summary.assessedSystems} de {data.summary.totalSystems}{" "}
          sistemas.
        </div>

        {/* Blocos por sistema, em ordem fixa — a mesma do grid */}
        {data.blocks.map((block) => (
          <section
            key={block.system}
            className="bg-white rounded-xl border border-gray-200 px-5 py-4"
          >
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              {block.systemLabel}
            </h2>

            {block.assessed ? (
              <div className="space-y-2.5">
                {block.sentences.map((sentence, i) => (
                  <p
                    key={i}
                    className="text-sm text-gray-700 leading-relaxed"
                  >
                    {sentence}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic leading-relaxed">
                {block.notAssessedNotice}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
