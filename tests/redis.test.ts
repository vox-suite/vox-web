import assert from "node:assert/strict";
import test from "node:test";
import { editableRedisType, parseRedisEditor } from "../src/lib/redis";

test("Redis strings preserve editor text exactly", () => {
  assert.equal(
    parseRedisEditor("string", '{\n  "name": "Vox"\n}'),
    '{\n  "name": "Vox"\n}',
  );
});

test("Redis collection editors accept bounded string arrays", () => {
  assert.deepEqual(parseRedisEditor("list", '["one", "two"]'), ["one", "two"]);
  assert.deepEqual(parseRedisEditor("hash", '["field", "value"]'), [
    "field",
    "value",
  ]);
  assert.deepEqual(parseRedisEditor("zset", '["member", 1.5]'), [
    "member",
    1.5,
  ]);
});

test("Redis collection editors reject invalid or empty shapes", () => {
  assert.throws(() => parseRedisEditor("list", "[]"));
  assert.throws(() => parseRedisEditor("hash", '["field"]'));
  assert.throws(() => parseRedisEditor("set", '["valid", 2]'));
  assert.throws(() => parseRedisEditor("zset", '["member", "not-a-score"]'));
});

test("only replaceable Redis types can be edited", () => {
  for (const type of ["string", "list", "hash", "set", "zset"])
    assert.equal(editableRedisType(type), true);
  for (const type of ["stream", "none", "unknown"])
    assert.equal(editableRedisType(type), false);
});
