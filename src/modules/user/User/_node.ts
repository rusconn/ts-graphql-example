import type { Context } from "../../../context.ts";
import type { User } from "./_mapper.ts";

export const getNode = async (context: Pick<Context, "db">, id: User["id"]) => {
  const node = await context.db
    .selectFrom("User")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return node as User | undefined;
};
