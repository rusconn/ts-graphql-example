import type { Context } from "../../context.ts";
import type { Post } from "./mapper.ts";

export const getNode = async (context: Pick<Context, "db">, id: Post["id"]) => {
  const node = await context.db
    .selectFrom("Post")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return node as Post | undefined;
};
