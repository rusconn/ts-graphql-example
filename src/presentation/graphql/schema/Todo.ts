import type { Context } from "../yoga/context.ts";
import { authAdminOrTodoOwner } from "./_authorizers/todo/admin-or-owner.ts";
import { authTodoOwner } from "./_authorizers/todo/owner.ts";
import { forbiddenError } from "./_errors/global/forbidden.ts";
import { ErrorCode } from "./_types.ts";
import type { ResolversParentTypes, TodoResolvers } from "./_types.ts";
import { nodeId } from "./Node/id.ts";
import * as user from "./Todo/user.ts";

export const todoId = nodeId("Todo");

export const typeDefs = [
  /* GraphQL */ `
    type Todo implements Node {
      id: ID!
      title: String @semanticNonNull
      description: String @semanticNonNull
      status: TodoStatus @semanticNonNull
      createdAt: DateTimeISO @semanticNonNull
      updatedAt: DateTimeISO @semanticNonNull
    }

    enum TodoStatus {
      DONE
      PENDING
    }
  `,
  user.typeDef,
];

export const resolvers: TodoResolvers = {
  id(parent, _args, context) {
    const ctx = authAdminOrTodoOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return todoId(parent.id);
  },
  title(parent, _args, context) {
    const ctx = authTodoOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.title;
  },
  description(parent, _args, context) {
    const ctx = authTodoOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.description;
  },
  status(parent, _args, context) {
    const ctx = authTodoOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.status;
  },
  createdAt(parent, _args, context) {
    const ctx = authAdminOrTodoOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.createdAt;
  },
  updatedAt(parent, _args, context) {
    const ctx = authAdminOrTodoOwner(context, parent);
    if (Error.isError(ctx)) throw forbiddenError(ctx);
    return parent.updatedAt;
  },
  user: user.resolver,
};

if (import.meta.vitest) {
  const { dto, graph } = await import("./_test/data.ts");
  const { context } = await import("./_test/data/context/dynamic.ts");

  const parent: ResolversParentTypes["Todo"] = dto.todos.alice1;

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
      expect(result).toBe(graph.todos.alice1.id);
    });
  });

  describe("title", () => {
    it("throws when user is not owner", () => {
      const ctx = context.admin() as Context;
      expect(() => resolvers.title!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", () => {
      const ctx = context.alice() as Context;
      const result = resolvers.title!(parent, {}, ctx);
      expect(result).toBe(graph.todos.alice1.title);
    });
  });

  describe("description", () => {
    it("throws when user is not owner", () => {
      const ctx = context.admin() as Context;
      expect(() => resolvers.description!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", () => {
      const ctx = context.alice() as Context;
      const result = resolvers.description!(parent, {}, ctx);
      expect(result).toBe(graph.todos.alice1.description);
    });
  });

  describe("status", () => {
    it("throws when user is not owner", () => {
      const ctx = context.admin() as Context;
      expect(() => resolvers.status!(parent, {}, ctx)).toThrowError(
        expect.objectContaining({ extensions: { code: ErrorCode.Forbidden } }),
      );
    });
    it("returns when authorized", () => {
      const ctx = context.alice() as Context;
      const result = resolvers.status!(parent, {}, ctx);
      expect(result).toBe(graph.todos.alice1.status);
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
      expect(result?.toISOString()).toBe(graph.todos.alice1.createdAt);
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
      expect(result?.toISOString()).toBe(graph.todos.alice1.updatedAt);
    });
  });
}
