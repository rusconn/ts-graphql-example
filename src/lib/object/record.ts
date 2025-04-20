export const isRecord = (x: unknown): x is Record<PropertyKey, unknown> => {
  return typeof x === "object" && x !== null && !Array.isArray(x);
};
