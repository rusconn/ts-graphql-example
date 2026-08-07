import process from "node:process";

export function get(key: string) {
  const val = process.env[key];
  if (val == null) {
    throw new Error(`${key} not set`);
  }

  return val;
}

export function getInt(key: string) {
  const val = get(key).trim();
  if (val === "") {
    throw new Error(`${key} must not be empty`);
  }

  const num = Number(val);
  if (!Number.isInteger(num)) {
    throw new Error(`${key} must be an integer`);
  }

  return num;
}

export function getBool(key: string) {
  const val = get(key).trim();
  if (val !== "true" && val !== "false") {
    throw new Error(`${key} must be "true" or "false"`);
  }

  return val === "true";
}
