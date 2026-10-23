import type { DatabaseSync } from "node:sqlite";
import type { PaymentQuery } from "../../application/ports.js";
import { paymentViewSchema, type PaymentView } from "../../domain/payment-view.js";

// Aliases map the snake_case columns of migration 004 to the PaymentView fields.
const selectPayments = `
  SELECT id,
         source_wallet_id AS sourceWalletId,
         destination_wallet_id AS destinationWalletId,
         recipient_type AS recipientType,
         amount_cents AS amountCents,
         currency,
         status,
         created_at AS createdAt
  FROM payments`;

// Statements are prepared per call: the payments table arrives with its own migration.
export class SqlitePaymentQueries implements PaymentQuery {
  constructor(private readonly database: DatabaseSync) {}

  listForWallet(walletId: string): PaymentView[] {
    return this.database
      .prepare(`${selectPayments} WHERE source_wallet_id = ? OR destination_wallet_id = ?`)
      .all(walletId, walletId)
      .map((row) => paymentViewSchema.parse(row));
  }

  findForWallet(paymentId: string, walletId: string): PaymentView | null {
    const row = this.database
      .prepare(
        `${selectPayments} WHERE id = ? AND (source_wallet_id = ? OR destination_wallet_id = ?)`,
      )
      .get(paymentId, walletId, walletId);
    return row === undefined ? null : paymentViewSchema.parse(row);
  }
}
