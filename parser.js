import parseNumber from "./parseNumber.js";

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
