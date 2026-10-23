// @vitest-environment jsdom
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { App } from "./App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

test("Home shows the service as available when health responds ok", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        Response.json({ status: "ok", simulated: true }, { status: 200 }),
      ),
    ),
  );

  renderAt("/");

  expect(
    await screen.findByText("Servicio disponible."),
  ).toBeInTheDocument();
  expect(screen.getByText(/identidades y fondos ficticios/)).toBeVisible();
});

test("Home shows a loading state and then an alert when the API is down", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
  );

  renderAt("/");

  expect(screen.getByText("Comprobando el servicio…")).toBeVisible();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "No se pudo conectar con el servicio local",
  );
});

test("Sample form rejects a short name with an accessible error", async () => {
  renderAt("/ejemplo/formulario");

  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

  const input = screen.getByLabelText("Nombre completo");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription(
    "Ingresa al menos 2 caracteres.",
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Ingresa al menos 2 caracteres.",
  );
});

test("Sample form accepts a valid name", async () => {
  renderAt("/ejemplo/formulario");

  await userEvent.type(screen.getByLabelText("Nombre completo"), "Ana Pérez");
  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

  expect(screen.getByText("Datos recibidos (demo).")).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
