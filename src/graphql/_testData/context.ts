import { db } from "./db/user.ts";

export const context = {
  ...db,
  guest: null,
};
