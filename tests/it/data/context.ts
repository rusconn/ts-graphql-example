import * as DBData from "./db";

export const { admin, alice, bob } = DBData;

export const guest = {
  id: "GUEST",
  role: "GUEST",
} as const;
