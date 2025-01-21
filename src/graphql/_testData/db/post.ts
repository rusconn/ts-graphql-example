import type { Post } from "../../../models/post.ts";
import { db as users } from "./user.ts";

export const db = {
  alicePost1: {
    /** Date: 2024-12-15T17:43:22.415Z */
    id: "0193cb6a-ec2f-70ad-9b08-8086c43b2d17",
    updatedAt: new Date("2024-12-15T17:43:50.654Z"),
    content: "oh",
    parentId: null,
    authorId: users.alice.id,
  } as Post,
  alicePost2: {
    /** Date: 2024-12-15T17:43:30.901Z */
    id: "0193cb6b-0d55-711b-a11b-6eb96871a3a7",
    updatedAt: new Date("2024-12-15T17:43:30.901Z"),
    content: "hello",
    parentId: null,
    authorId: users.alice.id,
  } as Post,
  alicePost3: {
    /** Date: 2024-12-15T17:43:41.742Z */
    id: "0193cb6b-37ae-716b-b774-a3c81db18659",
    updatedAt: new Date("2024-12-15T17:43:41.742Z"),
    content: "no",
    parentId: "0193cb6a-ec2f-70ad-9b08-8086c43b2d17",
    authorId: users.alice.id,
  } as Post,
  alicePost4: {
    /** Date: 2024-12-19T06:36:21.059Z */
    id: "0193dda1-aec3-744e-9392-5a3abd00df20",
    updatedAt: new Date("2024-12-19T06:36:21.059Z"),
    content: "!!",
    parentId: "0193cb6b-37ae-716b-b774-a3c81db18659",
    authorId: users.alice.id,
  } as Post,
  bobPost1: {
    /** Date: 2024-12-15T17:43:49.654Z */
    id: "0193cb6b-5696-7022-bc97-98ecd41d1957",
    updatedAt: new Date("2024-12-15T17:43:49.654Z"),
    content: "nope",
    parentId: null,
    authorId: users.bob.id,
  } as Post,
};
