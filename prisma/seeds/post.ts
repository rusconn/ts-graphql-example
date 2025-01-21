import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB, User } from "../../src/db/types.ts";
import * as PostId from "../../src/models/post/id.ts";
import { randInt } from "./common.ts";

export const seed = async (trx: Transaction<DB>, userIds: User["id"][]) => {
  const [aliceId, bobId, ...fakeUserIds] = userIds as [string, string, ...string[]];

  const handPosts = [
    {
      /** Date: 2024-12-15T17:43:22.415Z */
      id: "0193cb6a-ec2f-70ad-9b08-8086c43b2d17",
      updatedAt: new Date("2024-12-15T17:43:50.654Z"),
      content: "oh",
      parentId: null,
      authorId: aliceId,
    },
    {
      /** Date: 2024-12-15T17:43:30.901Z */
      id: "0193cb6b-0d55-711b-a11b-6eb96871a3a7",
      updatedAt: new Date("2024-12-15T17:43:30.901Z"),
      content: "hello",
      parentId: null,
      authorId: aliceId,
    },
    {
      /** Date: 2024-12-15T17:43:41.742Z */
      id: "0193cb6b-37ae-716b-b774-a3c81db18659",
      updatedAt: new Date("2024-12-15T17:43:41.742Z"),
      content: "no",
      parentId: "0193cb6a-ec2f-70ad-9b08-8086c43b2d17",
      authorId: aliceId,
    },
    {
      /** Date: 2024-12-19T06:36:21.059Z */
      id: "0193dda1-aec3-744e-9392-5a3abd00df20",
      updatedAt: new Date("2024-12-19T06:36:21.059Z"),
      content: "!!",
      parentId: "0193cb6b-37ae-716b-b774-a3c81db18659",
      authorId: aliceId,
    },
    {
      /** Date: 2024-12-15T17:43:49.654Z */
      id: "0193cb6b-5696-7022-bc97-98ecd41d1957",
      updatedAt: new Date("2024-12-15T17:43:49.654Z"),
      content: "nope",
      parentId: null,
      authorId: bobId,
    },
  ];

  const fakePosts = fakeData(fakeUserIds);

  const posts = [...handPosts, ...fakePosts];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(posts, 5_000);
  const inserts = chunks.map((ps) => trx.insertInto("Post").values(ps).execute());

  await Promise.all(inserts);
};

const fakeData = (userIds: User["id"][]) => {
  return userIds.flatMap(fakeDataOne);
};

const fakeDataOne = (userId: User["id"]) => {
  const numPosts = randInt(0, 10);

  return [...Array(numPosts)].map((_) => ({
    id: PostId.gen(),
    updatedAt: faker.date.past(),
    content: faker.lorem.words(randInt(1, 10)),
    parentId: null,
    authorId: userId,
  }));
};
