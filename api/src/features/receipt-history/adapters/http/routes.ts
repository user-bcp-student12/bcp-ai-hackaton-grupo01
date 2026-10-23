import {
  emptyInputSchema,
  errorResponseSchema,
  type ErrorResponse,
} from "@wallet/contracts";
import type { FastifyPluginCallback, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { paymentViewSchema, type PaymentView } from "../../domain/payment-view.js";

export type Participant = { walletId: string | null; active: boolean };

export type ReceiptHistoryRoutesDeps = {
  authenticate: (token: string) => Participant | null;
  history: (walletId: string) => PaymentView[];
  receipt: (walletId: string, paymentId: string) => PaymentView | null;
};

type Access =
  | { ok: true; walletId: string | null }
  | { ok: false; status: 401 | 403; body: ErrorResponse };

const safeError = (code: string, message: string): ErrorResponse => ({
  error: { code, message },
});

// The scheme is the literal "Bearer", one space, then a base64url token.
const bearerPattern = /^Bearer ([A-Za-z0-9_-]+)$/;
const paymentIdParamsSchema = z.strictObject({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
});
const historyResponseSchema = z.strictObject({
  payments: z.array(paymentViewSchema),
});
const receiptResponseSchema = z.strictObject({ receipt: paymentViewSchema });

export const receiptHistoryRoutes: FastifyPluginCallback<
  ReceiptHistoryRoutesDeps
> = (app, deps, done) => {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  // The wallet comes only from the session, never from the request.
  const authorize = (request: FastifyRequest): Access => {
    const match = bearerPattern.exec(request.headers.authorization ?? "");
    const participant = match?.[1] ? deps.authenticate(match[1]) : null;
    if (!participant) {
      return {
        ok: false,
        status: 401,
        body: safeError("UNAUTHENTICATED", "Sesión no válida."),
      };
    }
    if (!participant.active) {
      return {
        ok: false,
        status: 403,
        body: safeError("ACCOUNT_INACTIVE", "Cuenta inactiva."),
      };
    }
    return { ok: true, walletId: participant.walletId };
  };

  typed.get(
    "/api/v1/payments",
    {
      schema: {
        querystring: emptyInputSchema,
        response: {
          200: historyResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const access = authorize(request);
      if (!access.ok) {
        reply.code(access.status);
        return access.body;
      }
      // A user without a wallet has no movements.
      const payments =
        access.walletId === null ? [] : deps.history(access.walletId);
      return { payments };
    },
  );

  typed.get(
    "/api/v1/payments/:id/receipt",
    {
      schema: {
        params: paymentIdParamsSchema,
        response: {
          200: receiptResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const access = authorize(request);
      if (!access.ok) {
        reply.code(access.status);
        return access.body;
      }
      const receipt =
        access.walletId === null
          ? null
          : deps.receipt(access.walletId, request.params.id);
      // Unrelated and missing payments share this response, so existence is not revealed.
      if (!receipt) {
        reply.code(404);
        return safeError("PAYMENT_NOT_FOUND", "Pago no encontrado.");
      }
      return { receipt };
    },
  );

  done();
};
