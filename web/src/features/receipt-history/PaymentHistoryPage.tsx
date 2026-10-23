import { PageShell } from "../../ui/PageShell";
import { PaymentHistory } from "./PaymentHistory";
import type { PaymentsClient, ReceiptSession } from "./paymentsClient";
import { SignInRequired } from "./SignInRequired";
import "./receipt-history.css";

/**
 * Own transaction history. `session` comes from the auth session provider;
 * until it is wired, the page asks the visitor to sign in and sends no request.
 */
export function PaymentHistoryPage({
  session = null,
  client,
}: {
  session?: ReceiptSession | null;
  client?: PaymentsClient;
}) {
  return (
    <PageShell title="Movimientos">
      {session ? (
        <PaymentHistory session={session} client={client} />
      ) : (
        <SignInRequired />
      )}
    </PageShell>
  );
}
