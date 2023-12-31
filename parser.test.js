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

    // nested arrays
    assert.deepEqual(parse(JSON.stringify([[]])), [[]]);
    assert.deepEqual(parse(JSON.stringify([[1, 2]])), [[1, 2]]);
    assert.deepEqual(parse(JSON.stringify([true, [1, 2], ["a", "b"]])), [
      true,
      [1, 2],
      ["a", "b"],
    ]);
    assert.notDeepEqual(parse(JSON.stringify([true, [1, 2], ["a", "b"]])), [
      true,
      [1, 2, 3],
      ["a", "b"],
    ]);

    // multiple levels of nesting
    assert.deepEqual(
      parse(JSON.stringify(["a", "b", ["c", "d", ["e", "f", []]]])),
      ["a", "b", ["c", "d", ["e", "f", []]]]
    );

    // arrays with objects inside
    const members = [
      {
        name: { first: "A", last: "D" },
        age: 30,
        sex: "male",
        likes: ["tennis", "apple"],
      },
      {
        name: { first: "B", last: "E" },
        age: 31,
        sex: "male",
        likes: ["tennis", "banana"],
      },
      {
        name: { first: "C", last: "F" },
        age: 32,
        sex: "female",
        likes: ["bahamas", "tennis"],
      },
    ];
    assert.deepEqual(parse(JSON.stringify(members)), members);
  });

  it("parses objects correctly", () => {
    assert.deepEqual(parse(JSON.stringify({})), {});
    assert.deepEqual(parse(JSON.stringify({ a: 1, b: 2, c: true, d: null })), {
      a: 1,
      b: 2,
      c: true,
      d: null,
    });
    assert.deepEqual(
      parse(
        JSON.stringify({
          a: 1,
          b: 2,
          c: [true, false, null, "x", "y"],
          d: null,
        })
      ),
      {
        a: 1,
        b: 2,
        c: [true, false, null, "x", "y"],
        d: null,
      }
    );

    // objects with nested objects
    assert.deepEqual(parse(JSON.stringify({ a: {} })), { a: {} });
    assert.deepEqual(parse(JSON.stringify({ a: { b: { c: 3 } } })), {
      a: { b: { c: 3 } },
    });

    const deptDetails = {
      deptName: "Sales",
      foundingYear: 2004,
      headOfDept: null,
      members: [
        { id: 1, name: { first: "A", last: "B" } },
        { id: 2, name: { first: "C", last: "D" } },
      ],
    };
    assert.deepEqual(parse(JSON.stringify(deptDetails)), deptDetails);

    // newlines in input string are not a problem
    assert.deepEqual(parse(JSON.stringify(deptDetails, null, 2)), deptDetails);
  });
});

function assertNumbersAlmostEqual(x, y) {
  if (!numbersAlmostEqual(x, y)) throw new Error(`${x} !== ${y}`);
}

function numbersAlmostEqual(x, y, allowedDelta = 1e-6) {
  return Math.abs(x - y) < allowedDelta;
}
