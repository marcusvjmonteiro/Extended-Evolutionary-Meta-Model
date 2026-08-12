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

export interface ChangeProcess {
  /** Nome do processo em português. */
  name: string;
  /** Descrição operacional curta, definicional — nunca prescritiva. */
  description: string;
  typicalValence: ProcessValence;
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
      name: "Supressão emocional",
      description:
        "Inibição deliberada da expressão de uma emoção já em curso.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — parte da literatura trata supressão como subtipo de
      // evitação experiencial, e não como processo distinto no EEMM.
      typicalValence: "maladaptive",
    },
    {
      name: "Consciência emocional",
      description:
        "Capacidade de identificar, discriminar e nomear os próprios estados emocionais.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — fronteira com o sistema de atenção (atenção dirigida
      // ao estado interno) não é nítida.
      typicalValence: "adaptive",
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
        "Envolvimento repetitivo e prolongado com conteúdo verbal sobre eventos passados ou futuros.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — pode ser lida como processo do sistema de atenção
      // (perseveração atencional) em vez de cognição.
      typicalValence: "maladaptive",
    },
    {
      name: "Comportamento governado por regras",
      description:
        "Comportamento sob controle de formulações verbais sobre contingências, e não do contato direto com elas.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — pliance tem componente social forte e poderia ser
      // atribuído ao sistema de motivação ou ao sistema sociocultural.
      typicalValence: "context_dependent",
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
        "Ampliação sustentada do monitoramento atencional voltado à detecção de ameaça.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — fronteira com o sistema de afeto (componente de
      // ativação relacionada à ameaça) não é nítida.
      typicalValence: "maladaptive",
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
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — poderia ser tratada como processo do sistema de
      // cognição (conteúdo avaliativo) em vez de self.
      typicalValence: "maladaptive",
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
      name: "Hierarquização de objetivos",
      description:
        "Organização de metas e valores em relações de subordinação, permitindo priorizar entre alternativas concorrentes.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — envolve enquadramento relacional hierárquico e
      // poderia ser atribuída ao sistema de cognição.
      typicalValence: "context_dependent",
    },
    {
      name: "Rigidez motivacional",
      description:
        "Persistência em uma direção motivacional apesar de mudança nas contingências que a sustentavam.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — sobreposição conceitual com rigidez comportamental
      // (sistema de comportamento manifesto).
      typicalValence: "maladaptive",
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
      name: "Repertório de habilidades",
      description:
        "Amplitude e variabilidade de respostas disponíveis diante de uma demanda situacional.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — a literatura trata repertório ora como processo, ora
      // como resultado de outros processos.
      typicalValence: "context_dependent",
    },
  ],

  // ==========================================================================
  // SISTEMAS NOVOS (Sprint 5) — conteúdo escrito neste sprint, sem base de
  // atribuição prévia no repositório. TODOS os itens estão marcados VERIFICAR.
  // ==========================================================================

  biophysiological: [
    {
      name: "Regulação autonômica",
      description:
        "Ajuste do balanço simpático-parassimpático à demanda da situação, incluindo a capacidade de retornar à linha de base após ativação.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Falta confirmar se Hayes et al. tratam regulação autonômica como processo de
      // mudança do sistema biofisiológico ou como medida (índice fisiológico) de
      // flexibilidade atribuída a outro sistema.
      typicalValence: "context_dependent",
    },
    {
      name: "Reatividade de estresse fisiológico",
      description:
        "Magnitude e duração da resposta fisiológica de estresse a demandas ambientais, incluindo ativação sustentada além do término do estressor.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Falta confirmar a terminologia da fonte (resposta de estresse, carga
      // alostática, reatividade do eixo HPA são tratadas de modos distintos na
      // literatura) e se a polaridade desadaptativa é sustentada ou dependente do
      // contexto.
      typicalValence: "maladaptive",
    },
    {
      name: "Regulação do ritmo circadiano e do sono",
      description:
        "Estabilidade e adequação dos ciclos de sono-vigília às demandas do ambiente e às necessidades do organismo.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Falta confirmar se a fonte trata sono como processo biofisiológico próprio ou
      // como comportamento manifesto (higiene de sono) — a fronteira é disputada.
      typicalValence: "context_dependent",
    },
    {
      name: "Interocepção",
      description:
        "Detecção e discriminação de sinais corporais internos, incluindo acurácia e confiança na leitura desses sinais.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Fronteira explícita com os sistemas de atenção (direcionamento atencional ao
      // corpo) e de afeto (consciência emocional); pode não ser processo
      // biofisiológico na leitura da fonte.
      typicalValence: "context_dependent",
    },
  ],

  sociocultural: [
    {
      name: "Suporte social",
      description:
        "Disponibilidade e acesso efetivo a vínculos que oferecem apoio instrumental, informacional ou emocional.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Falta confirmar se a fonte distingue suporte disponível de suporte percebido
      // (que teria componente cognitivo) e qual dos dois é o processo do sistema.
      typicalValence: "adaptive",
    },
    {
      name: "Normas de grupo",
      description:
        "Regras compartilhadas, explícitas ou implícitas, que o grupo de referência sustenta sobre o que é comportamento esperado.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Sobreposição direta com "comportamento governado por regras" (cognição): falta
      // confirmar se a fonte separa a norma como contingência sociocultural do
      // controle verbal que ela exerce sobre o indivíduo.
      typicalValence: "context_dependent",
    },
    {
      name: "Estigma e estigma internalizado",
      description:
        "Desvalorização social dirigida a um grupo ou condição, e sua incorporação pelo próprio indivíduo como autoavaliação.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Estigma público é sociocultural, mas o estigma internalizado tem sobreposição
      // com o sistema de self (self conceitualizado); falta confirmar se a fonte os
      // trata como um processo ou dois.
      typicalValence: "maladaptive",
    },
    {
      name: "Papéis socioculturais",
      description:
        "Posições sociais ocupadas pela pessoa e o conjunto de prescrições de comportamento associadas a cada uma.",
      // VERIFICAR: atribuição a confirmar contra a literatura fonte antes de uso na
      // coleta de dados real — item novo, sem atribuição prévia neste repositório.
      // Falta confirmar se papel sociocultural figura como processo de mudança na
      // fonte ou apenas como descritor de contexto — a distinção importa, porque só o
      // primeiro caberia nesta lista.
      typicalValence: "context_dependent",
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
