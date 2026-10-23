import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import {
  registrationResponseSchema,
  type RegistrationInput,
} from "@wallet/contracts/onboarding";
import type { z } from "zod";
import { postJson } from "../../lib/apiClient";

export type RegistrationResponse = z.infer<typeof registrationResponseSchema>;

export function useRegisterUser(): UseMutationResult<
  RegistrationResponse,
  Error,
  RegistrationInput
> {
  return useMutation({
    mutationFn: (input: RegistrationInput) =>
      postJson("/users", input, registrationResponseSchema),
  });
}
