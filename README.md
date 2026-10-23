# Wallet Grupo 1

Una wallet demo para Peru: onboarding claro y pagos cotidianos con dinero ficticio.
El registro lento y la incertidumbre al pagar dificultan las transferencias pequenas.
Este repositorio planifica una solucion simulada, no una wallet de produccion.

## Demo del corte

**23/10/2026, 12:30 Peru (17:30 UTC).** Alcance reducido aprobado; entrega aun no implementada.

1. Register a fictitious DNI or CE, phone, email and six-digit password.
2. Show deterministic local KYC: activa, pendiente or rechazada.
3. Log in using document type, number and password; inactive accounts see status only.
4. Show an active account's wallet and configurable fictitious PEN balance.

Pago a contacto, comprobante e historial son backlog **p1 posterior al corte**.
QR, biometria, reversos y conciliacion no forman parte de esta primera fase.
MAU, CAC y mejoras del funnel son metas de negocio posteriores, no resultados de esta demo.

## Tech stack

Fastify 5 + TypeScript, React + TypeScript (Vite), schemas Zod compartidos y SQLite
local en Node 24. Vitest, Fastify inject y Testing Library para pruebas.
Scaffold verificara compatibilidad e instalara versiones concretas.
KYC, saldo inicial y transferencias son locales y ficticios. El mock remoto
documentado no satisface este recorrido; no se conectan rieles financieros reales.

## Project structure

`web/` interfaz; `api/` servicios y datos; `packages/contracts/` schemas;
`tests/e2e/` recorridos; `openspec/` contratos y tareas; `docs/` guias;
`scripts/` automatizacion. Las carpetas de producto son planificadas, aun no creadas.
Ownership: [AGENTS.md](AGENTS.md#project-structure).

## Getting started

Consultar **Install** y **Dev** en [Commands](AGENTS.md#commands).
Los valores TODO indican trabajo pendiente de scaffold; no hay aplicacion ejecutable todavia.
La demo local fue aprobada como excepcion al despliegue publico.

## How we work

[Tablero del equipo](https://github.com/users/user-bcp-student36/projects/4),
[playbook](docs/playbook.md) y [setup](docs/setup/README.md).
Primero se revisan/fusionan las specs; el orquestador genera issues desde main.
Solo hay dos lanes: frontend y backend, repartidas entre las seis personas.
