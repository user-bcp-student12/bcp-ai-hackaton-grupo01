import type { PaymentView } from "../domain/payment-view.js";
import type { PaymentQuery } from "./ports.js";

// Ties on createdAt break on id, so the order is the same after a restart.
function compareNewestFirst(a: PaymentView, b: PaymentView): number {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  if (a.id === b.id) return 0;
  return a.id < b.id ? 1 : -1;
}

export function listPaymentHistory(
  payments: PaymentQuery,
): (walletId: string) => PaymentView[] {
  return (walletId) =>
    [...payments.listForWallet(walletId)].sort(compareNewestFirst);
}

export function getPaymentReceipt(
  payments: PaymentQuery,
): (walletId: string, paymentId: string) => PaymentView | null {
  return (walletId, paymentId) => payments.findForWallet(paymentId, walletId);
}
