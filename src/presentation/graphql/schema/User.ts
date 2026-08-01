import type { Context } from "../yoga/context.ts";
import { authAdminOrUserOwner } from "./_authorizers/user/admin-or-owner.ts";
import { forbiddenError } from "./_errors/global/forbidden.ts";
import { ErrorCode } from "./_types.ts";
import type { ResolversParentTypes, UserResolvers } from "./_types.ts";
import { nodeId } from "./Node/id.ts";
import * as todo from "./User/todo.ts";
import * as todos from "./User/todos.ts";

export const userId = nodeId("User");

export const typeDefs = [
  /* GraphQL */ `
    type User implements Node {
      id: ID!
      name: String @semanticNonNull
      email: EmailAddress @semanticNonNull
      createdAt: DateTimeISO @semanticNonNull
      updatedAt: DateTimeISO @semanticNonNull
    }
  `,
  todo.typeDef,
  todos.typeDef,
];

export const resolvers: UserResolvers = {
  id(parent, _args, context) {
    const ctx = authAdminOrUserOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return userId(parent.id);
  },
  name(parent, _args, context) {
    const ctx = authAdminOrUserOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.name;
  },
  email(parent, _args, context) {
    const ctx = authAdminOrUserOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.email;
  },
  createdAt(parent, _args, context) {
    const ctx = authAdminOrUserOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.createdAt;
  },
  updatedAt(parent, _args, context) {
    const ctx = authAdminOrUserOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.updatedAt;
  },
  todo: todo.resolver,
  todos: todos.resolver,
};

if (import.meta.vitest) {
  const { dto, graph } = await import("./_test/data.ts");
  const { context } = await import("./_test/data/context/dynamic.ts");

  const parent: ResolversParentTypes["User"] = dto.users.alice;

  describe("id", () => {
    it("throws when user is not owner or admin", () => {
      const ctx = context.guest() as Context;
      expect(() => resolvers.id!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", () => {
      const ctx = context.alice() as Context;
      const result = resolvers.id!(parent, {}, ctx);
      expect(result).toBe(graph.users.alice.id);
    });
  });

  describe("name", () => {
    it("throws when user is not owner or admin", () => {
      const ctx = context.guest() as Context;
      expect(() => resolvers.name!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", () => {
      const ctx = context.alice() as Context;
      const result = resolvers.name!(parent, {}, ctx);
      expect(result).toBe(graph.users.alice.name);
    });
  });

  describe("email", () => {
    it("throws when user is not owner or admin", () => {
      const ctx = context.guest() as Context;
      expect(() => resolvers.email!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", () => {
      const ctx = context.alice() as Context;
      const result = resolvers.email!(parent, {}, ctx);
      expect(result).toBe(graph.users.alice.email);
    });
  });

  describe("createdAt", () => {
    it("throws when user is not owner or admin", () => {
      const ctx = context.guest() as Context;
      expect(() => resolvers.createdAt!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", async () => {
      const ctx = context.alice() as Context;
      const result = await resolvers.createdAt!(parent, {}, ctx);
      expect(result?.toISOString()).toBe(graph.users.alice.createdAt);
    });
  });

  describe("updatedAt", () => {
    it("throws when user is not owner or admin", () => {
      const ctx = context.guest() as Context;
      expect(() => resolvers.updatedAt!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", async () => {
      const ctx = context.alice() as Context;
      const result = await resolvers.updatedAt!(parent, {}, ctx);
      expect(result?.toISOString()).toBe(graph.users.alice.updatedAt);
    });
  });
}
