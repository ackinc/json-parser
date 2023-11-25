export default function parse(str) {
  if (str === "null") return null;
  if (str === "true") return true;
  if (str === "false") return false;

  throw new Error("NOT_IMPLEMENTED");
}
