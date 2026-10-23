# Prompt para el equipo: visibilidad del estado de pagos QR para comercios

Contexto: repo `bcp-ai-hackaton-grupo01` (Wallet Grupo 1, demo local de wallet en Perú). Stack real: Fastify 5 + TypeScript en `api/`, React + Vite en `web/`, SQLite (`node:sqlite`) para datos, contratos Zod compartidos en `packages/contracts/`. Lee `AGENTS.md` antes de actuar.

Equipo de 6 (PPT pública, slide 5): Jenny (PO, alcance y prioridades), Andres (arquitecto, contratos y modelo), German (AI Engineer, extracción estructurada y guardias de IA), Gladys (Security, accesos, privacidad y amenazas), Rosmery (QA, casos y evidencia) y Daniel (presenter y timekeeper, guion y tiempos). La implementación frontend, backend, datos y despliegue está por asignar.

Flujo real del repo: `conductor` (aprobación humana), `product-owner` (prioridades), `architect` (contratos), `orchestrator` (única autoridad de asignación de issues) y los workers `backend` y `frontend`.

## Objetivo

Planificar la feature **Visibilidad del estado de pagos QR para comercios** como un change de OpenSpec. No implementes código todavía.

## Alcance aprobado (PPT)

El MVP aprobado es pago a contacto. La PPT indica que el checkout merchant "requiere otro flujo e integración" y que el merchant queda fuera del primer flujo. Esta feature QR comercio no está en el alcance aprobado: requiere una decisión humana (Jenny, PO) antes de planificarla.

## Historia

Como pequeño comercio que cobra con QR, quiero ver el estado confiable de cada transacción de cliente, para decidir cuándo entregar el producto o servicio.

## Criterios de aceptación

1. El comercio ve cada intento de pago QR con una referencia única de transacción.
2. Cada intento muestra un estado actual dentro del conjunto de estados habilitado para el MVP.
3. La vista se actualiza cuando callbacks o eventos del proveedor cambian el estado.
4. El comercio filtra el historial de estados por fecha y referencia de transacción.

## Preguntas abiertas (decisión humana antes de implementar)

- Conjunto mínimo de estados para operación de comercios en el lanzamiento MVP.
- Canal de consulta del comercio: app, web o ambos.

## Pasos

1. Ejecuta el skill `plan-feature` con esta historia. El `conductor` pide la aprobación humana en chat; el `product-owner` recomienda prioridades p0/p1/p2.
2. Revisa las dependencias con lo ya fusionado en `main`: pagos (`payments`), historial y recibos (`receipt-history`) y `wallet-access`. No reabras issues cerrados. Si falta algo, propón un grupo nuevo.
3. Pide al `architect` que revise los contratos de API en `design.md` (sección Contracts) y los límites de confianza del callback del proveedor: validación de firma, idempotencia y sin datos personales en logs.
4. Entrega un único PR de spec con la change en `openspec/changes/<id>/`. Valida con `openspec validate --all --strict` y pasa `node scripts/orchestrate.mjs check`.
5. No crees issues a mano. El orquestador los genera cuando se fusiona el PR de spec.

## Reglas para no bloquear al equipo

- Divide la change en grupos pequeños que puedan ir en paralelo: contratos y estados (backend), vista de comercio (frontend) y filtros (frontend) con su test.
- Declara como dependencia solo lo que de verdad hace falta. Si un grupo de UI puede usar un mock de contrato, que no espere al de proveedor.
- Si una decisión humana bloquea, escribe la pregunta y las opciones en `.orchestrate/question.md` y ejecuta `node scripts/orchestrate.mjs park <N> --body-file .orchestrate/question.md`. No te quedes esperando.
- Cada PR debe quedar por debajo de unas 400 líneas. Usa Conventional Commits con `(#N)`.
- Nunca hagas push a `main` ni edites labels o assignees a mano.

## Entrega

- PR de spec con los grupos, las dependencias y las dos preguntas abiertas.
- Resumen en español de la decisión humana tomada.

Antes de lanzarlo, conviene resolver las dos preguntas abiertas con el dueño del producto. Si no, el equipo no podrá cerrar el conjunto de estados ni el canal de consulta.
