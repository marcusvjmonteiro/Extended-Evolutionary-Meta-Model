import type { System, Valence } from "./eemm-types";

/**
 * Processos de mudança organizados pelos 8 SISTEMAS do EEMM.
 *
 * Base teórica: Hayes et al. (2020, 2022); Hofmann & Hayes (2024). O conteúdo aqui é
 * material de APOIO À DECISÃO do profissional — é exibido na ajuda contextual do
 * painel de célula (Tarefa T5 do Apêndice C) e será lido por especialistas em
 * psicoterapia baseada em processos durante a Atividade 5.
 *
 * ============================================================================
 * REINDEXAÇÃO POR SISTEMA (Sprint 5) — o que mudou e por quê
 * ============================================================================
 * Até o Sprint 4 este mapa era indexado por DIMENSÃO (6 listas), sob a leitura de
 * que o EEMM seria uma matriz dimensão × nível. Essa leitura estava errada: os oito
 * sistemas formam um eixo único, e biofisiológico e sociocultural são sistemas
 * PRÓPRIOS, irmãos das seis dimensões — não subdivisões delas.
 *
 * A consequência prática do erro era de validade de conteúdo, não cosmética: as 12
 * células de nível biofisiológico/sociocultural do grid antigo exibiam, na ajuda
 * contextual, processos de nível psicológico reaproveitados, porque não havia
 * conteúdo próprio para esses níveis. Com o eixo corrigido, os dois sistemas têm
 * listas próprias, abaixo.
 *
 * ============================================================================
 * LIMITAÇÃO DE VALIDADE DE CONTEÚDO, DECLARADA EM VEZ DE MASCARADA
 * ============================================================================
 * ATRIBUIÇÕES MARCADAS COM `VERIFICAR`
 *
 * Vários processos são discutidos na literatura sem uma atribuição única e
 * incontroversa a um sistema — ruminação pode ser lida como cognição ou como atenção
 * perseverativa; autocrítica como self ou como cognição. Onde a atribuição não é
 * inequívoca na literatura fonte, o processo está marcado com um comentário
 * `// VERIFICAR`. Esses pontos precisam de conferência contra Hayes et al.
 * (2020, 2022) por leitura direta ANTES da coleta de dados real.
 *
 * TODOS os processos dos sistemas `biophysiological` e `sociocultural` estão
 * marcados `VERIFICAR`, sem exceção: são conteúdo novo, escrito neste sprint, sem
 * base de atribuição prévia no repositório. Isso é esperado e correto — é melhor
 * conteúdo explicitamente marcado como não verificado do que conteúdo que pareça
 * definitivo sem ser. A lista consolidada está em SPRINT_5_LOG.md.
 *
 * A terminologia em português não segue uma tradução canônica estabelecida: não há
 * tradução oficial consolidada do EEMM em PT-BR. Os termos abaixo seguem o uso mais
 * corrente na literatura brasileira de ACT/RFT, mas também merecem revisão.
 */

/**
 * Valência tipicamente associada ao processo.
 *
 * `context_dependent` é usado onde a literatura NÃO sustenta uma polaridade fixa —
 * o mesmo processo pode ser adaptativo ou desadaptativo conforme o contexto e a
 * função. Forçar polaridade nesses casos seria distorcer a fonte.
 */
export type ProcessValence = Valence | "context_dependent";

/**
 * Registro de que a atribuição sistema→processo foi conferida contra a literatura
 * fonte, e não apenas julgada plausível por juízo clínico geral.
 *
 * Os quatro campos são obrigatórios QUANDO o objeto existe: uma procedência sem
 * localização exata, ou sem quem conferiu e quando, não é procedência — é uma
 * afirmação de que alguém, em algum momento, achou que estava certo. O que torna
 * este campo auditável é justamente não admitir preenchimento parcial.
 *
 * `location` deve apontar o ponto exato consultado (página, seção ou figura), não
 * a obra inteira. "Hayes et al. (2020)" identifica a fonte; "Figura 1, p. 12"
 * permite a um terceiro reabrir a fonte e conferir a mesma coisa.
 */
