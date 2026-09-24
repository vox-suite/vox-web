export const SENSITIVE_PREFERENCE_KEYS: readonly string[] = [
  "home_address",
  "work_address",
  "allergies",
  "dietary_medical",
  "passport_number",
  "identity_document",
  "payment_method_preference",
];

export const DELETION_DISCLOSURE =
  "Platform task entries and conversation turns are removed from active databases. " +
  "External service records (e.g. Amazon, Expedia, Uber, Twilio carrier receipts), " +
  "remote operator system logs, mandatory audit hold retention, and cold backups " +
  "(retained for 30 days before rolling expiration) cannot be retroactively destroyed. " +
  "Deleting task history DOES NOT undo, cancel, or refund completed external transactions.";
