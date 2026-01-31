import type * as Db from "../db/types.ts";
import type * as Domain from "../domain/todo.ts";
import { mappers as status } from "./todo/status.ts";

export const mappers = {
  toDb: ({ status: status_, ...rest }: Domain.Todo): Db.Todo => ({
    ...rest,
    status: status.toDb(status_),
  }),
  toDomain: ({ id, status: status_, userId, ...rest }: Db.Todo): Domain.Todo => ({
    ...rest,
    id: id as Domain.Todo["id"],
    status: status.toDomain(status_),
    userId: userId as Domain.Todo["userId"],
  }),
  status,
};