export interface ProcessSource {
  /** Referência bibliográfica curta. Ex.: "Hayes et al. (2020)". */
  reference: string;
  /** Localização exata dentro da fonte. Ex.: "Figura 1, p. 12". */
  location: string;
  /** Quem conferiu. Ex.: "Marcus". */
  verifiedBy: string;
  /** Data da conferência, em ISO. Ex.: "2026-08-13". */
  verifiedAt: string;
}

export interface ChangeProcess {
  /** Nome do processo em português. */
  name: string;
  /** Descrição operacional curta, definicional — nunca prescritiva. */
  description: string;
  typicalValence: ProcessValence;
  /**
   * Procedência bibliográfica da atribuição. OPCIONAL de propósito.
   *
   * Torná-lo obrigatório quebraria a compilação para os 17 processos que hoje não
   * têm base citável — e o efeito prático seria pressão para preencher qualquer
   * coisa e destravar o build. Como o campo existe para registrar verificação
   * real, um tipo que induz preenchimento apressado destrói o que ele deveria
   * garantir.
   *
   * A ausência deste campo é, portanto, informação: significa que a atribuição
   * ainda não foi conferida contra a fonte. O comentário de marcação no item
   * correspondente e a linha em `docs/verificacao-processos-eemm.md` dizem a mesma
   * coisa, e os três só devem sair juntos.
   *
   * (A string literal do marcador não é reproduzida aqui de propósito: a contagem
   * de itens pendentes é feita por busca textual, e uma menção em prosa seria
   * contada como se fosse um item — inflando o número em um.)
   */
  source?: ProcessSource;
}

export const PROCESS_VALENCE_LABELS: Record<ProcessValence, string> = {
  adaptive: "tipicamente adaptativo",
  maladaptive: "tipicamente desadaptativo",
  context_dependent: "depende do contexto",
};

