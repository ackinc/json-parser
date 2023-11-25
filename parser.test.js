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
    assertNumbersAlmostEqual(parse("3.14159"), 3.14159);
    assertNumbersAlmostEqual(parse("3.14159e3"), 3141.59);
    assertNumbersAlmostEqual(parse("3.14159e5"), 314159);
    assertNumbersAlmostEqual(parse("3.14159e6"), 3141590);
  });
});

function assertNumbersAlmostEqual(x, y) {
  if (!numbersAlmostEqual(x, y)) throw new Error(`${x} !== ${y}`);
}

function numbersAlmostEqual(x, y, allowedDelta = 1e-6) {
  return Math.abs(x - y) < allowedDelta;
}
