import parseNumber from "./parseNumber.js";

export default function parse(str) {
  if (str === "null") return null;
  if (str === "true") return true;
  if (str === "false") return false;

  if (str[0] === "-" || /\d/.test(str[0])) {
    return parseNumber(str);
  }

  if (str[0] === '"') return str.slice(1, str.length - 1);

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

  throw new Error(`NOT_IMPLEMENTED: ${str}`);
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
