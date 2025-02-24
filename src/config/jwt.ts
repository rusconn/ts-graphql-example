import process from "node:process";

const { SIGNING_KEY } = process.env;

if (SIGNING_KEY == null) {
  throw new Error("Invalid SIGNING_KEY");
}

const signingKey = new TextEncoder().encode(SIGNING_KEY);

export { signingKey };
