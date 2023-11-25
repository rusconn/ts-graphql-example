import { prisma, UserRole, TodoStatus } from "@/prisma/mod.ts";

const main = async () => {
  const data = [
    {
      id: "01HFFYQP8GEG9ATV44YH6XNJ1V",
      name: "admin",
      email: "admin@admin.com",
      /** raw: adminadmin */
      password: "$2b$10$4YuHiiiZiodsyu7mx18d/OX7CaLC5uH61XX2nHddWabigsfDh87me",
      token: "01HFFYQP8HTEHXJJ3DSTVPPBC0",
      role: UserRole.ADMIN,
      todos: [],
    },
    {
      id: "01HFFYQP8H8628NYKTK2ZCNCBV",
      name: "hoge",
      email: "hoge@hoge.com",
      /** raw: hogehoge */
      password: "$2b$10$RjosB2FTBUCsjBsZm0OmiO3jpWqNmt54ybRybC5C1LnUkERwOSzji",
      token: "01HFFYQP8H9PRG5DKFES044S5D",
      role: UserRole.USER,
      todos: [
        {
          id: "01HFFZ0ABV8BJPJX50Z2PJ3DR9",
          title: "hoge todo 1",
          description: "hoge desc 1",
        },
      ],
    },
    {
      id: "01HFFYQP8JMVAJ11XVZXDXVGQR",
      name: "piyo",
      email: "piyo@piyo.com",
      /** raw: piyopiyo */
      password: "$2b$10$tt1xSvAUjwVuBzxaUi.yMugSpVGmka/XfgxtSamq4Zeei7XOC5RK.",
      token: "01HFFYQP8JW273G541HW4TREQY",
      role: UserRole.USER,
      todos: [
        {
          id: "01HFFZ0ABVVD5HPAARMZR74PHG",
          title: "piyo todo 1",
          description: "piyo desc 1",
          status: TodoStatus.DONE,
        },
        {
          id: "01HFFZ0ABV43SDH3EGT46AM6P1",
          title: "piyo todo 2",
          description: "piyo desc 2",
        },
      ],
    },
  ];

  const upserts = data.map(({ todos, ...rest }) =>
    prisma.user.upsert({
      where: { id: rest.id },
      update: {},
      create: {
        ...rest,
        todos: {
          create: todos,
        },
      },
    })
  );

  return Promise.all(upserts);
};

try {
  const users = await main();
  console.log(users);
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
