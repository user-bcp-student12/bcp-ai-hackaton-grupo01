import type { UserView } from "@wallet/contracts/onboarding";

export type ConfirmedOutcome =
  | { readonly kind: "active" }
  | { readonly kind: "pending" }
  | { readonly kind: "rejected" };

/** A response that contradicts the Contracts is never shown as a result. */
export type RegistrationOutcome =
  ConfirmedOutcome | { readonly kind: "unconfirmed" };

/**
 * Only `active` (activa with wallet) may claim a usable wallet. Pendiente and
 * rechazada must be inactive without a wallet, per the Contracts.
 */
export function resolveRegistrationOutcome(
  user: UserView,
): RegistrationOutcome {
  const hasWallet = user.walletId !== null;
  const inactiveWithoutWallet = !user.active && !hasWallet;
  switch (user.kycStatus) {
    case "activa":
      return user.active && hasWallet
        ? { kind: "active" }
        : { kind: "unconfirmed" };
    case "pendiente":
      return inactiveWithoutWallet
        ? { kind: "pending" }
        : { kind: "unconfirmed" };
    case "rechazada":
      return inactiveWithoutWallet
        ? { kind: "rejected" }
        : { kind: "unconfirmed" };
  }
}
