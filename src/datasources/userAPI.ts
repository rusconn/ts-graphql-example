import type { User } from "@prisma/client";

import { CreateUserInput, UpdateUserInput, UsersOption, UsersOrder } from "@/types";
import { nonEmptyString, positiveInt } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";

export class UserAPI extends PrismaDataSource {
  @catchPrismaError
  async gets({ order, first, cursor }: UsersOption) {
    // codegen の設定を変更できたら不要 codegen.yml 参照
    const defaultedOrder = order ?? UsersOrder.Desc;
    const defaultedFirst = first ?? positiveInt(10);

    const direction = defaultedOrder === UsersOrder.Desc ? "desc" : "asc";

    const users = await this.prisma.user.findMany({
      take: (defaultedFirst as number) + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ createdAt: direction }, { id: direction }],
    });

    if (users.length <= defaultedFirst) {
      return { users };
    }

    const nextUser = users.pop() as User;
    return { users, cursor: nonEmptyString(nextUser.id) };
  }

  // get のパラメタライズだと non-null に出来ない
  @catchPrismaError
  getRejectOnNotFound(id: User["id"]) {
    return this.prisma.user.findUnique({ where: { id }, rejectOnNotFound: true });
  }

  @catchPrismaError
  get(id: User["id"]) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  @catchPrismaError
  create(input: CreateUserInput) {
    return this.prisma.user.create({ data: input });
  }

  @catchPrismaError
  update(id: User["id"], input: UpdateUserInput) {
    return this.prisma.user.update({ where: { id }, data: input });
  }

  @catchPrismaError
  delete(id: User["id"]) {
    return this.prisma.user.delete({ where: { id } });
  }
}