export const CHANGE_PROCESSES: Record<System, ChangeProcess[]> = {
  affect: [
    {
      name: "Evitação experiencial",
      description:
        "Esforço para alterar, suprimir ou evitar o contato com experiências internas — emoções, sensações corporais — mesmo quando esse esforço produz prejuízo funcional.",
      typicalValence: "maladaptive",
    },
    {
      name: "Aceitação (disposição)",
      description:
        "Abertura deliberada ao contato com experiências emocionais difíceis, sem tentativa de controlá-las, reduzi-las ou eliminá-las.",
      typicalValence: "adaptive",
    },
    {
      name: "Supressão (regulação emocional)",
      description:
        "Inibição deliberada da expressão de uma emoção já em curso.",
      typicalValence: "maladaptive",
      source: {
        reference: "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)",
        location: "Tabela 1, entrada do Emotion Regulation Questionnaire (ERQ)",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      name: "Consciência emocional",
      description:
        "Capacidade de identificar, discriminar e nomear os próprios estados emocionais. A fonte codifica este mediador simultaneamente em Afeto e Atenção; não há resolução única para um só sistema nas fontes-âncora.",
      typicalValence: "adaptive",
      source: {
        reference: "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)",
        location:
          "Tabela 1, entrada do Five Facet Mindfulness Questionnaire (fator Observe)",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      // Reatribuído de `biophysiological` para `affect` no Sprint 9 (decisão C3).
      name: "Interocepção",
      description:
        "Detecção e discriminação de sinais corporais internos, incluindo acurácia e confiança na leitura desses sinais. Reatribuído de Biofisiológico para Afeto: a única fonte que menciona o conceito o posiciona como técnica de exposição interoceptiva dentro da dimensão Afeto, nível psicológico — não no sistema Biofisiológico, onde estava atribuído anteriormente. Reatribuição decidida por Marcus e Gabriel com base em revisão bibliográfica (ver /docs/verificacao-processos-eemm.md).",
      typicalValence: "context_dependent",
      source: {
        reference: "Hofmann & Hayes (2024)",
        location: "Figura 3, comparação entre ACT e terapia psicodinâmica",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
  ],

  cognition: [
    {
      name: "Fusão cognitiva",
      description:
        "Regulação do comportamento pelo conteúdo literal do pensamento, como se o pensamento fosse o evento que descreve.",
      typicalValence: "maladaptive",
    },
    {
      name: "Desfusão cognitiva",
      description:
        "Contato com o pensamento como evento psicológico em curso, distinguindo-o daquilo a que ele se refere.",
      typicalValence: "adaptive",
    },
    {
      name: "Ruminação / preocupação perseverativa",
      description:
        "Envolvimento repetitivo e prolongado com conteúdo verbal sobre eventos passados ou futuros. Sobreposição documentada com o sistema Atenção.",
      typicalValence: "maladaptive",
      source: {
        reference:
          "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024)",
        location:
          "BRT 2022, Tabela 1 (Rumination-Reflection Questionnaire, Penn State Worry Questionnaire); JPI 2024, subseção de Atenção do caso Mora",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      name: "Comportamento governado por regras",
      description:
        "Comportamento sob controle de formulações verbais sobre contingências, e não do contato direto com elas.",
      typicalValence: "context_dependent",
      source: {
        reference: "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)",
        location: "Seção 1, discussão de pesquisa em Relational Frame Theory",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
  ],

  attention: [
    {
      name: "Atenção flexível ao momento presente",
      description:
        "Capacidade de dirigir, sustentar e redirecionar a atenção de forma voluntária conforme a demanda da situação.",
      typicalValence: "adaptive",
    },
    {
      name: "Rigidez atencional",
      description:
        "Dificuldade em desengajar a atenção de um foco, mesmo quando a situação exige redirecioná-la.",
      typicalValence: "maladaptive",
    },
    {
      name: "Hipervigilância",
      description:
        "Ampliação sustentada do monitoramento atencional voltado à detecção de ameaça. Hayes et al. (2020) associa vigilância ao afeto/ansiedade; Hofmann & Hayes (2024) a associa à atenção. A atribuição a Atenção foi mantida por decisão de Marcus e Gabriel, priorizando a fonte mais recente e mais diretamente focada na descrição do próprio construto.",
      typicalValence: "maladaptive",
      source: {
        reference:
          "Hofmann & Hayes (2024)",
        location:
          "Seção sobre descompasso evolutivo com o ambiente moderno ('heightened vigilance and aggression')",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      name: "Desengajamento atencional",
      description:
        "Retirada da atenção de um estímulo ou conteúdo. Pode operar como regulação eficaz ou como esquiva, conforme a função no contexto.",
      typicalValence: "context_dependent",
    },
  ],

  self: [
    {
      name: "Self como contexto",
      description:
        "Contato com uma perspectiva contínua de observação a partir da qual as experiências são notadas, distinta do conteúdo dessas experiências.",
      typicalValence: "adaptive",
    },
    {
      name: "Self conceitualizado",
      description:
        "Apego a uma descrição verbal de si mesmo, com o comportamento passando a ser regulado pela manutenção dessa descrição.",
      typicalValence: "maladaptive",
    },
    {
      name: "Tomada de perspectiva",
      description:
        "Capacidade de relacionar a própria perspectiva à de outros e a si mesmo em outros tempos e lugares (enquadramento dêitico).",
      typicalValence: "adaptive",
    },
    {
      name: "Autocrítica",
      description:
        "Avaliação verbal negativa recorrente dirigida a si mesmo.",
      typicalValence: "maladaptive",
      source: {
        reference:
          "Hofmann & Hayes (2024)",
        location:
          "Tabela 2 (linha de Compassion-Focused Therapy) e estudo de caso Mora ('I blame myself and cannot treat myself with compassion')",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
  ],

  motivation: [
    {
      name: "Clareza de valores",
      description:
        "Identificação de direções de vida escolhidas e verbalmente construídas, que funcionam como reforçadores de longo prazo.",
      typicalValence: "adaptive",
    },
    {
      name: "Motivação por controle aversivo",
      description:
        "Comportamento mantido predominantemente pela remoção ou evitação de estados aversivos, e não por consequências apetitivas escolhidas.",
      typicalValence: "maladaptive",
    },
    {
      // Sprint 9, decisão C2: ocupa o slot do antigo "Hierarquização de objetivos",
      // removido por C1.
      name: "Ação valorizada (valores como base motivacional)",
      description:
        "Valores funcionam como base motivacional que estabelece reforçadores intrínsecos e orienta ação comprometida — descrito na fonte como o terceiro pilar da flexibilidade psicológica (engajamento).",
      typicalValence: "adaptive",
      source: {
        reference: "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)",
        location:
          "Seção 2.3 ('Pillar 3: engagement'); Tabela 1, entradas do Valued Living Questionnaire e do Engaged Living Scale",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
  ],

  behavior: [
    {
      name: "Ação comprometida",
      description:
        "Padrões de ação sustentados e ampliados, ligados a direções valorizadas.",
      typicalValence: "adaptive",
    },
    {
      name: "Rigidez comportamental",
      description:
        "Manutenção de um padrão de resposta apesar de alteração nas condições que o tornavam eficaz.",
      typicalValence: "maladaptive",
    },
    {
      name: "Esquiva comportamental / inação",
      description:
        "Redução ou interrupção de ação em situações associadas a conteúdo aversivo.",
      typicalValence: "maladaptive",
    },
    {
      // Sprint 9, decisão C5: fusão de "Rigidez motivacional" (antes em Motivação) com
      // "Repertório de habilidades" (antes aqui). O item de Motivação foi removido.
      name: "Repertório comportamental (amplitude e flexibilidade)",
      description:
        "Amplitude e variabilidade de respostas disponíveis diante de uma demanda situacional. Processo fundido a partir de dois itens do mapa original (rigidez motivacional e repertório de habilidades), que a revisão bibliográfica encontrou ancorados no mesmo trecho-fonte sobre estreitamento de repertório ('repertoire narrowing'). Fusão decidida por Marcus e Gabriel.",
      typicalValence: "context_dependent",
      source: {
        reference:
          "Hayes et al. (2020); Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)",
        location:
          "Hayes et al. 2020, Seção 2.3; Hayes et al. 2022, Seção 2.1, discussão do Pilar 1",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
  ],

  // ==========================================================================
  // SISTEMAS INTRODUZIDOS NO SPRINT 5, com atribuições conferidas no Sprint 9.
  //
  // A contagem caiu de 4 para 3 processos em cada um: `Interocepção` migrou para
  // `affect` (decisão C3) e `Papéis socioculturais` foi removido sem substituto
  // (decisão C4). Contagem menor NÃO significa lacuna preenchida — ver
  // SPRINT_9_LOG.md.
  // ==========================================================================

  // NOTA: sistema Biofisiológico permanece com 3 processos (não 4), por
  // decisão deliberada. Busca bibliográfica dedicada nas três fontes-âncora
  // (Hayes et al., 2020; Hayes, Ciarrochi, Hofmann, Chin & Sahdra, 2022;
  // Hofmann & Hayes, 2024) não encontrou um quarto processo que atenda ao
  // critério de "processo de mudança caracterizável clinicamente" — o único
  // candidato adicional identificado (polimorfismo 5-HTT como endofenótipo
  // de flexibilidade psicológica, Hayes et al. 2022) é medida correlacional
  // de pesquisa genética, não processo modificável em contexto clínico, e
  // foi descartado por esse motivo. Ver /docs/verificacao-processos-eemm.md
  // e SPRINT_10_LOG.md para o registro completo da busca.
  biophysiological: [
    {
      name:
        "Atividade do sistema nervoso autônomo (variabilidade da frequência cardíaca)",
      description:
        "Ajuste do balanço simpático-parassimpático à demanda da situação, incluindo a capacidade de retornar à linha de base após ativação.",
      typicalValence: "context_dependent",
      source: {
        reference:
          "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024)",
        location:
          "BRT 2022, Seção 3, discussão do nível biofisiológico; JPI 2024, lista de exemplos do nível biológico/fisiológico",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      name: "Estresse fisiológico",
      description:
        "Magnitude e duração da resposta fisiológica de estresse a demandas ambientais, incluindo ativação sustentada além do término do estressor. Confiança baixa — suporte restrito a uma única fonte, sem terminologia técnica de reatividade nas fontes-âncora.",
      typicalValence: "maladaptive",
      source: {
        reference: "Hofmann & Hayes (2024)",
        location: "Estudo de caso Mora, avaliação multinível",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      name: "Sono (higiene do sono)",
      description:
        "Estabilidade e adequação dos ciclos de sono-vigília às demandas do ambiente e às necessidades do organismo. 'Ritmo circadiano' não aparece nas fontes-âncora; o conceito sustentado é sono como alvo comportamental de intervenção.",
      typicalValence: "context_dependent",
      source: {
        reference: "Hofmann & Hayes (2024)",
        location: "Estudo de caso Mora, etapa de planejamento de tratamento",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
  ],

  sociocultural: [
    {
      name: "Suporte social",
      description:
        "Disponibilidade e acesso efetivo a vínculos que oferecem apoio instrumental, informacional ou emocional. Nenhuma das fontes distingue suporte social disponível de suporte social percebido; o instrumento citado mede exclusivamente percepção por autorrelato.",
      typicalValence: "adaptive",
      source: {
        reference:
          "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024)",
        location:
          "BRT 2022, Tabela 1, entrada da Medical Outcomes Study Social Support Survey; JPI 2024, Tabela 4 e caso Mora, etapa 4",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      name: "Normas de grupo",
      description:
        "Regras compartilhadas, explícitas ou implícitas, que o grupo de referência sustenta sobre o que é comportamento esperado. Sobreposição conceitual documentada com o processo de comportamento governado por regras (Cognição) — as fontes não separam a norma social do controle verbal que ela exerce.",
      typicalValence: "context_dependent",
      source: {
        reference:
          "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022); Hofmann & Hayes (2024)",
        location:
          "BRT 2022, Tabela 1, entrada do Drinking Norms Rating Form; JPI 2024, seção sobre o nível relações/cultura",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      name: "Autoestigma",
      description:
        "Desvalorização social dirigida a um grupo ou condição, e sua incorporação pelo próprio indivíduo como autoavaliação. Fonte trata exclusivamente como 'self-stigma'; não há suporte para estigma público como processo distinto. Sobreposição possível com Self (componente de autoconceito).",
      typicalValence: "maladaptive",
      source: {
        reference: "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)",
        location: "Seção 1.1, lista de aplicações iniciais da ACT",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
    {
      // Acrescentado no Sprint 10. Repõe o quarto processo do sistema, perdido no
      // Sprint 9 com a remoção de "Papéis socioculturais" (decisão C4).
      name: "Vínculo e pertencimento",
      description:
        "Extensão sociocultural do processo de self contextual (nível psicológico): a fonte propõe explicitamente que o senso de self contextual se estende, no nível social, para vínculo e pertencimento seguro. Processo distinto dos demais três processos socioculturais do mapa (suporte social, normas de grupo, autoestigma), com foco em qualidade relacional/apego.",
      typicalValence: "adaptive",
      source: {
        reference: "Hayes, Ciarrochi, Hofmann, Chin & Sahdra (2022)",
        location:
          "Discussão da extensão social do modelo de flexibilidade psicológica ('a noticing or contextual self to secure attachment and belonging')",
        verifiedBy: "Marcus e Gabriel",
        verifiedAt: "2026-08-12",
      },
    },
  ],
};

/**
 * Definição operacional das valências, exibida na ajuda contextual.
 *
 * Existe porque a heurística HU6 (reconhecimento em vez de memorização) não permite
 * pressupor que o avaliador tenha a definição de cabeça no momento do registro.
 */
export const VALENCE_DEFINITIONS: Record<Valence, string> = {
  adaptive:
    "Processo que, neste contexto, amplia o repertório da pessoa e a aproxima de direções que ela valoriza.",
  maladaptive:
    "Processo que, neste contexto, estreita o repertório da pessoa ou a afasta de direções que ela valoriza.",
};
