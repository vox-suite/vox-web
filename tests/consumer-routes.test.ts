import assert from "node:assert/strict";
import test from "node:test";
import { consumerDestination, consumerHref } from "../src/lib/consumer-routes";

test("consumer routing isolates app.voxagent.in and keeps local /app paths", () => {
  assert.equal(consumerDestination("app.voxagent.in", "/"), "/app");
  assert.equal(
    consumerDestination("app.voxagent.in", "/sign-in"),
    "/app/sign-in",
  );
  assert.equal(
    consumerDestination("app.voxagent.in", "/account"),
    "/app/account",
  );
  assert.equal(consumerDestination("app.voxagent.in", "/auth/callback"), null);
  assert.equal(
    consumerDestination("app.voxagent.in", "/api/account/auth/session"),
    null,
  );
  assert.equal(consumerDestination("app.voxagent.in", "/app"), null);
  assert.equal(consumerDestination("app.voxagent.in.evil.test", "/"), null);
  assert.equal(consumerDestination("voxagent.in", "/"), null);
  assert.equal(consumerHref("app.voxagent.in", "/sign-in"), "/sign-in");
  assert.equal(consumerHref("localhost", "/sign-in"), "/app/sign-in");
});
