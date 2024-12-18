import { ORIGIN } from "../../src/config.ts";
import type { PostSelect } from "../../src/db/models.ts";
import { db } from "../../src/modules/common/testData/db/post.ts";
import { postId } from "../../src/modules/post/adapters/id.ts";
import * as internalId from "../../src/modules/post/internal/id.ts";
import type * as Graph from "../../src/schema.ts";

import { dateTime, dummySomeId } from "./common.ts";

const node = (post: PostSelect): Graph.Post => ({
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

export const dummyId = dummySomeId(postId, internalId.gen);
