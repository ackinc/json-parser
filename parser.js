import parseNumber from "./parseNumber.js";

export default function parse(str) {
  str = str.trim();

  if (str === "null") return null;
  if (str === "true") return true;
  if (str === "false") return false;

  if (str[0] === "-" || /\d/.test(str[0])) {
    if (!/^[1-9]\d*(\.\d+)?([eE]\d+)?$/.test(str)) {
      throw new Error(`MALFORMED_INPUT: ${str}`);
    }

    return parseNumber(str);
  }

  if (str[0] === '"') {
    if (str.length < 2 || str.at(-1) !== '"') {
      throw new Error(`MALFORMED_INPUT: ${str}`);
    }
    // WARN: not dealing with some edge cases:
    // - "abc\" (should throw malformed input error)
    return str.slice(1, str.length - 1);
  }

  // WARN: nested arrays not yet supported
  if (str[0] === "[") {
    const arr = [];
    let nextTokenResults;
    let remainingStr = str.slice(1);
    do {
      nextTokenResults = readNextToken(remainingStr);
      if (![",", "]"].includes(nextTokenResults.token)) {
        arr.push(parse(nextTokenResults.token));
      }
      remainingStr = nextTokenResults.restStr;
    } while (nextTokenResults.token !== "]");

    return arr;
  }

  if (str[0] === "{") {
    throw new Error(`NOT_IMPLEMENTED: ${str}`);
  }

  throw new Error(`MALFORMED_INPUT: ${str}`);
}

function readNextToken(str) {
  let i = 0; // startIdx
  let j; // endIdx

  while (/\s/.test(str[i])) i++;
  if (["n", "t", "f"].includes(str[i])) {
    // null | boolean
    for (j = i; /[a-z]/.test(str[j]); j++);
  } else if (str[i] === "-" || /\d/.test(str[i])) {
    // number
    for (j = i; /(\d|\.|e|E)/.test(str[j]); j++);
  } else if (str[i] === '"') {
    // string
    let inEscapeSeq = false;
    for (j = i + 1; !(str[j] === '"' && !inEscapeSeq); j++) {
      if (str[j] === "\\" && !inEscapeSeq) inEscapeSeq = true;
      else inEscapeSeq = false;
    }

    // move endIdx past the end quote
    j += 1;
  } else if (["[", "]", "{", "}", ",", ":"].includes(str[i])) {
    // "special" chars
    j = i + 1;
  } else {
    throw new Error(`UNRECOGNIZED | NOT_IMPLEMENTED: ${str[i]}`);
  }

  return { token: str.slice(i, j), restStr: str.slice(j) };
}
