import type { DatabaseError } from "pg";

import { isRecord } from "../object/record.ts";

export const PgErrorCode = {
  ForeignKeyViolation: "23503",
  UniqueViolation: "23505",
} as const;

export const isPgError = (x: unknown): x is DatabaseError => {
  return isRecord(x) && "code" in x && "schema" in x && "table" in x && "column" in x;
};
