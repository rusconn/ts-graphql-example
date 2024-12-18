import { faker } from "@faker-js/faker";
import { chunk } from "es-toolkit";
import type { Transaction } from "kysely";

import type { DB } from "../../src/db/generated/types.ts";
import * as userId from "../../src/db/models/user/id.ts";
import * as userToken from "../../src/db/models/user/token.ts";

export const seed = async (trx: Transaction<DB>) => {
  const handUsers = [
    {
      /** Date: 2024-12-15T17:41:37.938Z */
      id: "0193cb69-5412-759b-a780-8de48a4c054d",
      updatedAt: new Date("2024-12-15T17:41:58.591Z"),
      avatar: "https://example.com/avatars/alice",
      name: "alice",
      handle: "Alice",
      bio: "CS -> programmer",
      location: "U.S.",
      website: "https://example.com/websites/alice",
      email: "alice@example.com",
      /** raw: alicealice */
      password: "$2b$04$vox810wl680PtUOq1CPTL.lMhjWYsjFqVIMOmzrMIXKvqTh/XZ5Gy",
      token: "0193cb69-740b-7589-9e85-34d9cece28fe",
    },
    {
      /** Date: 2024-12-15T17:41:58.590Z */
      id: "0193cb69-a4be-754e-a5a0-462df1202f5e",
      updatedAt: new Date("2024-12-15T17:41:58.590Z"),
      avatar: "https://example.com/avatars/bob",
      name: "bob",
      handle: "Super Bob",
      bio: "plumber -> firefighter",
      location: "earth",
      website: "https://example.com/websites/bob",
      email: "bob@example.com",
      /** raw: bobbob */
      password: "$2b$04$9IEd9DQdN7oS7Vv8Vc7B3ONEOnK.f6cbNEs14MUDcYBMclIpLh/Ki",
      token: "0193cb69-c86c-747c-82b4-85506f4a592f",
    },
  ];

  const fakeUsers = fakeData(10_000);

  const users = [...handUsers, ...fakeUsers];

  // 一度に insert する件数が多いとエラーが発生するので小分けにしている
  const chunks = chunk(users, 5_000);
  const inserts = chunks.map((us) => trx.insertInto("User").values(us).execute());

  await Promise.all(inserts);

  return users.map((user) => user.id);
};

const fakeData = (numFakes: number) => {
  return [...Array(numFakes)].map((_, i) => fakeDataOne(i));
};

const fakeDataOne = (nth: number) => {
  const id = userId.gen();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id,
    updatedAt: faker.date.past(),
    avatar: null,
    name: firstName + nth, // make unique
    handle: faker.lorem.words(2),
    bio: "",
    location: "",
    website: "",
    email: faker.internet.email({
      firstName,
      lastName: lastName + nth, // make unique
      allowSpecialCharacters: true,
    }),
    password: "dummy",
    token: userToken.gen(),
  };
};
