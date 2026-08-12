/**
 * Fonte única de verdade da arquitetura do EEMM (Extended Evolutionary Meta-Model).
 *
 * Este arquivo é consumido tanto pelo backend (`server/`) quanto pelo frontend
 * (`client/`) via alias de projeto `@shared/*`. Nenhum dos dois pode redeclarar
 * localmente sistemas, operadores ou valências — foi exatamente essa duplicação que
 * permitiu, no histórico do projeto, que uma cópia do artefato divergisse da outra
 * sem que o compilador acusasse.
 *
 * ============================================================================
 * ESTRUTURA DA MATRIZ — leitura direta de Hayes et al. (2020), Figura 1
 * ============================================================================
 * A matriz do EEMM é SISTEMA × OPERADOR EVOLUCIONÁRIO, não dimensão × nível.
 *
 *  - Os oito SISTEMAS formam UM ÚNICO EIXO, não cruzado entre si. As seis dimensões
 *    da experiência (afeto, cognição, atenção, self, motivação, comportamento
 *    manifesto) e os dois níveis adicionais de análise (biofisiológico,
 *    sociocultural) são, todos os oito, linhas irmãs do mesmo eixo. Biofisiológico e
 *    sociocultural NÃO são subdivididos pelas seis dimensões — a leitura anterior
 *    deste repositório, que cruzava 6 dimensões × 3 níveis, era um erro de leitura
 *    da fonte primária e foi corrigida no Sprint 5.
 *
 *  - Os quatro OPERADORES EVOLUCIONÁRIOS (variação, seleção, retenção, adequação ao
 *    contexto) formam o segundo eixo, como categorias de conteúdo próprias — não
 *    como atributo transversal verificado à parte.
 *
 *  - A VALÊNCIA (adaptativo/desadaptativo) não é um terceiro eixo da matriz: cada
 *    célula sistema × operador comporta um par de registros paralelos, um por
 *    valência. Isso permanece exatamente como implementado no Sprint 1.
 *
 * Os operadores são CARACTERIZAÇÃO CLÍNICA QUALITATIVA feita pelo profissional
 * dentro de uma única sessão de formulação — não telemetria de mudança ao longo do
 * tempo. O artefato não rastreia, e não deve rastrear, mudança longitudinal.
 */

export const DIMENSIONS = [
  "affect",
  "cognition",
  "attention",
  "self",
  "motivation",
  "behavior",
] as const;

export const ADDITIONAL_LEVELS = ["biophysiological", "sociocultural"] as const;

/**
 * Eixo único de 8 sistemas — NÃO cruzado. A distinção Dimensions/AdditionalLevels
 * é preservada apenas para fins de agrupamento visual na UI (equivalente às chaves
 * "Dimensions"/"Levels" da Figura 1), nunca para produzir cruzamento.
 */
export const SYSTEMS = [...DIMENSIONS, ...ADDITIONAL_LEVELS] as const;
export type System = (typeof SYSTEMS)[number];

export const OPERATORS = [
  "variation",
  "selection",
  "retention",
  "context",
] as const;
export type Operator = (typeof OPERATORS)[number];

export const VALENCES = ["adaptive", "maladaptive"] as const;
export type Valence = (typeof VALENCES)[number];

// Rótulos em português para uso na UI — mantidos aqui para não haver segunda fonte
// de verdade divergente entre server e client.
export const SYSTEM_LABELS: Record<System, string> = {
  affect: "Afeto",
  cognition: "Cognição",
  attention: "Atenção",
  self: "Self",
  motivation: "Motivação",
  behavior: "Comportamento Manifesto",
  biophysiological: "Biofisiológico",
  sociocultural: "Sociocultural",
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  variation: "Variação",
  selection: "Seleção",
  retention: "Retenção",
  context: "Adequação ao Contexto",
};

export const VALENCE_LABELS: Record<Valence, string> = {
  adaptive: "Adaptativo",
  maladaptive: "Desadaptativo",
};

/**
 * Rótulos dos dois grupos visuais de linhas. Existem para espelhar as chaves da
 * Figura 1 na interface; não têm efeito estrutural algum sobre a matriz.
 */
export const SYSTEM_GROUP_LABELS = {
  dimensions: "Dimensões",
  additionalLevels: "Níveis Adicionais",
} as const;

/**
 * Número de registros que uma formulação completa admite:
 * 8 sistemas × 4 operadores = 32 células; cada célula é bivalente → 64 registros.
 */
export const TOTAL_CELLS = SYSTEMS.length * OPERATORS.length;
export const TOTAL_RECORDS = TOTAL_CELLS * VALENCES.length;
