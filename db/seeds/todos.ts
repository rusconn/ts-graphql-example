import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import * as Domain from "../../src/domain/entities.ts";
import {
  type DB,
  type Todo,
  TodoStatus,
  type User,
} from "../../src/infrastructure/datasources/_shared/types.ts";
import type { Uuidv7 } from "../../src/util/uuid/v7.ts";

export async function seedMinimal(trx: Transaction<DB>) {
  const handTodos: Todo[] = [
    {
      id: "0193cb3e-5fdd-7264-9f70-1df63d84b251" as Uuidv7,
      title: "hoge todo 1",
      description: "hoge desc 1",
      status: TodoStatus.Pending,
      userId: "0193cb3e-504f-72e9-897c-2c71f389f3ad" as Uuidv7,
      createdAt: new Date("2024-12-15T16:54:42.909Z"),
      updatedAt: new Date("2024-12-15T16:54:44.697Z"),
    },
    {
      id: "0193cb3e-636d-742e-8cc9-02a6a85dbf00" as Uuidv7,
      title: "piyo todo 1",
      description: "piyo desc 1",
      status: TodoStatus.Done,
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      createdAt: new Date("2024-12-15T16:54:43.821Z"),
      updatedAt: new Date("2024-12-15T16:54:43.821Z"),
    },
    {
      id: "0193cb3e-66d7-7295-bbba-8fe8ec408177" as Uuidv7,
      title: "piyo todo 2",
      description: "piyo desc 2",
      status: TodoStatus.Pending,
      userId: "0193cb3e-58fe-772b-8306-412afa147cdd" as Uuidv7,
      createdAt: new Date("2024-12-15T16:54:44.695Z"),
      updatedAt: new Date("2024-12-15T16:54:44.696Z"),
    },
  ];

  await trx.insertInto("todos").values(handTodos).execute();
}

export async function seedBulk(trx: Transaction<DB>, userIds: User["id"][]) {
  const fakeTodos = userIds.flatMap(fakeDataOne);

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(fakeTodos, 5_000);
  const inserts = chunks.map((ts) => trx.insertInto("todos").values(ts).execute());

  await Promise.all(inserts);
}

function fakeDataOne(userId: User["id"], idx: number): Todo[] {
  const NUM_TODOS_PER_USER = 5;
  const DESC_SIZES = [
    0, 50, 50, 100, 100, 100, 200, 200, 200, 300, 300, 300, 500, 500, 1_000, 5_000,
  ] as const;

  return [...Array(NUM_TODOS_PER_USER)].map((_, i) => {
    const id = Domain.Todo.Id.create();
    const descSize = DESC_SIZES[(idx + i) % DESC_SIZES.length]!;

    return {
      id,
      title: `todo-${idx}-${i}`,
      description: "x".repeat(descSize),
      status: i % 2 === 0 ? TodoStatus.Pending : TodoStatus.Done,
      userId,
      createdAt: Domain.Todo.Id.date(id),
      updatedAt: Domain.Todo.Id.date(id),
    };
  });
}
