import assert from "node:assert/strict";
import { describe, it } from "node:test";

import parse from "./parser.js";

describe("json parser", () => {
  it("parses null correctly", () => {
    assert(parse("null") === null);
  });

  it("parses boolean values correctly", () => {
    assert(parse("true") === true);
    assert(parse("false") === false);
  });

  it("parses numbers correctly", () => {
    assert.equal(parse("0"), 0);
    assert.equal(parse("3"), 3);
    assert.equal(parse("03"), 3);
    assert.equal(parse("-3"), -3);
    assert.equal(parse("-3e3"), -3000);
    assertNumbersAlmostEqual(parse("0.14159"), 0.14159);
    assertNumbersAlmostEqual(parse("3.14159"), 3.14159);
    assertNumbersAlmostEqual(parse("3.14159e3"), 3141.59);
    assertNumbersAlmostEqual(parse("3.14159e5"), 314159);
    assertNumbersAlmostEqual(parse("3.14159e6"), 3141590);
  });

  it("parses strings correctly", () => {
    assert.equal(parse('""'), "");
    assert.equal(parse('"a"'), "a");
    assert.equal(parse('"abcDEF"'), "abcDEF");
  });

  it("parses arrays correctly", () => {
    // arrays of primitives
    assert.deepEqual(parse(JSON.stringify([])), []);

    assert.deepEqual(parse(JSON.stringify([null, true, false])), [
      null,
      true,
      false,
    ]);
    assert.notDeepEqual(parse(JSON.stringify([null, true, false])), [
      null,
      false,
      true,
    ]);

    assert.deepEqual(parse(JSON.stringify([1, 2, 3])), [1, 2, 3]);

    assert.deepEqual(parse(JSON.stringify([1, "2", "abc"])), [1, "2", "abc"]);
    assert.notDeepEqual(parse(JSON.stringify([1, "2", "abc"])), [
      1,
      "abc",
      "2",
    ]);

    assert.deepEqual(
      parse(JSON.stringify([1, true, "2", null, false, "", "abc"])),
      [1, true, "2", null, false, "", "abc"]
    );
  });
});

function assertNumbersAlmostEqual(x, y) {
  if (!numbersAlmostEqual(x, y)) throw new Error(`${x} !== ${y}`);
}

function numbersAlmostEqual(x, y, allowedDelta = 1e-6) {
  return Math.abs(x - y) < allowedDelta;
}
