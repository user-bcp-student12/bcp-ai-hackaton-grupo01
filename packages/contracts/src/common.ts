import { z } from "zod";

export const emptyInputSchema = z.strictObject({});
export const healthResponseSchema = z.strictObject({
  status: z.literal("ok"),
  simulated: z.literal(true),
});
export const errorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: z.string(),
    message: z.string(),
    details: z
      .array(z.strictObject({ field: z.string(), code: z.string() }))
      .optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
