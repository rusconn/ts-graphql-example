import type * as Db from "../../../../infra/datasources/_shared/types.ts";
import { db as users } from "./users.ts";

export const db = {
  admin: {
    userId: users.admin.id,
    /** raw: adminadmin */
    password: "$2b$04$aIswdZ6eFo8qQTheMa8x1.s2sd7I9uZr.vUkGwl9OylshNLCMqH8i",
  },
  alice: {
    userId: users.alice.id,
    /** raw: alicealice */
    password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
  },
} satisfies Record<string, Db.Credential>;
