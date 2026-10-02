import assert from "node:assert/strict";
import test from "node:test";
import { readCoreHostConfig } from "../src/lib/consumer-auth/config";

const complete = {
  VOX_CORE_URL: "https://api.voxagent.in",
  VOX_HOST_CREDENTIAL_ID: "11111111-2222-4333-8444-555555555555",
  VOX_HOST_AUDIENCE: "vox-host:vox.production:vox-web",
  VOX_HOST_SECRET: "s".repeat(32),
};

test("Core features need only the Core URL and the signed host credential", () => {
  assert.equal(readCoreHostConfig({}), null);
  assert.deepEqual(readCoreHostConfig(complete), {
    baseUrl: complete.VOX_CORE_URL,
    hostCredential: {
      credentialId: complete.VOX_HOST_CREDENTIAL_ID,
      audience: complete.VOX_HOST_AUDIENCE,
      secret: complete.VOX_HOST_SECRET,
    },
  });
});

test("host configuration rejects incomplete or insecure remote access", () => {
  for (const name of [
    "VOX_HOST_CREDENTIAL_ID",
    "VOX_HOST_AUDIENCE",
    "VOX_HOST_SECRET",
  ]) {
    assert.throws(
      () => readCoreHostConfig({ ...complete, [name]: "" }),
      /required/,
    );
  }
  assert.throws(
    () =>
      readCoreHostConfig({
        ...complete,
        VOX_CORE_URL: "http://api.voxagent.in",
      }),
    /HTTPS/,
  );
  assert.throws(
    () => readCoreHostConfig({ ...complete, VOX_HOST_SECRET: "short" }),
    /at least 32/,
  );
});

test("mutation origin check compares the browser host rather than the internal Next URL", async () => {
  const { isSameOriginRequest } =
    await import("../src/lib/consumer-auth/request");
  assert.equal(
    isSameOriginRequest(
      new Request("http://localhost:3200/api/account/tasks", {
        headers: { host: "127.0.0.1:3200", origin: "http://127.0.0.1:3200" },
      }),
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      new Request("http://localhost:3200/api/account/tasks", {
        headers: { host: "127.0.0.1:3200", origin: "https://foreign.example" },
      }),
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(new Request("http://localhost:3200/api/account/tasks")),
    false,
  );
});
