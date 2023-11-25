import assert from "node:assert/strict";
import test from "node:test";

import parse from "./parser.js";

test("parses null correctly", () => {
  assert(parse("null") === null);
});

test("parses boolean values correctly", () => {
  assert(parse("true") === true);
  assert(parse("false") === false);
});
