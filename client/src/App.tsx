import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PatientList from "./pages/PatientList";
import EEMMForm from "./pages/EEMMForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:id/eemm" element={<EEMMForm />} />
      </Routes>
    </BrowserRouter>
  );
}
