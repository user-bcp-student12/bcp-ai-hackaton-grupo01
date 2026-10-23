import { Link } from "react-router";
import { PageShell } from "../../ui/PageShell";
import { StatusMessage } from "../../ui/StatusMessage";

// Placeholder for the login route from the auth change, so the registration
// next-step link never lands on a blank screen. Auth replaces this page.
export function LoginPendingPage() {
  return (
    <PageShell title="Ingresar">
      <StatusMessage tone="info">
        El ingreso todavía no está disponible en esta versión de la demo.
      </StatusMessage>
      <p>
        <Link to="/registro">Volver a crear cuenta</Link>
      </p>
    </PageShell>
  );
}
