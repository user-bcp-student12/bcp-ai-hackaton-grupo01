import { Link } from "react-router";
import { StatusMessage } from "../../ui/StatusMessage";

export function SignInRequired() {
  return (
    <div className="form-actions">
      <StatusMessage tone="info">
        Inicia sesión para ver tus movimientos.
      </StatusMessage>
      <Link className="button-link" to="/ingresar">
        Ingresar
      </Link>
    </div>
  );
}
