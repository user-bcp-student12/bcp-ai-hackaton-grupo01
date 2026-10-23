import type { PaymentView } from "../domain/payment-view.js";

// Both queries return only payments where the wallet is the source or the destination.
export interface PaymentQuery {
  listForWallet(walletId: string): PaymentView[];
  findForWallet(paymentId: string, walletId: string): PaymentView | null;
}
