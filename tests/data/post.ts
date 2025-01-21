import { ORIGIN } from "../../src/config.ts";
import * as internalId from "../../src/db/models/post/id.ts";
import type { Post } from "../../src/graphql/Post/_mapper.ts";
import { postId } from "../../src/graphql/_adapters/post/id.ts";
import { db } from "../../src/graphql/_testData/db/post.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (post: Post): Graph.Post => ({
  id: postId(post.id),
  createdAt: dateTime(internalId.date(post.id)),
  updatedAt: dateTime(post.updatedAt),
  content: post.content,
  hasUpdated: internalId.date(post.id) !== post.updatedAt,
  url: `${ORIGIN}/posts/${post.id}`,
});

export const graph = {
  alicePost1: node(db.alicePost1),
  alicePost2: node(db.alicePost2),
  alicePost3: node(db.alicePost3),
  alicePost4: node(db.alicePost4),
  bobPost1: node(db.bobPost1),
};

export { db };

export const dummyId = () => postId(internalId.gen());
