import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { receiptHistoryKeys } from "./usePayments";

export const PAYMENT_SUCCEEDED_EVENT = "wallet:payment-succeeded";

/**
 * Called by the payment flow once a payment is confirmed, so any open history
 * refetches instead of showing the old list.
 */
export function announcePaymentSucceeded(): void {
  window.dispatchEvent(new Event(PAYMENT_SUCCEEDED_EVENT));
}

export function useInvalidateHistoryOnPaymentSucceeded(walletId: string): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    function invalidate() {
      void queryClient.invalidateQueries({
        queryKey: receiptHistoryKeys.history(walletId),
      });
    }
    window.addEventListener(PAYMENT_SUCCEEDED_EVENT, invalidate);
    return () => {
      window.removeEventListener(PAYMENT_SUCCEEDED_EVENT, invalidate);
    };
  }, [queryClient, walletId]);
}
