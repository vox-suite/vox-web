import { apiRequest } from "@/lib/api/http";
import type {
  CreateReminderInput,
  Reminder,
  ReminderDelivery,
} from "@/lib/consumer-auth/core-host-client";

export async function listReminders(signal?: AbortSignal) {
  const { reminders } = await apiRequest<{ reminders: Reminder[] }>(
    "/api/account/reminders",
    { signal, fallbackError: "Failed to load reminders from Core" },
  );
  return reminders;
}

export async function createReminder(input: CreateReminderInput) {
  const { reminder } = await apiRequest<{ reminder: Reminder }>(
    "/api/account/reminders",
    { method: "POST", body: input, fallbackError: "Failed to create reminder" },
  );
  return reminder;
}

export async function cancelReminder(reminderId: string) {
  const { reminder } = await apiRequest<{
    reminder: Reminder;
    disclosure: string;
  }>(`/api/account/reminders/${encodeURIComponent(reminderId)}/cancel`, {
    method: "POST",
    fallbackError: "Failed to cancel reminder",
  });
  return reminder;
}

export async function listReminderDeliveries(
  reminderId: string,
  signal?: AbortSignal,
) {
  const { deliveries } = await apiRequest<{ deliveries: ReminderDelivery[] }>(
    `/api/account/reminders/${encodeURIComponent(reminderId)}/deliveries`,
    { signal, fallbackError: "Failed to load delivery receipts" },
  );
  return deliveries;
}
