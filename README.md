# Extended Evolutionary Meta-Model — Sistema de Formulação de Caso

Protótipo de artefato de pesquisa que implementa uma matriz de formulação clínica baseada no
**Extended Evolutionary Meta-Model (EEMM)**, desenvolvido como artefato de uma pesquisa em
**Design Science Research (DSR)** para Trabalho de Conclusão de Curso.

> Este repositório acompanha um artigo/TCC. Documenta o artefato construído, as decisões de
> design tomadas e o processo de auditoria de conformidade metodológica aplicado a ele — não é
> um produto de mercado, e não deve receber dado clínico real (ver [Governança de dados](#governança-de-dados-e-privacidade)).

---

## O que é o EEMM

O EEMM (Hayes et al., 2020) organiza a formulação de caso em duas dimensões independentes:

- **8 sistemas** — as seis dimensões da experiência (afeto, cognição, atenção, self, motivação,
  comportamento manifesto) mais dois níveis adicionais de análise (biofisiológico,
  sociocultural). Os oito formam um único eixo, não subdividido entre si.
- **4 operadores evolucionários** — variação, seleção, retenção e adequação ao contexto:
  como um processo muda, é mantido ou se ajusta ao contexto.

Cruzando os dois eixos, com cada célula registrada em par (adaptativo/desadaptativo), a matriz
tem **32 células e até 64 registros** por caso.

| | Variação | Seleção | Retenção | Adequação ao Contexto |
|---|:---:|:---:|:---:|:---:|
| **Afeto** | A · D | A · D | A · D | A · D |
| **Cognição** | A · D | A · D | A · D | A · D |
| **Atenção** | A · D | A · D | A · D | A · D |
| **Self** | A · D | A · D | A · D | A · D |
| **Motivação** | A · D | A · D | A · D | A · D |
| **Comportamento Manifesto** | A · D | A · D | A · D | A · D |
| **Biofisiológico** | A · D | A · D | A · D | A · D |
| **Sociocultural** | A · D | A · D | A · D | A · D |

*(A = adaptativo, D = desadaptativo — os dois coexistem por célula, nunca se sobrescrevem.)*

---

## O artefato

Aplicação web full-stack para um profissional conduzir uma sessão única de formulação de caso:

- **Matriz 8×4** interativa, com ajuda contextual por sistema (processos de mudança com
  procedência bibliográfica registrada) e indicador não bloqueante para células pontuadas sem
  caracterização qualitativa.
- **Formulação final** composta por interpolação determinística de string — sem inferência
  causal, sugestão de conduta ou linguagem diagnóstica (restrição de segurança clínica aplicada
  a todo o texto gerado).
- **Página de transparência** (`/privacidade`) com a política de retenção lida em tempo real da
  configuração do servidor, não fixada na interface.
- **Purga automática** dos casos após um TTL configurável, com verificação de integridade por
  consulta ao banco imediatamente após cada exclusão.

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS 4 |
| Backend | Express + TypeScript (`ts-node` em dev, `tsc` em build) |
| Persistência | SQLite (`better-sqlite3`), arquivo local à instância |
| Tipos compartilhados | `shared/` — fonte única de verdade para sistemas, operadores e valências, consumida por client e server via alias `@shared/*` |
| Gerenciador de pacotes | pnpm (workspace) |

### Estrutura do repositório

```
client/    SPA React — matriz, painel de edição, formulação, página de privacidade
server/    API Express — rotas, purga automática, geração de formulação
shared/    Tipos e constantes do EEMM (System, Operator, Valence) e mapa de processos de mudança
docs/      Rastreabilidade bibliográfica e registros de decisão
Dockerfile Build multi-stage (node:20-slim) — preparado, build real ainda não executado em CI
```

---

## Rodando localmente

Pré-requisitos: Node 20+, [pnpm](https://pnpm.io/).

```bash
pnpm install

# terminal 1 — API em :3001
cd server && pnpm dev

# terminal 2 — frontend em :5173, com proxy para /api
cd client && pnpm dev
```

O SQLite é criado automaticamente em `server/database.sqlite` na primeira execução. Nenhuma
variável de ambiente é obrigatória para desenvolvimento — os padrões (`PORT=3001`,
`CASE_TTL_SECONDS=14400`) já cobrem o fluxo local.

Variáveis relevantes para produção/container (todas opcionais, com fallback):

| Variável | Efeito | Padrão |
|---|---|---|
| `PORT` | Porta do servidor Express | `3001` |
| `DATABASE_PATH` | Caminho do arquivo SQLite | `server/database.sqlite` |
| `CLIENT_DIST_PATH` | Build estático do client a servir em produção | resolvido por convenção |
| `CASE_TTL_SECONDS` | Tempo de retenção de um caso antes da purga automática | `14400` (4 h) |
| `PURGE_INTERVAL_SECONDS` | Frequência da varredura de casos expirados | `900` (15 min) |

---

## Governança de dados e privacidade

**Não insira dado de paciente real neste artefato.** Ele é um protótipo de pesquisa em avaliação
por especialistas, com conteúdo de teste extraído de vinhetas clínicas fictícias — nunca
identificação ou histórico de pessoa real. Isso é reforçado dentro da própria aplicação, na
página `/privacidade`.

Resumo do mecanismo:

- O banco SQLite é **local à instância** — sem replicação, sem exportação automática, sem
  integração com serviços de terceiros.
- Cada caso é eliminado **automaticamente** após o TTL configurado, contado desde a criação.
- Cada exclusão — automática ou manual — é seguida de **consulta de verificação** ao banco,
  confirmando que nenhum registro do caso permaneceu.
- A decisão sobre segregação entre dados operacionais e dados de pesquisa (feedback de
  avaliadores) está registrada em
  [`docs/decisions/segregacao-dados-pesquisa.md`](docs/decisions/segregacao-dados-pesquisa.md).

---

## Base teórica e rastreabilidade bibliográfica

A estrutura sistema × operador segue a Figura 1 de Hayes et al. (2020). O mapa de processos de
mudança exibido na ajuda contextual (`shared/eemm-processes.ts`) tem cada atribuição
sistema→processo registrada com referência, localização exata na fonte, e quem/quando conferiu —
ver [`docs/verificacao-processos-eemm.md`](docs/verificacao-processos-eemm.md).

Fontes citadas ao longo do código e da tabela de rastreabilidade (autoria e ano confirmados;
título e periódico completos não estão fixados neste repositório e não devem ser inferidos —
confira sempre contra a lista de Referências do TCC antes de citar):

- **Hayes et al. (2020)** — *Clinical Psychology Review*. Fonte primária da estrutura
  sistema × operador evolucionário (Figura 1).
- **Hayes, S. C., Ciarrochi, J., Hofmann, S. G., Chin, F., & Sahdra, B. (2022)**.
- **Hofmann, S. G., & Hayes, S. C. (2024)** — dois autores. Uma forma anterior desta referência,
  com onze autores, foi usada por engano em parte do histórico deste repositório e **está
  incorreta**; a correção está documentada nos commits do projeto como parte deliberada do
  registro de rigor do processo — erros identificados e corrigidos não são ocultados.

---

## Metodologia e processo de auditoria

O artefato foi desenvolvido em ciclos iterativos com **seis rodadas de auditoria de conformidade
metodológica** contra o critério a priori de conformidade estrutural do EEMM, cada uma verificando
por execução ao vivo (não apenas leitura de código) que o roteiro de inspeção do avaliador
(oito tarefas) executa sem quebra. Os logs de sprint e os relatórios de auditoria completos são
material de processo interno da pesquisa e não fazem parte do código versionado a partir de agora
— permanecem disponíveis nos commits anteriores do histórico deste repositório para quem quiser
consultá-los.

---

## Licença

Declarada como MIT em `package.json`. Se você pretende reutilizar o código, verifique se um
arquivo `LICENSE` foi adicionado antes de assumir os termos exatos.

## Citação

Se este artefato for referenciado a partir do artigo/TCC associado, cite o trabalho publicado —
não este repositório diretamente. Detalhes de citação serão adicionados aqui após a publicação.
