import { useState, type SyntheticEvent } from "react";
import { registrationInputSchema } from "@wallet/contracts/onboarding";
import { PageShell } from "../../ui/PageShell";
import { RegistrationForm } from "./RegistrationForm";
import { RegistrationResult } from "./RegistrationResult";
import { useRegisterUser } from "./useRegisterUser";
import {
  INITIAL_VALUES,
  UNCONFIRMED_FEEDBACK,
  describeRegistrationError,
  fieldErrorsFromIssues,
  type FieldErrors,
  type RegistrationField,
  type RegistrationFeedback,
  type RegistrationFormValues,
} from "./registration-feedback";
import {
  resolveRegistrationOutcome,
  type ConfirmedOutcome,
} from "./registration-outcome";

export function RegistrationPage() {
  const [values, setValues] = useState<RegistrationFormValues>(INITIAL_VALUES);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const register = useRegisterUser();

  function setField<K extends RegistrationField>(
    field: K,
    value: RegistrationFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (register.isPending) return;
    const parsed = registrationInputSchema.safeParse(values);
    if (!parsed.success) {
      setClientErrors(fieldErrorsFromIssues(parsed.error.issues));
      return;
    }
    setClientErrors({});
    register.mutate(parsed.data);
  }

  const outcome = register.data
    ? resolveRegistrationOutcome(register.data.user)
    : undefined;
  const confirmed: ConfirmedOutcome | undefined =
    outcome && outcome.kind !== "unconfirmed" ? outcome : undefined;

  let feedback: RegistrationFeedback | undefined;
  if (register.isError) {
    feedback = describeRegistrationError(register.error);
  } else if (outcome?.kind === "unconfirmed") {
    feedback = UNCONFIRMED_FEEDBACK;
  }

  return (
    <PageShell title="Crear cuenta">
      {confirmed ? (
        <RegistrationResult outcome={confirmed} />
      ) : (
        <>
          <p>
            Registra una identidad ficticia para la demo. La verificación de
            identidad es simulada.
          </p>
          <RegistrationForm
            values={values}
            errors={{ ...clientErrors, ...feedback?.fieldErrors }}
            pending={register.isPending}
            feedback={feedback?.message}
            onFieldChange={setField}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </PageShell>
  );
}
