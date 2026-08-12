/**
 * Formatação de duração em português, para exibição ao usuário.
 *
 * Vive em módulo próprio, e não dentro de `purge.ts`, por um motivo prático: aquele
 * módulo importa `../database`, que ABRE uma conexão SQLite no momento do import.
 * Uma função pura de formatação não deve arrastar um banco junto para ser exercitada
 * — este arquivo não importa nada e pode ser testado isoladamente.
 *
 * Existe porque a página de transparência (Sprint 7A) precisa dizer "4 horas" onde o
 * backend guarda `14400`. A conversão acontece em UM lugar só: o servidor formata e
 * envia pronto, o frontend apenas exibe. Duplicar a lógica no cliente criaria a
 * possibilidade de os dois discordarem sobre o que 14400 significa.
 */

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * 60;

function plural(value: number, singular: string, pluralForm: string): string {
  return `${value} ${value === 1 ? singular : pluralForm}`;
}

/**
 * Converte segundos numa expressão legível: `14400` → `"4 horas"`,
 * `900` → `"15 minutos"`, `5400` → `"1 hora e 30 minutos"`.
 *
 * Trunca em minutos quando há horas: a página de transparência comunica uma política
 * de retenção, e "4 horas e 3 segundos" seria precisão sem informação. Abaixo de um
 * minuto, os segundos aparecem — é o caso do TTL curto usado para testar o mecanismo
 * de purga, e ali o número exato importa.
 *
 * Entrada inválida (negativa, não finita) devolve "0 segundos" em vez de lançar: esta
 * função alimenta uma página informativa, e derrubar a resposta por causa de uma
 * variável de ambiente malformada seria pior do que exibir um valor obviamente errado.
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0 segundos";
  }

  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);

  if (hours > 0) {
    const head = plural(hours, "hora", "horas");
    return minutes > 0
      ? `${head} e ${plural(minutes, "minuto", "minutos")}`
      : head;
  }

  if (minutes > 0) {
    return plural(minutes, "minuto", "minutos");
  }

  return plural(seconds, "segundo", "segundos");
}
