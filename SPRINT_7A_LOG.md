# SPRINT 7A — Página de transparência de armazenamento e retenção (Tarefa T8)

**Data:** 12 de agosto de 2026
**Escopo:** completar a metade pendente da Tarefa T8 do roteiro de inspeção (Apêndice C) — o
único ponto de quebra remanescente do roteiro, isolado nas Rodadas 2 e 3 de auditoria.
**Escopo respeitado:** nenhuma alteração em schema, `routes/eemm.ts`, `services/formulation.ts`
ou no grid principal. As únicas mudanças fora da página nova são os dois pontos de entrada e o
registro da rota.

**Pré-requisito verificado antes de qualquer alteração:**

| Fonte | Valor lido |
|---|---|
| `server/src/services/purge.ts:33-35` | `CASE_TTL_SECONDS` = `4 * 60 * 60` = **14400**, sobrescrevível por variável de ambiente |
| `server/src/services/purge.ts:38-40` | `PURGE_INTERVAL_SECONDS` = `15 * 60` = **900**, idem |
| `server/src/database.ts:17-20` | SQLite em `DATABASE_PATH` ou, por padrão, `server/database.sqlite` — arquivo **local à instância**, sem replicação |

**Nenhum desses valores foi escrito à mão na UI.** Ver §3.

---

## 1. Passo 1 — Endpoint de configuração

### `GET /api/config/retention`

```json
{
  "ttlSeconds": 14400,
  "ttlHuman": "4 horas",
  "purgeIntervalSeconds": 900,
  "purgeIntervalHuman": "15 minutos"
}
```

Arquivo novo: [server/src/routes/config.ts](server/src/routes/config.ts), montado em
`/api/config` em `index.ts`. Importa `CASE_TTL_SECONDS` e `PURGE_INTERVAL_SECONDS` **das mesmas
constantes exportadas que a rotina de purga usa para operar** — não de uma cópia.

`purgeIntervalHuman` não estava no formato pedido; foi acrescentado porque a seção "Como são
eliminadas" da página precisa dizer com que frequência a varredura roda, e formatar no cliente
recriaria a duplicação que o próprio pedido veda.

O endpoint **não expõe `DATABASE_PATH`**. O caminho do arquivo no servidor não informa nada ao
avaliador sobre retenção e é detalhe de infraestrutura; o que importa — que o banco é local à
instância — a página diz em texto.

### Formatação de duração

Não existia função de formatação em `purge.ts` (ele apenas registra segundos crus no log), então
foi criada: [server/src/services/duration.ts](server/src/services/duration.ts), exportando
`formatDuration(totalSeconds: number): string`.

**Por que em módulo próprio e não dentro de `purge.ts`:** aquele módulo importa `../database`,
que **abre uma conexão SQLite no momento do import**. Uma função pura de formatação não deve
arrastar um banco junto para ser exercitada. `duration.ts` não importa nada.

Exercitada isoladamente (importada direto, sem subir servidor nem banco):

```
 14400 -> 4 horas
  5400 -> 1 hora e 30 minutos
   900 -> 15 minutos
  3600 -> 1 hora
  7200 -> 2 horas
    60 -> 1 minuto
    90 -> 1 minuto
    45 -> 45 segundos
     1 -> 1 segundo
     0 -> 0 segundos
    -5 -> 0 segundos
   NaN -> 0 segundos
```

Decisões registradas: trunca em minutos quando há horas (a página comunica política de retenção;
"4 horas e 3 segundos" seria precisão sem informação); exibe segundos abaixo de um minuto, que é
o caso do TTL curto usado para testar a purga, onde o número exato importa; e devolve
`"0 segundos"` para entrada inválida em vez de lançar — derrubar uma página informativa por
causa de variável de ambiente malformada seria pior que exibir valor obviamente errado.

---

## 2. Passo 2 — Página `/privacidade`

Arquivo novo: [client/src/pages/Privacy.tsx](client/src/pages/Privacy.tsx); rota registrada em
[client/src/App.tsx](client/src/App.tsx).

Escrita para leitor especialista em psicoterapia, **sem background técnico assumido**: nenhum
nome de tabela, nenhum caminho de arquivo, nenhum jargão de infraestrutura.

### Transcrição integral do conteúdo renderizado

