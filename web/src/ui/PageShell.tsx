import type { ReactNode } from "react";
import { Link } from "react-router";

export const DEMO_DISCLAIMER =
  "Demo local: identidades y fondos ficticios. No es una billetera real.";

export function PageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell">
      <header className="page-header">
        <Link className="brand" to="/">
          Wallet Grupo 1
        </Link>
        <p className="disclaimer">{DEMO_DISCLAIMER}</p>
      </header>
      <main>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}
