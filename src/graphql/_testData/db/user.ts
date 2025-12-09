import { type User, UserRole } from "../../../models/user.ts";

export const db = {
  admin: {
    /** Date: 2024-12-15T17:41:37.938Z */
    id: "0193cb69-5412-759b-a780-8de48a4c054d",
    name: "Admin",
    email: "admin@admin.com",
    role: UserRole.ADMIN,
    updatedAt: new Date("2024-12-15T17:41:58.591Z"),
  } as User,
  alice: {
    /** Date: 2024-12-15T17:41:58.590Z */
    id: "0193cb69-a4be-754e-a5a0-462df1202f5e",
    name: "Alice",
    email: "alice@alice.com",
    role: UserRole.USER,
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
  } as User,
};
