import process from "node:process";

const { DOMAIN, BASE_URL, PORT } = process.env;

if (DOMAIN == null) {
  throw new Error("Invalid DOMAIN_NAME");
}
if (BASE_URL == null) {
  throw new Error("Invalid BASE_URL");
}

const port = Number(PORT);

if (Number.isNaN(port)) {
  throw new Error("Invalid PORT");
}

const domain = DOMAIN;
const endpoint = `${BASE_URL}:${port}/graphql`;

export { domain, endpoint, port };
