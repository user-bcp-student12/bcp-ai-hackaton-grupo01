import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { ConfirmedOutcome } from "./registration-outcome";

type Props = { outcome: ConfirmedOutcome };

const COPY: Record<ConfirmedOutcome["kind"], { title: string; body: string }> =
  {
    active: {
      title: "Cuenta activa",
      body: "Tu verificación simulada fue aprobada y tu billetera ficticia ya está creada.",
    },
    pending: {
      title: "Verificación pendiente",
      body: "Tu cuenta quedó registrada, pero todavía no tiene billetera. No puedes operar con ella.",
    },
    rejected: {
      title: "Verificación rechazada",
      body: "La verificación simulada fue rechazada, así que no se creó billetera para esta cuenta.",
    },
  };

const NEXT_STEP: Record<ConfirmedOutcome["kind"], string> = {
  active: "Ingresar para ver mi billetera",
  pending: "Ingresar para ver mi estado",
  rejected: "Ingresar para ver mi estado",
};

export function RegistrationResult({ outcome }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const copy = COPY[outcome.kind];
  return (
    <section className="card" aria-labelledby="registration-result-title">
      <h2 id="registration-result-title" ref={headingRef} tabIndex={-1}>
        {copy.title}
      </h2>
      <p>{copy.body}</p>
      <div className="form-actions">
        <Link className="button-link" to="/ingresar">
          {NEXT_STEP[outcome.kind]}
        </Link>
      </div>
    </section>
  );
}
