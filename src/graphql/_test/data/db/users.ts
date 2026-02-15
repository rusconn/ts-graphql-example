import * as Db from "../../../../infra/datasources/_shared/types.ts";
import type { Uuidv7 } from "../../../../lib/uuid/v7.ts";

export const db = {
  admin: {
    id: "0193cb69-5412-759b-a780-8de48a4c054d" as Uuidv7,
    name: "Admin",
    email: "admin@example.com",
    role: Db.UserRole.Admin,
    createdAt: new Date("2024-12-15T17:41:37.938Z"),
    updatedAt: new Date("2024-12-15T17:41:58.591Z"),
  },
  alice: {
    id: "0193cb69-a4be-754e-a5a0-462df1202f5e" as Uuidv7,
    name: "Alice",
    email: "alice@example.com",
    role: Db.UserRole.User,
    createdAt: new Date("2024-12-15T17:41:58.590Z"),
    updatedAt: new Date("2024-12-15T17:41:58.590Z"),
  },
} satisfies Record<string, Db.User>;