> # Privacidade e Retenção de Dados
> *Onde as informações ficam, por quanto tempo e como são eliminadas*
>
> ## ONDE AS INFORMAÇÕES FICAM
>
> Tudo o que você registra fica guardado em um banco de dados local a esta instalação do
> aplicativo. As informações não são copiadas, sincronizadas ou enviadas para serviços de
> terceiros — não há integração com serviços de nuvem, de análise de uso ou de monitoramento.
>
> Também não existe nenhuma funcionalidade de exportação automática: o aplicativo não envia o
> conteúdo dos casos para lugar nenhum, nem por e-mail, nem por arquivo, nem em segundo plano.
>
> ## POR QUANTO TEMPO FICAM GUARDADAS
>
> Cada caso criado é mantido por, no máximo, **4 horas**, contados a partir do momento em que ele
> foi criado. Passado esse prazo, o caso é eliminado automaticamente, sem que ninguém precise
> fazer nada.
>
> Esse prazo cobre com folga uma sessão de inspeção e a consolidação das anotações logo depois,
> sem que o material fique guardado além do necessário.
>
> ## COMO SÃO ELIMINADAS
>
> O aplicativo executa uma **rotina automática de exclusão** que verifica periodicamente — a cada
> **15 minutos** — se existem casos que já passaram do prazo, e apaga os que passaram. A
> verificação também acontece toda vez que o aplicativo é iniciado, de modo que um caso vencido
> não sobrevive a um período em que o sistema esteve desligado.
>
> Depois de apagar, o aplicativo **consulta o banco de dados de novo para conferir** se não sobrou
> nenhum registro daquele caso — nem os dados de identificação, nem nenhuma das células da
> formulação. Essa conferência é parte do desenho do artefato e já está implementada: a eliminação
> é confirmada, não apenas presumida.
>
> Quando um caso é excluído, todas as células da formulação EEMM associadas a ele são removidas na
> mesma operação. Não fica registro parcial.
>
> ## VOCÊ PODE EXCLUIR A QUALQUER MOMENTO
>
> Não é preciso esperar o prazo automático. Na lista de casos, o botão de exclusão ao lado de cada
> caso o remove imediatamente, com a mesma conferência descrita acima.
>
> *[botão]* Ir para a lista de casos →
>
> ---
>
> ### ⚠ Nenhum dado de paciente real deve ser inserido
>
> Todo o conteúdo registrado durante a inspeção é **fictício**, extraído das vinhetas clínicas
> fornecidas no roteiro de tarefas. Este aplicativo é um protótipo em avaliação e **não deve
> receber informação de pessoa real, identificada ou identificável** — nem nome, nem data de
> nascimento, nem conteúdo de atendimento.
>
> Se, por engano, algum dado real for inserido, exclua o caso imediatamente pela lista de casos.
>
> ---
>
> *Os prazos nesta página são lidos da configuração em vigor no servidor, a mesma que a rotina de
> exclusão usa para operar. Eles não são um texto fixo: se a configuração mudar, esta página muda
> junto.*

O aviso de escopo (dado fictício) recebe o mesmo peso visual do disclaimer da formulação —
borda âmbar destacada, corpo de texto legível —, pela mesma razão: é informação de proteção, não
rodapé.

### Comportamento em caso de falha da API

Se `GET /api/config/retention` não responder, a página **não exibe um valor padrão**. Mostra
*"(não foi possível confirmar este prazo agora — recarregue a página)"* e um aviso explicando por
quê. Um número escrito à mão como fallback seria exatamente a afirmação desacoplada do mecanismo
que esta página existe para evitar.

---

## 3. Confirmação de que o TTL é lido dinamicamente

O pedido é explícito: *"não um número coincidentemente igual, mas lido da mesma fonte"*. Valor
igual não prova origem comum, então a verificação foi feita **sobrescrevendo a configuração** e
observando se os dois consumidores mudam juntos.

**Instância de prova** subida em `:3997` com `CASE_TTL_SECONDS=5400` e
`PURGE_INTERVAL_SECONDS=120`:

| Consumidor | Saída |
|---|---|
| Rotina de purga (log de bootstrap) | `[purga] varredura automatica ativa: TTL=5400s, intervalo=120s` |
| `GET /api/config/retention` | `{"ttlSeconds":5400,"ttlHuman":"1 hora e 30 minutos","purgeIntervalSeconds":120,"purgeIntervalHuman":"2 minutos"}` |

**Os dois se moveram juntos, sem tocar em código.** A página exibe o que a purga pratica porque
lê a mesma constante — não porque alguém escreveu o mesmo número em dois lugares.

Na instância normal (configuração padrão), o endpoint devolve `14400` / `"4 horas"` e a purga
anuncia `TTL=14400s`, ambos coincidindo com `4 * 60 * 60` declarado em `purge.ts`.

Busca por literais de prazo no JSX da página: **nenhuma ocorrência de "4 horas", "14400", "15
minutos" ou "900"** — todos os prazos vêm de `{ttl}` / `{interval}`.

---

## 4. Passo 3 — Dois pontos de entrada

**1. Cabeçalho de `EEMMForm.tsx`** — botão "Privacidade e Retenção de Dados", à esquerda do
"Gerar Formulação Final", visível durante todo o fluxo de registro. Não está atrás de menu,
ícone ou rodapé: o avaliador precisa localizar a informação no momento em que a dúvida lhe
ocorre, que é enquanto insere conteúdo.

**2. Modal de exclusão em `PatientList.tsx`** — link "Saiba mais sobre como e quando seus dados
são eliminados", logo abaixo do texto já existente. Conteúdo do modal após a mudança, lido da
página renderizada:

```
Excluir paciente?
Todas as células da formulação EEMM serão removidas junto. Essa ação não pode ser desfeita.
Saiba mais sobre como e quando seus dados são eliminados
[Cancelar] [Excluir]
```

