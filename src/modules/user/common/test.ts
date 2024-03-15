import * as Prisma from "@/prisma/mod.ts";
import { userNodeId } from "./adapter.ts";

export const db = {
  admin: {
    id: "01H75CPZGG1YW9W79M7WWT6KFB",
    createdAt: new Date(0),
    updatedAt: new Date(2),
    name: "Admin",
    email: "admin@admin.com",
    /** raw: adminadmin */
    password: "$2b$04$aIswdZ6eFo8qQTheMa8x1.s2sd7I9uZr.vUkGwl9OylshNLCMqH8i",
    role: Prisma.UserRole.ADMIN,
    token: "01H77AB3NYGD7B1N3XRPKD8JTN",
  },
  alice: {
    id: "01H75CPZV2VWQPCXTBKXCQ50A2",
    createdAt: new Date(1),
    updatedAt: new Date(1),
    name: "Alice",
    email: "alice@alice.com",
    /** raw: alicealice */
    password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
    role: Prisma.UserRole.USER,
    token: "01H77ABA8TDGSQ2XJVV57A0BEV",
  },
} as const;

export const context = {
  ...db,
  guest: {
    id: undefined,
    role: "GUEST",
  },
} as const;

export const validUserIds = Object.values(db).map(({ id }) => userNodeId(id));

export const invalidUserIds = [
  "Usr:01H75CPZGG1YW9W79M7WWT6KFB",
  "User01H75CPZGG1YW9W79M7WWT6KFB",
  "01H75CPZGG1YW9W79M7WWT6KFB",
  ":01H75CPZGG1YW9W79M7WWT6KFB",
  "01H75CPZGG1YW9W79M7WWT6KFB:User",
  "",
  "Todo:01H75CR8C6PQK7Z7RE4FBY1B4M",
] as const;
