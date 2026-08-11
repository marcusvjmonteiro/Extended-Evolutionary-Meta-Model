/**
 * Fonte única de verdade da arquitetura do EEMM (Extended Evolutionary Meta-Model).
 *
 * Este arquivo é consumido tanto pelo backend (`server/`) quanto pelo frontend
 * (`client/`) via alias de projeto `@shared/*`. Nenhum dos dois pode redeclarar
 * localmente dimensões, níveis ou valências — foi exatamente essa duplicação que
 * permitiu, no histórico do projeto, que uma cópia do artefato divergisse da outra
 * sem que o compilador acusasse.
 *
 * Referência teórica: Hayes et al. (2020, 2022). Os três níveis de análise são
 * exatamente biofisiológico, psicológico e sociocultural — não admitem sinônimo
 * vindo de outra tradição teórica.
 */

export const DIMENSIONS = [
  "affect",
  "cognition",
  "attention",
  "self",
  "motivation",
  "behavior",
] as const;

export const LEVELS = [
  "biophysiological",
  "psychological",
  "sociocultural",
] as const;

export const VALENCES = ["adaptive", "maladaptive"] as const;

export type Dimension = (typeof DIMENSIONS)[number];
export type Level = (typeof LEVELS)[number];
export type Valence = (typeof VALENCES)[number];

// Rótulos em português para uso na UI — mantidos aqui para não haver segunda fonte
// de verdade divergente entre server e client
export const DIMENSION_LABELS: Record<Dimension, string> = {
  affect: "Afeto",
  cognition: "Cognição",
  attention: "Atenção",
  self: "Self",
  motivation: "Motivação",
  behavior: "Comportamento Manifesto",
};

export const LEVEL_LABELS: Record<Level, string> = {
  biophysiological: "Biofisiológico",
  psychological: "Psicológico",
  sociocultural: "Sociocultural",
};

export const VALENCE_LABELS: Record<Valence, string> = {
  adaptive: "Adaptativo",
  maladaptive: "Desadaptativo",
};

/**
 * Número de registros que uma formulação completa admite:
 * 6 dimensões × 3 níveis × 2 valências = 36.
 * (A matriz de conformidade do TCC tem 18 células; cada célula é bivalente.)
 */
export const TOTAL_CELLS = DIMENSIONS.length * LEVELS.length;
export const TOTAL_RECORDS = TOTAL_CELLS * VALENCES.length;