Ambos navegam para `/privacidade` — verificado com a página carregando e exibindo
`ttl = "4 horas"` nas duas entradas.

---

## 5. Passo 4 — Verificação ao vivo: Tarefa T8 completa

Executada contra a aplicação rodando (backend `:3001`, Vite `:5173`).

| Etapa de T8 | Rodadas 1–3 | **Agora** |
|---|---|---|
| **Localizar** a informação de armazenamento/retenção | **QUEBRA** — nenhuma tela mencionava armazenamento, retenção, privacidade ou o prazo; não havia o que localizar | **EXECUTA** — dois pontos de entrada; página em `/privacidade` com prazo real |
| **Excluir** o caso | Executa | **EXECUTA** |

**Percurso completo:**

1. Caso "T8 Sprint 7A" criado (id=13), uma célula registrada (`affect × retention × maladaptive`,
   escore 7).
2. Cabeçalho da matriz exibe o botão de privacidade; acionado, leva a `/privacidade` com
   `h1 = "Privacidade e Retenção de Dados"` e TTL "4 horas".
3. Na lista de casos, o modal de exclusão exibe o link novo; acionado, leva à mesma página.
4. Exclusão confirmada pela UI. Servidor registrou:
   ```
   [purga] caso id=13 eliminado e verificado: patients=0, eemm_cells=0,
           eemm_cells_legacy_backup_v2=0 (1 celula(s) removida(s) em cascata)
   ```
5. Consulta direta ao banco após a exclusão: `patients: 0`, `eemm_cells: 0`.
6. Console do navegador: **sem erros**.

> ### T8 executa integralmente pela primeira vez desde a Rodada 1 de auditoria.
>
> Na Rodada 1, quatro tarefas quebravam por completo (T2, T3, T5, T7) e T8 era parcial. Nas
> Rodadas 2 e 3, T8 permaneceu como **a única tarefa parcial** — sempre pela mesma metade, a de
> localizar a informação de retenção. Com esta entrega, **as oito tarefas do roteiro do Apêndice C
> executam de ponta a ponta sem quebra.**

### 5.1 Limitação de método, declarada

O clique **sintético de mouse** da ferramenta de navegação não é despachado neste ambiente: o
pane do navegador não está compondo frames (a mesma causa pela qual `screenshot` falha com
*"the Browser pane is not displayed"*). Verificado que o problema é do ambiente, não da
aplicação: `document.elementFromPoint(892, 38)` retorna exatamente o botão pretendido, sem
nenhum elemento o interceptando, e o mesmo botão navega corretamente quando o clique é
disparado por `element.click()`.

**Portanto:** a navegação dos dois pontos de entrada foi verificada por **acionamento
programático do próprio handler da UI** e por carga direta da rota — não por clique físico de
mouse. Os handlers, o roteamento, a renderização e o consumo da API estão exercitados; o
caminho de entrada de mouse do sistema operacional não está. **Recomendação:** um clique manual
nos dois pontos de entrada, em navegador real, antes da coleta com avaliadores. É verificação de
segundos e fecha a única lacuna deste percurso.

Pelo mesmo motivo, este log traz **transcrição textual** do conteúdo renderizado (extraída da
página ao vivo) em vez de captura de tela.

---

## 6. Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `server/src/services/duration.ts` | **Novo** — `formatDuration`, função pura, sem dependências |
| `server/src/routes/config.ts` | **Novo** — `GET /api/config/retention` |
| `server/src/index.ts` | Registra `/api/config` |
| `client/src/pages/Privacy.tsx` | **Novo** — página de transparência |
| `client/src/App.tsx` | Rota `/privacidade` |
| `client/src/pages/EEMMForm.tsx` | Ponto de entrada no cabeçalho (apenas o cabeçalho; grid intocado) |
| `client/src/pages/PatientList.tsx` | Ponto de entrada no modal de exclusão |

Typecheck limpo nos dois pacotes (`tsc --noEmit`, exit 0).

---

## 7. O que este sprint NÃO resolve

1. **A redação do §4.10 continua incorreta.** O texto do TCC afirma purga "ao término de cada
   sessão"; o mecanismo real é expiração por tempo desde a criação, porque o artefato não tem
   sessão. A página nova diz a verdade — *"contados a partir do momento em que ele foi criado"* —
   e por isso **passa a divergir explicitamente do texto do TCC**. Corrigir o §4.10 (texto
   substituto pronto em `SPRINT_3_LOG.md` §5.2) ficou mais urgente, não menos: agora há uma tela
   no artefato que um examinador pode contrastar com a dissertação.
2. **A segregação entre dados operacionais e de pesquisa** continua sem estrutura no artefato, e
   continua dependendo da pergunta em aberto da Rodada 3 §6.3 (os instrumentos dos Apêndices C/D
   são externos à plataforma?). A página não afirma nada sobre dados de pesquisa — deliberadamente,
   para não prometer o que não existe.
3. **Responsividade** — a página nova usa layout de coluna única e se comporta razoavelmente em
   telas estreitas, mas não foi testada em viewport móvel, e o gap geral de breakpoints do
   projeto permanece.
