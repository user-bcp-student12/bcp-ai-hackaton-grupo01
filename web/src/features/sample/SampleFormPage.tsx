import { useState, type SyntheticEvent } from "react";
import { PageShell } from "../../ui/PageShell";
import { StatusMessage } from "../../ui/StatusMessage";
import { TextField } from "../../ui/TextField";

const MIN_NAME_LENGTH = 2;

export function SampleFormPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < MIN_NAME_LENGTH) {
      setSubmitted(false);
      setError(`Ingresa al menos ${String(MIN_NAME_LENGTH)} caracteres.`);
      return;
    }
    setError(undefined);
    setSubmitted(true);
  }

  return (
    <PageShell title="Formulario de ejemplo">
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="full-name"
          label="Nombre completo"
          value={name}
          error={error}
          autoComplete="name"
          onChange={(event) => {
            setName(event.target.value);
            setSubmitted(false);
          }}
        />
        <button type="submit">Enviar</button>
      </form>
      {submitted ? (
        <StatusMessage tone="success">Datos recibidos (demo).</StatusMessage>
      ) : null}
    </PageShell>
  );
}
