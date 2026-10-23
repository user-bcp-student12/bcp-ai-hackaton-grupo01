import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../lib/apiClient";
import type { PaymentsClient, ReceiptSession } from "./paymentsClient";

export const receiptHistoryKeys = {
  history: (walletId: string) =>
    ["receipt-history", "payments", walletId] as const,
  receipt: (walletId: string, paymentId: string) =>
    ["receipt-history", "receipt", walletId, paymentId] as const,
};

// A 4xx answer is final (not found, expired session), so it is not retried;
// outages and 5xx get two more attempts before the error state is shown.
export function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < 2;
}

export function usePaymentHistory(
  session: ReceiptSession,
  client: PaymentsClient,
) {
  return useQuery({
    queryKey: receiptHistoryKeys.history(session.walletId),
    queryFn: () => client.listPayments(session.accessToken),
    retry: shouldRetry,
  });
}

export function usePaymentReceipt(
  session: ReceiptSession,
  paymentId: string,
  client: PaymentsClient,
) {
  return useQuery({
    queryKey: receiptHistoryKeys.receipt(session.walletId, paymentId),
    queryFn: () => client.getReceipt(session.accessToken, paymentId),
    retry: shouldRetry,
  });
}
