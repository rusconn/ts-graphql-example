import { UserRole } from "../../../db/types.ts";
import type { User } from "../../../models/user.ts";

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
    token: "0193cb69-740b-7589-9e85-34d9cece28fe",
  } as User,
  alice: {
    /** Date: 2024-12-15T17:41:58.590Z */
    id: "0193cb69-a4be-754e-a5a0-462df1202f5e",
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
    name: "Alice",
    email: "alice@alice.com",
    /** raw: alicealice */
    password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
    role: UserRole.USER,
    token: "0193cb69-c86c-747c-82b4-85506f4a592f",
  } as User,
};
