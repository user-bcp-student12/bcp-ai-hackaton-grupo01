import type { ReactNode } from "react";

export type StatusTone = "info" | "success" | "error";

export function StatusMessage({
  tone,
  children,
}: {
  tone: StatusTone;
  children: ReactNode;
}) {
  const isError = tone === "error";
  return (
    <p
      className={`status status-${tone}`}
      role={isError ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
