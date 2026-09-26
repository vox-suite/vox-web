import { apiRequest } from "@/lib/api/http";
import type {
  DeleteHistoryResponse,
  PortableExportResponse,
} from "@/lib/consumer-auth/core-host-client";

export function deleteTaskHistory() {
  return apiRequest<DeleteHistoryResponse>("/api/account/privacy/history", {
    method: "DELETE",
    query: { delete_conversations: true },
    fallbackError: "Failed to delete task history",
  });
}

export type ExportCategory = "preferences" | "config" | "spans";

export function requestPortableExport(
  categories: ExportCategory[] = ["preferences", "config", "spans"],
) {
  return apiRequest<{ export: PortableExportResponse; disclosure: string }>(
    "/api/account/privacy/export",
    { method: "POST", body: { categories }, fallbackError: "Export failed" },
  );
}
