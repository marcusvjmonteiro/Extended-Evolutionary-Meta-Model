import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PatientList from "./pages/PatientList";
import EEMMForm from "./pages/EEMMForm";
import Formulation from "./pages/Formulation";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:id/eemm" element={<EEMMForm />} />
        <Route path="/patients/:id/formulation" element={<Formulation />} />
        {/* Transparencia de armazenamento/retencao — segunda metade da Tarefa T8. */}
        <Route path="/privacidade" element={<Privacy />} />
        {/* Fallback: sem esta rota, URLs nao declaradas rendiam tela em branco. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
