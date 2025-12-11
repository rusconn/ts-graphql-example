import type * as Db from "../../../db/types.ts";
import { db as users } from "./users.ts";

export const db = {
  admin: {
    userId: users.admin.id,
    token: "$2b$04$UJnbSNtlTFcLZkRtPqx2SOfFKP/ZA3jQO0o5tRZAaeK0emOmNmfX.",
    updatedAt: new Date("2024-12-15T17:41:58.591Z"),
  },
  alice: {
    userId: users.alice.id,
    /** raw: a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c */
    token: "$2b$04$UJnbSNtlTFcLZkRtPqx2SOswuES4NFkKjP1rV9pb.SP037OP0ru/u",
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
  },
} satisfies Record<string, Db.UserToken>;
