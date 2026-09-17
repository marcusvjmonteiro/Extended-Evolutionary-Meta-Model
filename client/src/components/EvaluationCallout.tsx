/**
 * Convite à avaliação por especialista. É o mesmo avaliador (psicólogo) quem
 * preenche os dois formulários — não são públicos distintos — por isso os
 * rótulos distinguem o TIPO de retorno (conteúdo clínico vs. problema técnico
 * da plataforma), não o papel de quem responde.
 *
 * Renderizado em toda tela do fluxo de uso para não depender de o avaliador
 * chegar até o fim de uma página específica para encontrá-lo.
 */
export default function EvaluationCallout() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
      <p className="text-sm font-semibold text-blue-900 mb-1">
        Este artefato é parte de uma pesquisa acadêmica
      </p>
      <p className="text-sm text-blue-900 leading-relaxed mb-3">
        Sua avaliação é o dado que esta pesquisa precisa coletar. Use o
        formulário de avaliação clínica para comentar a matriz e a formulação
        gerada, e o de problema técnico para relatar bugs ou comportamento
        inesperado da plataforma — durante o uso ou ao final dele.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href="https://forms.gle/DJVnxTSwJL1np2oYA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
        >
          Avaliação clínica
        </a>
        <a
          href="https://forms.gle/CKNVv5hm2oTBMqUj7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center text-sm font-medium text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 rounded-lg px-4 py-2 transition-colors"
        >
          Relatar problema técnico
        </a>
      </div>
    </div>
  );
}
