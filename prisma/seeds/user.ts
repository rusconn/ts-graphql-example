import { faker } from "@faker-js/faker";
import { ulid } from "ulid";

import { UserRole, prisma } from "@/prisma/mod.ts";

export const seed = async () => {
  const handUsers = [
    {
      id: "01HFFYQP8GEG9ATV44YH6XNJ1V",
      name: "admin",
      email: "admin@admin.com",
      /** raw: adminadmin */
      password: "$2b$10$4YuHiiiZiodsyu7mx18d/OX7CaLC5uH61XX2nHddWabigsfDh87me",
      token: "01HFFYQP8HTEHXJJ3DSTVPPBC0",
      role: UserRole.ADMIN,
    },
    {
      id: "01HFFYQP8H8628NYKTK2ZCNCBV",
      name: "hoge",
      email: "hoge@hoge.com",
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
      token: "01HFFYQP8H9PRG5DKFES044S5D",
      role: UserRole.USER,
    },
    {
      id: "01HFFYQP8JMVAJ11XVZXDXVGQR",
      name: "piyo",
      email: "piyo@piyo.com",
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
      token: "01HFFYQP8JW273G541HW4TREQY",
      role: UserRole.USER,
    },
  ];

  const fakeUsers = fakeData(10_000);

  const users = [...handUsers, ...fakeUsers];

  await prisma.user.createMany({ data: users });

  return fakeUsers.map(user => user.id);
};

const fakeData = (numFakes: number) => {
  return [...Array(numFakes)].map((_, i) => fakeDataOne(i));
};

const fakeDataOne = (nth: number) => {
  const userId = ulid();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: userId,
    name: firstName + lastName,
    email: faker.internet.email({
      firstName,
      lastName: lastName + nth, // make unique
      allowSpecialCharacters: true,
    }),
    password: "dummy",
    token: ulid(),
    role: UserRole.USER,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
};
