import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Like } from "../../db/models/like.ts";
import type { Post } from "../../db/models/post.ts";
import type { User } from "../../db/models/user.ts";

export class PostLikeAPI {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  // TODO: dataloaderを使う
  load = async (key: {
    postId: Post["id"];
    userId: Post["userId"];
  }) => {
    const like = await this.#db
      .selectFrom("Like")
      .where("userId", "=", key.userId)
      .where("postId", "=", key.postId)
      .selectAll()
      .executeTakeFirst();

    return like as Like | undefined;
  };

  // TODO: dataloaderを使う
  loadLikerPage = async (
    id: Post["id"],
    {
      cursor,
      limit,
      reverse,
    }: {
      cursor?: Like["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const page = await this.#db
      .selectFrom("Like")
      .innerJoin("User", "User.id", "Like.userId")
      .where("Like.postId", "=", id)
      .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Like.id", comp, cursor!)))
      .selectAll("User")
      .select("Like.id as lid")
      .orderBy("lid", direction)
      .limit(limit)
      .execute();

    return page as (User & { lid: Like["id"] })[];
  };

  // TODO: dataloaderを使う
  loadLikeCount = async (id: Post["id"]) => {
    const result = await this.#db
      .selectFrom("Like")
      .where("postId", "=", id)
      .select(({ fn }) => fn.count("postId").as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };
}
