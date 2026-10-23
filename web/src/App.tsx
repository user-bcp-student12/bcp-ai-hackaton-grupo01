import { Route, Routes } from "react-router";
import { HomePage } from "./features/system/HomePage";
import { SampleFormPage } from "./features/sample/SampleFormPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/ejemplo/formulario" element={<SampleFormPage />} />
    </Routes>
  );
}
