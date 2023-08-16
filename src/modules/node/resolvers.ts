import type * as Graph from "../common/schema";
import type { NodeType } from "../common/typeDefs";
import type { Todo } from "../todo/resolvers";
import type { User } from "../user/resolvers";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: async (_, args, { dataSources: { prisma } }) => {
      const { type, id } = parsers.Query.node(args);

      // id の他に、型の決定と権限チェックに必要なデータを出力する必要がある
      switch (type) {
        case "Todo": {
          const parent = await prisma.todo.findUniqueOrThrow({
            where: { id },
            select: { userId: true },
          });

          return { type, id, userId: parent.userId } as Todo;
        }
        case "User": {
          return { type, id } as User;
        }
      }
    },
  },
  Node: {
    // @ts-expect-error: type はスキーマに無いが使いたい
    __resolveType: ({ type }) => {
      return type as NodeType;
    },
  },
};
