import type { SyntheticEvent } from "react";
import { SelectField } from "../../ui/SelectField";
import { StatusMessage } from "../../ui/StatusMessage";
import { TextField } from "../../ui/TextField";
import {
  type FieldErrors,
  type RegistrationField,
  type RegistrationFormValues,
} from "./registration-feedback";

type Props = {
  values: RegistrationFormValues;
  errors: FieldErrors;
  pending: boolean;
  feedback?: string;
  onFieldChange: <K extends RegistrationField>(
    field: K,
    value: RegistrationFormValues[K],
  ) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

export function RegistrationForm({
  values,
  errors,
  pending,
  feedback,
  onFieldChange,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} noValidate aria-busy={pending}>
      <SelectField
        id="documentType"
        label="Tipo de documento"
        value={values.documentType}
        error={errors.documentType}
        onChange={(event) => {
          onFieldChange(
            "documentType",
            event.target.value === "CE" ? "CE" : "DNI",
          );
        }}
      >
        <option value="DNI">DNI</option>
        <option value="CE">CE (carné de extranjería)</option>
      </SelectField>
      <TextField
        id="documentNumber"
        label="Número de documento"
        value={values.documentNumber}
        error={errors.documentNumber}
        autoComplete="off"
        onChange={(event) => {
          onFieldChange("documentNumber", event.target.value);
        }}
      />
      <TextField
        id="phone"
        label="Celular (Perú)"
        type="tel"
        value={values.phone}
        error={errors.phone}
        autoComplete="tel"
        onChange={(event) => {
          onFieldChange("phone", event.target.value);
        }}
      />
      <TextField
        id="email"
        label="Correo electrónico"
        type="email"
        value={values.email}
        error={errors.email}
        autoComplete="email"
        onChange={(event) => {
          onFieldChange("email", event.target.value);
        }}
      />
      <TextField
        id="password"
        label="Contraseña de 6 dígitos"
        type="password"
        inputMode="numeric"
        value={values.password}
        error={errors.password}
        autoComplete="new-password"
        onChange={(event) => {
          onFieldChange("password", event.target.value);
        }}
      />
      {feedback ? <StatusMessage tone="error">{feedback}</StatusMessage> : null}
      <div className="form-actions">
        <button type="submit" disabled={pending}>
          {pending ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </div>
    </form>
  );
}
