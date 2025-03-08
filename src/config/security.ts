import process from "node:process";

const { MAX_DEPTH, MAX_COMPLEXITY } = process.env;

const maxDepth = Number(MAX_DEPTH);
const maxComplexity = Number(MAX_COMPLEXITY);

if (Number.isNaN(maxDepth)) {
  throw new Error("Invalid MAX_DEPTH");
}
if (Number.isNaN(maxComplexity)) {
  throw new Error("Invalid MAX_COMPLEXITY");
}

export { maxComplexity, maxDepth };
