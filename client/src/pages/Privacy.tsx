import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Página de transparência de armazenamento e retenção (Tarefa T8, Apêndice C).
 *
 * Escrita para um leitor especialista em psicoterapia, NÃO necessariamente com
 * background técnico: sem jargão de infraestrutura, sem nome de tabela, sem
 * caminho de arquivo. O que o avaliador precisa conseguir responder depois de ler
 * esta página é: onde meus dados ficam, por quanto tempo, e como somem.
 *
 * NENHUM prazo é escrito no JSX. Todos vêm de GET /api/config/retention, que os lê
 * das mesmas constantes que a rotina de purga usa para operar. Se o prazo mudar por
 * configuração, esta página muda junto, sem redeploy do frontend — e, mais
 * importante, não tem como afirmar um prazo diferente do que o sistema pratica.
 */

interface RetentionConfig {
  ttlSeconds: number;
  ttlHuman: string;
  purgeIntervalSeconds: number;
  purgeIntervalHuman: string;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 px-5 py-5">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  const navigate = useNavigate();

  const [config, setConfig] = useState<RetentionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/config/retention");
        if (!res.ok) {
          setFailed(true);
          return;
        }
        setConfig(await res.json());
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /**
   * Prazo exibido. Em caso de falha da consulta, a página diz que não conseguiu
   * confirmar o prazo em vez de exibir um valor padrão — um número inventado aqui
   * seria exatamente o tipo de afirmação desacoplada do mecanismo que esta página
   * existe para evitar.
   */
  const ttl = config?.ttlHuman;
  const interval = config?.purgeIntervalHuman;

  const unavailable = (
    <span className="text-amber-700 font-medium">
      (não foi possível confirmar este prazo agora — recarregue a página)
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded"
            title="Voltar"
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
              Privacidade e Retenção de Dados
            </h1>
            <p className="text-xs text-gray-400">
              Onde as informações ficam, por quanto tempo e como são eliminadas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {loading && (
          <p className="text-sm text-gray-400">Carregando informações...</p>
        )}

        {!loading && (
          <>
            <Section title="Onde as informações ficam">
              <p>
                Tudo o que você registra fica guardado em um banco de dados
                <strong> local a esta instalação do aplicativo</strong>. As
                informações não são copiadas, sincronizadas ou enviadas para
                serviços de terceiros — não há integração com serviços de nuvem,
                de análise de uso ou de monitoramento.
              </p>
              <p>
                Também não existe nenhuma funcionalidade de exportação automática:
                o aplicativo não envia o conteúdo dos casos para lugar nenhum, nem
                por e-mail, nem por arquivo, nem em segundo plano.
              </p>
            </Section>

            <Section title="Por quanto tempo ficam guardadas">
              <p>
                Cada caso criado é mantido por, no máximo,{" "}
                <strong className="text-gray-900">{ttl ?? unavailable}</strong>,
                contados a partir do momento em que ele foi criado. Passado esse
                prazo, o caso é eliminado automaticamente, sem que ninguém precise
                fazer nada.
              </p>
              <p>
                Esse prazo cobre com folga uma sessão de inspeção e a consolidação
                das anotações logo depois, sem que o material fique guardado além
                do necessário.
              </p>
              {failed && (
                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  O prazo exibido acima vem diretamente da configuração em vigor no
                  servidor. Como a consulta não respondeu agora, preferimos não
                  exibir um número que poderia não corresponder ao real.
                </p>
              )}
            </Section>

            <Section title="Como são eliminadas">
              <p>
                O aplicativo executa uma <strong>rotina automática de exclusão</strong>{" "}
                que verifica periodicamente
                {interval ? (
                  <>
                    {" "}
                    — a cada{" "}
                    <strong className="text-gray-900">{interval}</strong> —
                  </>
                ) : (
                  " "
                )}{" "}
                se existem casos que já passaram do prazo, e apaga os que passaram.
                A verificação também acontece toda vez que o aplicativo é iniciado,
                de modo que um caso vencido não sobrevive a um período em que o
                sistema esteve desligado.
              </p>
              <p>
                Depois de apagar, o aplicativo{" "}
                <strong>consulta o banco de dados de novo para conferir</strong> se
                não sobrou nenhum registro daquele caso — nem os dados de
                identificação, nem nenhuma das células da formulação. Essa
                conferência é parte do desenho do artefato e já está implementada:
                a eliminação é confirmada, não apenas presumida.
              </p>
              <p className="text-gray-500">
                Quando um caso é excluído, todas as células da formulação EEMM
                associadas a ele são removidas na mesma operação. Não fica registro
                parcial.
              </p>
            </Section>

            <Section title="Você pode excluir a qualquer momento">
              <p>
                Não é preciso esperar o prazo automático. Na lista de casos, o botão
                de exclusão ao lado de cada caso o remove imediatamente, com a mesma
                conferência descrita acima.
              </p>
              <button
                onClick={() => navigate("/patients")}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Ir para a lista de casos →
              </button>
            </Section>

            {/*
              Aviso de escopo. Mesmo peso visual do disclaimer da formulação (HC3):
              é informação de proteção, não rodapé.
            */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-5 py-4">
              <p className="text-sm font-semibold text-amber-900 mb-2">
                Nenhum dado de paciente real deve ser inserido
              </p>
              <p className="text-sm text-amber-900 leading-relaxed">
                Todo o conteúdo registrado durante a inspeção é{" "}
                <strong>fictício</strong>, extraído das vinhetas clínicas fornecidas
                no roteiro de tarefas. Este aplicativo é um protótipo em avaliação e{" "}
                <strong>
                  não deve receber informação de pessoa real, identificada ou
                  identificável
                </strong>{" "}
                — nem nome, nem data de nascimento, nem conteúdo de atendimento.
              </p>
              <p className="text-sm text-amber-900 leading-relaxed mt-2">
                Se, por engano, algum dado real for inserido, exclua o caso
                imediatamente pela lista de casos.
              </p>
            </div>

            {config && (
              <p className="text-xs text-gray-400 leading-relaxed">
                Os prazos nesta página são lidos da configuração em vigor no
                servidor, a mesma que a rotina de exclusão usa para operar. Eles não
                são um texto fixo: se a configuração mudar, esta página muda junto.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
