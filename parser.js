export default function parse(str) {
  if (str === "null") return null;
  if (str === "true") return true;
  if (str === "false") return false;

  if (str[0] === "-" || /\d/.test(str[0])) {
    return parseNumber(str);
  }

  if (str[0] === '"') return str.slice(1, str.length - 1);

  throw new Error("NOT_IMPLEMENTED");
}

// WARN: doesn't handle integers > Number.MAX_SAFE_INTEGER correctly
function parseNumber(str) {
  let n = 0;
  let isNegative = str[0] === "-";

  let i = isNegative ? 1 : 0;
  while (/\d/.test(str[i])) {
    n = n * 10 + (str[i].charCodeAt(0) - "0".charCodeAt(0));
    i++;
  }

  if (str[i] === ".") {
    let j = i + 1;
    while (/\d/.test(str[j])) {
      // WARN: because floating point representation cannot represent
      //   every one of the infinitely many real numbers, the following
      //   operation is going to introduce small deviations from the
      //   correct answer
      n += str[j] * 10 ** -(j - i);
      j++;
    }

    i = j;
  }

  if (["e", "E"].includes(str[i])) {
    const exponent = parseNumber(str.slice(i + 1));
    for (let j = 0; j < exponent; j++) n *= 10;
  }

  return n * (isNegative ? -1 : 1);
}
