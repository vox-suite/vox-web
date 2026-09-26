import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Reminder } from "@/lib/consumer-auth/core-host-client";
import {
  cancelReminder,
  createReminder,
  listReminderDeliveries,
  listReminders,
} from "./api";

export const reminderKeys = {
  all: ["reminders"] as const,
  list: () => [...reminderKeys.all, "list"] as const,
  deliveries: (reminderId: string) =>
    [...reminderKeys.all, "deliveries", reminderId] as const,
};

export const reminderQueries = {
  list: () =>
    queryOptions({
      queryKey: reminderKeys.list(),
      queryFn: ({ signal }) => listReminders(signal),
    }),
  deliveries: (reminderId: string) =>
    queryOptions({
      queryKey: reminderKeys.deliveries(reminderId),
      queryFn: ({ signal }) => listReminderDeliveries(reminderId, signal),
    }),
};

export function useReminders() {
  return useQuery(reminderQueries.list());
}

export function useReminderDeliveries(reminderId: string, enabled: boolean) {
  return useQuery({ ...reminderQueries.deliveries(reminderId), enabled });
}

function replaceReminder(reminder: Reminder) {
  return (current: Reminder[] | undefined) =>
    current?.map((r) => (r.id === reminder.id ? reminder : r));
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReminder,
    onSuccess: (reminder) => {
      queryClient.setQueryData<Reminder[]>(reminderKeys.list(), (current) => [
        reminder,
        ...(current ?? []),
      ]);
    },
  });
}

export function useCancelReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelReminder,
    onSuccess: (reminder) => {
      queryClient.setQueryData<Reminder[]>(
        reminderKeys.list(),
        replaceReminder(reminder),
      );
      void queryClient.invalidateQueries({
        queryKey: reminderKeys.deliveries(reminder.id),
      });
    },
  });
}
