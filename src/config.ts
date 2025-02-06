import process from "node:process";

import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    PORT: z.coerce.number().int().positive().default(4000),
    MAX_DEPTH: z.coerce.number().int().positive().default(10),
    MAX_COST: z.coerce.number().int().positive().default(10_000),
    PASS_HASH_EXP: z.coerce.number().int().positive().default(10),
    DATABASE_URL: z.string(),
    BASE_URL: z.string(),
  })
  .refine((e) => e.NODE_ENV !== "production" || (10 <= e.PASS_HASH_EXP && e.PASS_HASH_EXP <= 14), {
    path: ["PASS_HASH_EXP"],
  });

const configSchema = envSchema.transform(({ NODE_ENV, PORT, BASE_URL, ...rest }) => ({
  isDev: NODE_ENV === "development",
  isTest: NODE_ENV === "test",
  isProd: NODE_ENV === "production",
  PORT,
  endpoint: `${BASE_URL}:${PORT}/graphql`,
  ...rest,
}));

export const {
  isDev,
  isTest,
  isProd,
  PORT,
  MAX_DEPTH,
  MAX_COST,
  PASS_HASH_EXP,
  DATABASE_URL,
  endpoint,
} = configSchema.parse(process.env);
