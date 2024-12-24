import type { Context } from "../../context.ts";
import type { Todo } from "./mapper.ts";

export const getNode = async (context: Pick<Context, "db">, id: Todo["id"]) => {
  const node = await context.db
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return node as Todo | undefined;
};
