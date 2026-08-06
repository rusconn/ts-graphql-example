import type { Uuidv7 } from "../../../util/uuid/v7.ts";

export type FindByUserParams = {
  id: Uuidv7;
  userId: Uuidv7;
};

export type PageByUserParams = {
  userId: Uuidv7;
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
  cursor?: Uuidv7;
  limit: number;
  status?: "done" | "pending";
  search?: string;
};

export type CountByUserParams = {
  userId: Uuidv7;
  status?: "done" | "pending";
  search?: string;
};
