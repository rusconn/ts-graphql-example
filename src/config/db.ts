import process from "node:process";

const { DATABASE_URL } = process.env;

if (DATABASE_URL == null) {
  throw new Error("Invalid DATABASE_URL");
}

const connectionString = DATABASE_URL;

export { connectionString };
