import * as Db from "../../../../infra/datasources/_shared/types.ts";
import type { Uuidv7 } from "../../../../lib/uuid/v7.ts";
import { db as users } from "./users.ts";

export const db = {
  admin1: {
    id: "0193cb6a-ec2f-70ad-9b08-8086c43b2d17" as Uuidv7,
    title: "admin todo 1",
    description: "admin todo 1",
    status: Db.TodoStatus.Pending,
    userId: users.admin.id,
    createdAt: new Date("2024-12-15T17:43:22.415Z"),
    updatedAt: new Date("2024-12-15T17:43:50.654Z"),
  },
  alice1: {
    id: "0193cb6b-0d55-711b-a11b-6eb96871a3a7" as Uuidv7,
    title: "alice todo 1",
    description: "alice todo 1",
    status: Db.TodoStatus.Pending,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:30.901Z"),
    updatedAt: new Date("2024-12-15T17:43:30.901Z"),
  },
  alice2: {
    id: "0193cb6b-37ae-716b-b774-a3c81db18659" as Uuidv7,
    title: "alice todo 2",
    description: "alice todo 2",
    status: Db.TodoStatus.Done,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:41.742Z"),
    updatedAt: new Date("2024-12-18T20:00:00.000Z"),
  },
  alice3: {
    id: "0193cb6b-5696-7022-bc97-98ecd41d1957" as Uuidv7,
    title: "alice todo 3",
    description: "alice todo 3",
    status: Db.TodoStatus.Pending,
    userId: users.alice.id,
    createdAt: new Date("2024-12-15T17:43:49.654Z"),
    updatedAt: new Date("2024-12-17T17:43:49.654Z"),
  },
} satisfies Record<string, Db.Todo>;
