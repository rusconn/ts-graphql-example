import * as Db from "../../db/types.ts";
import * as Domain from "../../domain/todo.ts";

export const mappers = {
  toDb(status: Domain.Todo["status"]): Db.Todo["status"] {
    return domainDbMap[status];
  },
  toDomain(status: Db.Todo["status"]): Domain.Todo["status"] {
    return dbDomainMap[status];
  },
};

const domainDbMap = {
  [Domain.TodoStatus.DONE]: Db.TodoStatus.Done,
  [Domain.TodoStatus.PENDING]: Db.TodoStatus.Pending,
} satisfies Record<Domain.Todo["status"], Db.Todo["status"]>;

const dbDomainMap = {
  [Db.TodoStatus.Done]: Domain.TodoStatus.DONE,
  [Db.TodoStatus.Pending]: Domain.TodoStatus.PENDING,
} satisfies Record<Db.Todo["status"], Domain.Todo["status"]>;
