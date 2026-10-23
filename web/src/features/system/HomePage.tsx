import { Link } from "react-router";
import { PageShell } from "../../ui/PageShell";
import { StatusMessage } from "../../ui/StatusMessage";
import { useHealth } from "./useHealth";

export function HomePage() {
  const health = useHealth();

  return (
    <PageShell title="Estado del servicio">
      {health.isPending ? (
        <StatusMessage tone="info">Comprobando el servicio…</StatusMessage>
      ) : null}
      {health.isError ? (
        <StatusMessage tone="error">
          No se pudo conectar con el servicio local. Revisa que la API esté
          en marcha.
        </StatusMessage>
      ) : null}
      {health.isSuccess ? (
        <StatusMessage tone="success">Servicio disponible.</StatusMessage>
      ) : null}
      <p>
        <Link to="/ejemplo/formulario">Ir al formulario de ejemplo</Link>
      </p>
    </PageShell>
  );
}
