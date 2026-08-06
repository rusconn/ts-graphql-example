import type { Uuidv7 } from "../../../../util/uuid/v7.ts";

export type Key = {
  userId: Uuidv7;
  status?: "done" | "pending";
  search?: string;
};
