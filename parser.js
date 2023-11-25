import parseNumber from "./parseNumber.js";

export default function parse(str) {
  str = str.trim();

  if (str === "null") return null;
  if (str === "true") return true;
  if (str === "false") return false;

  if (str[0] === "-" || /\d/.test(str[0])) {
    if (!/^-?\d+(\.\d+)?([eE]\d+)?$/.test(str)) {
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
    const obj = {};

    let nextTokenResults = { token: undefined, restStr: str.slice(1) };
    do {
      // read key or '}' (if empty object)
      nextTokenResults = readNextToken(nextTokenResults.restStr);
      if (nextTokenResults.token === "}") continue;
      // TODO: ensure well-formed string
      const key = parse(nextTokenResults.token); // will be a string

      // read ':'
      nextTokenResults = readNextToken(nextTokenResults.restStr);
      if (nextTokenResults.token !== ":") {
        throw new Error(
          `Bad input: found ${nextTokenResults.token} in ${str} instead of ':'`
        );
      }

      // read val
      nextTokenResults = readNextToken(nextTokenResults.restStr);
      const val = parse(nextTokenResults.token);

      obj[key] = val;

      // read ',' or '}'
      nextTokenResults = readNextToken(nextTokenResults.restStr);
      if (![",", "}"].includes(nextTokenResults.token)) {
        throw new Error(
          `Bad input: expected ',' or '}', found ${nextTokenResults.token}`
        );
      }
    } while (nextTokenResults.token !== "}");

    return obj;
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

    // adding 1 to move endIdx past the end quote
    j = findStringEndQuoteIndex(str, i) + 1;
  } else if (str[i] === "[") {
    // array

    const nestingStack = ["["];
    for (j = i + 1; !(str[j] === "]" && nestingStack.length === 1); j++) {
      if (str[j] === '"') j = findStringEndQuoteIndex(str, j);
      if (str[j] === "[") nestingStack.push("[");
      if (str[j] === "]") nestingStack.pop();
    }

    // move endIdx past the end square bracket
    j += 1;
  } else if (str[i] === "{") {
    // object
    j += 1;
  } else if (["]", "}", ":", ","].includes(str[i])) {
    // "special" chars
    j = i + 1;
  } else {
    throw new Error(`UNRECOGNIZED | NOT_IMPLEMENTED: ${str[i]}`);
  }

  return { token: str.slice(i, j), restStr: str.slice(j) };
}

function findStringEndQuoteIndex(str, startQuoteIdx) {
  let endQuoteIdx;
  let inEscapeSeq = false;

  for (
    endQuoteIdx = startQuoteIdx + 1;
    str[endQuoteIdx] !== '"' || inEscapeSeq;
    endQuoteIdx++
  ) {
    if (str[endQuoteIdx] === "\\" && !inEscapeSeq) inEscapeSeq = true;
    else inEscapeSeq = false;
  }

  return endQuoteIdx;
}
