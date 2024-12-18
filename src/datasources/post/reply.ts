import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Post } from "../../db/models/post.ts";

export class PostReplyAPI {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  // TODO: dataloaderを使う
  loadPage = async (
    id: Post["id"],
    {
      cursor,
      limit,
      reverse,
    }: {
      cursor?: Post["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const page = await this.#db
      .selectFrom("Post")
      .where("parentId", "=", id)
      .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("id", comp, cursor!)))
      .selectAll()
      .orderBy("id", direction)
      .limit(limit)
      .execute();

    return page as Post[];
  };

  // TODO: dataloaderを使う
  loadCount = async (id: Post["id"]) => {
    const result = await this.#db
      .selectFrom("Post")
      .where("parentId", "=", id)
      .select(({ fn }) => fn.count("id").as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };
}
