import process from "node:process";

const { MAX_DEPTH, MAX_COST } = process.env;

const maxDepth = Number(MAX_DEPTH);
const maxCost = Number(MAX_COST);

if (Number.isNaN(maxDepth)) {
  throw new Error("Invalid MAX_DEPTH");
}
if (Number.isNaN(maxCost)) {
  throw new Error("Invalid MAX_COST");
}

export { maxCost, maxDepth };
