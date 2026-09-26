import { apiRequest } from "@/lib/api/http";

export function startRecoveryEnrollment() {
  return apiRequest<{ success: true }>("/api/account/recovery/start", {
    method: "POST",
    fallbackError:
      "A recovery code could not be sent. Please sign in again and retry.",
  });
}

export function confirmRecoveryEnrollment(code: string) {
  return apiRequest<{ success: true }>("/api/account/recovery/confirm", {
    method: "POST",
    body: { code },
    fallbackError:
      "That code is invalid or expired. Request a fresh code and retry.",
  });
}
