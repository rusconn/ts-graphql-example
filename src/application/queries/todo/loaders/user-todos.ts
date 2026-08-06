import type { Uuidv7 } from "../../../../util/uuid/v7.ts";

export type Key = {
  userId: Uuidv7;
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
  cursor?: Uuidv7;
  limit: number;
  status?: "done" | "pending";
  search?: string;
};
