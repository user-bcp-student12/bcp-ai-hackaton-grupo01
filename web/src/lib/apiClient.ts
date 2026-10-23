import { errorResponseSchema } from "@wallet/contracts";
import type { z } from "zod";

const DEFAULT_ERROR_MESSAGE = "No se pudo completar la solicitud.";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function getJson<T>(
  path: string,
  schema: z.ZodType<T>,
  baseUrl: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    "/api/v1",
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "application/json" },
  });
  let body: unknown;
  try {
    body = (await response.json()) as unknown;
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    const parsed = errorResponseSchema.safeParse(body);
    throw new ApiError(
      parsed.success ? parsed.data.error.code : "HTTP_ERROR",
      parsed.success ? parsed.data.error.message : DEFAULT_ERROR_MESSAGE,
      response.status,
    );
  }

  return schema.parse(body);
}
