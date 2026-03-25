import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Patient {
  id: number;
  name: string;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
}

interface ModalState {
  open: boolean;
  name: string;
  date_of_birth: string;
  notes: string;
  error: string;
  loading: boolean;
}

const initialModal: ModalState = {
  open: false,
  name: "",
  date_of_birth: "",
  notes: "",
  error: "",
  loading: false,
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const [date, time] = iso.split(" ");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y} ${time?.slice(0, 5) ?? ""}`;
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(initialModal);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!modal.name.trim()) {
      setModal((m) => ({ ...m, error: "O nome é obrigatório." }));
      return;
    }
    setModal((m) => ({ ...m, loading: true, error: "" }));
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modal.name.trim(),
          date_of_birth: modal.date_of_birth || undefined,
          notes: modal.notes || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setModal((m) => ({
          ...m,
          loading: false,
          error: data.error ?? "Erro ao criar paciente.",
        }));
        return;
      }
      setModal(initialModal);
      await load();
    } catch {
      setModal((m) => ({
        ...m,
        loading: false,
        error: "Erro de conexão com o servidor.",
      }));
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/patients/${id}`, { method: "DELETE" });
      setDeleteId(null);
      await load();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Formulação EEMM — lista de pacientes
            </p>
          </div>
          <button
            onClick={() => setModal({ ...initialModal, open: true })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Novo Paciente
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Carregando...</div>
          ) : patients.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              Nenhum paciente cadastrado.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Nome
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Data de Nascimento
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Cadastrado em
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}/eemm`)}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                      i < patients.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(p.date_of_birth)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatDateTime(p.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(p.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                        title="Excluir paciente"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Novo Paciente */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Novo Paciente
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={modal.name}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, name: e.target.value, error: "" }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Nome completo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={modal.date_of_birth}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, date_of_birth: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={modal.notes}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Observações iniciais..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              {modal.error && (
                <p className="text-sm text-red-600">{modal.error}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModal(initialModal)}
                disabled={modal.loading}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={modal.loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {modal.loading ? "Salvando..." : "Criar Paciente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Excluir paciente?
              </h2>
              <p className="text-sm text-gray-500">
                Todas as células da formulação EEMM serão removidas junto. Essa
                ação não pode ser desfeita.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
