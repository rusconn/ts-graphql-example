import { UserRole } from "../../../db/types.ts";
import type { UserFull } from "../../../models/user.ts";

export const db = {
  admin: {
    /** Date: 2024-12-15T17:41:37.938Z */
    id: "0193cb69-5412-759b-a780-8de48a4c054d",
    updatedAt: new Date("2024-12-15T17:41:58.591Z"),
    name: "Admin",
    email: "admin@admin.com",
    /** raw: adminadmin */
    password: "$2b$04$aIswdZ6eFo8qQTheMa8x1.s2sd7I9uZr.vUkGwl9OylshNLCMqH8i",
    role: UserRole.ADMIN,
    /** raw: 33e9adb5-d716-4388-86a1-6885e6499eec */
    token: "$2b$04$UJnbSNtlTFcLZkRtPqx2SOfFKP/ZA3jQO0o5tRZAaeK0emOmNmfX.",
  } as UserFull,
  alice: {
    /** Date: 2024-12-15T17:41:58.590Z */
    id: "0193cb69-a4be-754e-a5a0-462df1202f5e",
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
    name: "Alice",
    email: "alice@alice.com",
    /** raw: alicealice */
    password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
    role: UserRole.USER,
    /** raw: a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c */
    token: "$2b$04$UJnbSNtlTFcLZkRtPqx2SOswuES4NFkKjP1rV9pb.SP037OP0ru/u",
  } as UserFull,
};
