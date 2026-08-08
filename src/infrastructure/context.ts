import type { Kysely } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import type { AppContext } from "../application/context.ts";
import * as Dto from "../application/dto.ts";
import type { DB } from "./datasources/db/types.ts";
import { TodoQuery } from "./queries/todo.ts";
import { UserQuery } from "./queries/user.ts";
import { RefreshTokenReaderRepo } from "./repositories-read/refresh-token.ts";
import { TodoReaderRepo } from "./repositories-read/todo.ts";
import { UserReaderRepo } from "./repositories-read/user.ts";
import { UnitOfWork } from "./unit-of-work.ts";

export async function findAppContextUser(id: Dto.User.Type["id"], kysely: Kysely<DB>) {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && Dto.User.parseOrThrow(user);
}

export function createAppContext(input: {
  user: AppContext["user"];
  kysely: Kysely<DB>;
}): AppContext {
  const { user, kysely } = input;
  const kyselyReadonly = kysely as unknown as ReadonlyKysely<DB>;

  switch (user?.role) {
    case "ADMIN":
      return {
        role: user.role,
        user,
        queries: {
          todo: new TodoQuery(kyselyReadonly),
          user: new UserQuery(kyselyReadonly),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kyselyReadonly),
          todo: new TodoReaderRepo(kyselyReadonly, user.id),
          user: new UserReaderRepo(kyselyReadonly, user.id),
        },
        unitOfWork: new UnitOfWork(kysely, user.id),
      };
    case "USER":
      return {
        role: user.role,
        user,
        queries: {
          todo: new TodoQuery(kyselyReadonly, user.id),
          user: new UserQuery(kyselyReadonly, user.id),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kyselyReadonly),
          todo: new TodoReaderRepo(kyselyReadonly, user.id),
          user: new UserReaderRepo(kyselyReadonly, user.id),
        },
        unitOfWork: new UnitOfWork(kysely, user.id),
      };
    case undefined:
      return {
        role: "GUEST",
        user,
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kyselyReadonly),
          user: new UserReaderRepo(kyselyReadonly),
        },
        unitOfWork: new UnitOfWork(kysely),
      };
    default:
      throw new Error(user satisfies never);
  }
}
