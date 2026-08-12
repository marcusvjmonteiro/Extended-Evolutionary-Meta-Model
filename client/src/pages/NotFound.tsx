import { useNavigate } from "react-router-dom";

/**
 * Rota-fallback. Antes deste sprint, qualquer URL nao declarada renderizava tela em
 * branco — sem 404 e sem mensagem — porque App.tsx nao tinha rota `*`.
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-4xl font-bold text-gray-300">404</p>
      <p className="text-gray-600 text-center">
        Página não encontrada.
      </p>
      <button
        onClick={() => navigate("/patients")}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Voltar à lista de pacientes
      </button>
    </div>
  );
}
