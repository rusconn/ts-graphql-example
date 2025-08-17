import process from "node:process";

export const get = (key: string) => {
  const val = process.env[key];
  if (val == null) {
    throw new Error(`${key} not set`);
  }
  return val;
};

export const getInt = (key: string) => {
  const val = get(key).trim();
  if (val === "") {
    throw new Error(`${key} must not be empty`);
  }
  const num = Number(val);
  if (!Number.isInteger(num)) {
    throw new Error(`${key} must be an integer`);
  }
  return num;
};
