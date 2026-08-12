import db from "../database";
import {
  SYSTEMS,
  OPERATORS,
  VALENCES,
  SYSTEM_LABELS,
  OPERATOR_LABELS,
  VALENCE_LABELS,
} from "@shared/eemm-types";
import type { System, Operator, Valence } from "@shared/eemm-types";

/**
 * Geração da formulação final (Tarefa T7 do Apêndice C).
 *
 * ============================================================================
 * RESTRIÇÃO DE SEGURANÇA CLÍNICA — heurística HC3
 * ============================================================================
 * Este módulo faz COMPOSIÇÃO TEMPLATE-BASED determinística dos dados que o próprio
 * profissional inseriu. Não faz síntese, não infere e não interpreta.
 *
 * Regras que qualquer alteração futura deste arquivo precisa preservar:
 *
 *  1. NENHUMA inferência causal. As sentenças descrevem uma célula por vez. Não há,
 *     e não pode haver, conectivo que ligue duas células, dois sistemas ou dois
 *     operadores ("o que leva a", "em consequência", "isso explica", "associado a").
 *  2. NENHUMA sugestão de conduta. Nenhuma recomendação de técnica, intervenção,
 *     encaminhamento ou próximo passo clínico.
 *  3. NENHUMA linguagem diagnóstica. Nenhum nome de transtorno, nenhuma construção
 *     do tipo "indica / sugere / é compatível com / é consistente com".
 *  4. Notas do avaliador são reproduzidas VERBATIM, entre aspas. Nunca parafraseadas,
 *     resumidas ou reescritas — parafrasear é interpretar.
 *  5. NENHUM modelo de linguagem generativo pode ser introduzido aqui para "melhorar
 *     a fluidez". Um LLM infere e sintetiza por natureza, mesmo instruído a não
 *     fazê-lo, e reintroduziria exatamente o risco que HC3 existe para prevenir.
 *     A implementação correta é interpolação de string determinística.
 *
 * A regra 1 fica MAIS exigente com o eixo de operadores evolucionários do que era
 * com o eixo de níveis: "retenção" e "seleção" são termos que convidam a prosa
 * causal ("retido POR alívio imediato", "selecionado PORQUE..."). Essa causalidade,
 * quando existir, tem de vir da nota verbatim do avaliador — nunca do template.
 */

/**
 * Aviso de cabeçalho. Parte da correção de HC3, não adorno: delimita explicitamente
 * o que o documento é e o que ele não é. Não é configurável nem removível — é
 * constante do módulo e sempre incluído na resposta.
 */
export const FORMULATION_DISCLAIMER =
  "Este documento é uma compilação estruturada dos dados inseridos pelo profissional " +
  "responsável, organizados segundo o Extended Evolutionary Meta-Model. Não constitui " +
  "diagnóstico, não sugere conduta terapêutica, e não deve ser interpretado como " +
  "inferência causal entre os processos registrados. A interpretação clínica é de " +
  "responsabilidade exclusiva do profissional que o gerou.";

export interface FormulationBlock {
  system: System;
  systemLabel: string;
  /** Falso quando nenhuma célula do sistema tem escore ou nota. */
  assessed: boolean;
  /** Uma sentença autocontida por célula preenchida. Vazio se `assessed` é falso. */
  sentences: string[];
  /** Texto exibido quando o sistema não foi avaliado. */
  notAssessedNotice: string | null;
}

export interface Formulation {
  patientId: number;
  patientName: string;
  generatedAt: string;
  disclaimer: string;
  blocks: FormulationBlock[];
  /** Contagens para conferência rápida; não são interpretação. */
  summary: {
    totalRecords: number;
    assessedSystems: number;
    totalSystems: number;
  };
}

interface CellRow {
  system: System;
  operator: Operator;
  valence: Valence;
  severity_score: number | null;
  notes: string | null;
}

const NOT_ASSESSED_NOTICE =
  "Sistema não avaliado nesta sessão. A ausência de registro não equivale a ausência " +
  "de processo: significa apenas que nenhum dado foi inserido para este sistema.";

/**
 * Compõe a sentença de UMA célula. Cada sentença é autocontida e não faz referência
 * a nenhuma outra célula — é essa propriedade que garante a regra 1 acima.
 */
function composeSentence(cell: CellRow): string {
  const system = SYSTEM_LABELS[cell.system];
  const operator = OPERATOR_LABELS[cell.operator];
  const valence = VALENCE_LABELS[cell.valence].toLowerCase();

  const severity =
    cell.severity_score !== null
      ? `com severidade ${cell.severity_score}/10`
      : "sem escore de severidade atribuído";

  let sentence = `No sistema ${system}, quanto ao operador de ${operator}, foi registrado processo ${valence} ${severity}.`;

  if (cell.notes !== null && cell.notes.trim() !== "") {
    // Verbatim, entre aspas. Sem paráfrase (regra 4).
    sentence += ` Caracterização do avaliador: "${cell.notes.trim()}"`;
    if (!sentence.endsWith(".")) sentence += ".";
  }

  return sentence;
}

export function generateFormulation(patientId: number): Formulation | null {
  const patient = db
    .prepare("SELECT id, name FROM patients WHERE id = ?")
    .get(patientId) as { id: number; name: string } | undefined;

  if (!patient) return null;

  const rows = db
    .prepare(
      `SELECT system, operator, valence, severity_score, notes
       FROM eemm_cells
       WHERE patient_id = ?`
    )
    .all(patientId) as CellRow[];

  // Só conta como preenchida a célula que tem escore OU nota.
  const filled = rows.filter(
    (r) =>
      r.severity_score !== null || (r.notes !== null && r.notes.trim() !== "")
  );

  const blocks: FormulationBlock[] = SYSTEMS.map((system) => {
    // Ordem fixa e previsível: operador, depois valência. A mesma ordem do grid.
    const cells = filled
      .filter((c) => c.system === system)
      .sort(
        (a, b) =>
          OPERATORS.indexOf(a.operator) - OPERATORS.indexOf(b.operator) ||
          VALENCES.indexOf(a.valence) - VALENCES.indexOf(b.valence)
      );

    const assessed = cells.length > 0;

    return {
      system,
      systemLabel: SYSTEM_LABELS[system],
      assessed,
      sentences: cells.map(composeSentence),
      // Sistemas sem registro são declarados, nunca omitidos em silêncio: o leitor
      // precisa conseguir distinguir "não avaliado" de "avaliado e sem alteração".
      notAssessedNotice: assessed ? null : NOT_ASSESSED_NOTICE,
    };
  });

  return {
    patientId: patient.id,
    patientName: patient.name,
    generatedAt: new Date().toISOString(),
    disclaimer: FORMULATION_DISCLAIMER,
    blocks,
    summary: {
      totalRecords: filled.length,
      assessedSystems: blocks.filter((b) => b.assessed).length,
      totalSystems: SYSTEMS.length,
    },
  };
}
