import type * as Db from "../../../../infra/datasources/_shared/types.ts";
import { db as users } from "./users.ts";

export const db = {
  admin: {
    /** raw: 33e9adb5-d716-4388-86a1-6885e6499eec */
    token: "$2b$04$UJnbSNtlTFcLZkRtPqx2SOfFKP/ZA3jQO0o5tRZAaeK0emOmNmfX.",
    userId: users.admin.id,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  alice: {
    /** raw: a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c */
    token: "$2b$04$UJnbSNtlTFcLZkRtPqx2SOswuES4NFkKjP1rV9pb.SP037OP0ru/u",
    userId: users.alice.id,
    createdAt: new Date("2026-01-01T00:00:00.001Z"),
  },
} satisfies Record<string, Db.RefreshToken>;
