import * as DBData from "./db.ts";

export const { admin, alice } = DBData;

export const guest = {
  id: "01HEMZ1X89Q2AAMHWBE5AZ02BP",
  role: "GUEST",
} as const;
