import { baseUrl } from "../../src/config.ts";
import { postId } from "../../src/graphql/_adapters/post/id.ts";
import { db } from "../../src/graphql/_testData/db/post.ts";
import type { Post } from "../../src/models/post.ts";
import * as PostId from "../../src/models/post/id.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime } from "./common.ts";

const node = (post: Post): Graph.Post => ({
  id: postId(post.id),
  createdAt: dateTime(PostId.date(post.id)),
  updatedAt: dateTime(post.updatedAt),
  content: post.content,
  hasUpdated: PostId.date(post.id) !== post.updatedAt,
  url: `${baseUrl}/posts/${post.id}` as Exclude<Graph.Post["url"], undefined>,
});

export const graph = {
  alicePost1: node(db.alicePost1),
  alicePost2: node(db.alicePost2),
  alicePost3: node(db.alicePost3),
  alicePost4: node(db.alicePost4),
  bobPost1: node(db.bobPost1),
};

export { db };

export const dummyId = () => postId(PostId.gen());
