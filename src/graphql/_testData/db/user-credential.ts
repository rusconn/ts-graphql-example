import type { UserCredential } from "../../../models/user.ts";
import { db as users } from "./user.ts";

export const db = {
  admin: {
    userId: users.admin.id,
    /** raw: adminadmin */
    password: "$2b$04$aIswdZ6eFo8qQTheMa8x1.s2sd7I9uZr.vUkGwl9OylshNLCMqH8i",
    updatedAt: new Date("2024-12-15T17:41:58.591Z"),
  } as UserCredential,
  alice: {
    userId: users.alice.id,
    /** raw: alicealice */
    password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
  } as UserCredential,
};
