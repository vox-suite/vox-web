import assert from "node:assert/strict";
import test from "node:test";
import {
  RecordingAuthEmailSender,
  SmtpAuthEmailSender,
} from "../src/lib/consumer-auth/email";

test("recording email adapter captures a passwordless code without logging it", async () => {
  const sender = new RecordingAuthEmailSender();
  await sender.sendOneTimeCode({
    email: "person@example.test",
    code: "12345678",
    expiresInMinutes: 10,
  });
  assert.deepEqual(sender.latestFor("person@example.test"), {
    code: "12345678",
    expiresInMinutes: 10,
  });
});

test("SMTP email adapter sends a bounded Vox recovery message", async () => {
  let captured: Record<string, unknown> | undefined;
  const sender = new SmtpAuthEmailSender("Vox <hello@voxagent.in>", {
    sendMail: async (message) => {
      captured = message as Record<string, unknown>;
    },
  });
  await sender.sendOneTimeCode({
    email: "person@example.test",
    code: "87654321",
    expiresInMinutes: 10,
  });
  assert.equal(captured?.to, "person@example.test");
  assert.equal(captured?.from, "Vox <hello@voxagent.in>");
  assert.match(String(captured?.text), /87654321/);
  assert.match(String(captured?.text), /10 minutes/);
  assert.doesNotMatch(String(captured?.text), /password/i);
});
