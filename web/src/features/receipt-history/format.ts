import type { PaymentView } from "./paymentsClient";

export type PaymentDirection = "incoming" | "outgoing";

/**
 * Direction from the viewer's wallet. `undefined` means the wallet does not
 * participate in the payment, so it must not be shown to this viewer.
 */
export function directionFor(
  payment: PaymentView,
  walletId: string,
): PaymentDirection | undefined {
  if (payment.destinationWalletId === walletId) return "incoming";
  if (payment.sourceWalletId === walletId) return "outgoing";
  return undefined;
}

const DIRECTION_LABELS: Readonly<Record<PaymentDirection, string>> = {
  incoming: "Recibido",
  outgoing: "Enviado",
};

export function directionLabel(direction: PaymentDirection): string {
  return DIRECTION_LABELS[direction];
}

const penFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

/** Integer minor units (céntimos) to a PEN label. Only formats; never sums. */
export function formatPen(amountCents: number): string {
  return penFormatter.format(amountCents / 100);
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatPaymentDate(isoDateTime: string): string {
  return dateFormatter.format(new Date(isoDateTime));
}
