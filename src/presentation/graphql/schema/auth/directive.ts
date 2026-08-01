import { defaultFieldResolver } from "graphql";
import type { GraphQLField, GraphQLResolveInfo, GraphQLSchema } from "graphql";

import type { Context } from "../../yoga/context.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import type { AuthPolicy } from "../_types.ts";
import { policies, type Authorizer } from "./policies.ts";

export function applyAuthDirective(schema: GraphQLSchema) {
  for (const type of Object.values(schema.getTypeMap())) {
    const fields = (
      type as { getFields?: () => Record<string, GraphQLField<unknown, unknown>> }
    ).getFields?.();
    if (!fields) continue;

    for (const field of Object.values(fields)) {
      const policy = readPolicy(field);
      if (!policy) continue;

      const resolve = field.resolve ?? defaultFieldResolver;
      field.resolve = (
        parent: unknown,
        _args: unknown,
        context: unknown,
        info: GraphQLResolveInfo,
      ) => {
        const ctx = policy(context as Context, parent);
        if (Error.isError(ctx)) {
          throw forbiddenError(ctx);
        }
        return resolve(parent, _args, ctx, info);
      };
    }
  }

  return schema;
}

function readPolicy(field: GraphQLField<unknown, unknown>): Authorizer | undefined {
  const directives = field.astNode?.directives;
  if (!directives) return undefined;

  const directive = directives.find((d) => d.name.value === "auth");
  if (!directive) return undefined;

  const arg = directive.arguments?.find((a) => a.name.value === "policy");
  const name = arg?.value.kind === "EnumValue" ? arg.value.value : undefined;
  if (name == null) {
    throw new Error(`@auth on ${field.name} requires a policy`);
  }

  const policy = policies[name as AuthPolicy];
  if (!policy) {
    throw new Error(`Unknown auth policy: ${name}`);
  }

  return policy;
}

if (import.meta.vitest) {
  const { buildSchema, graphql } = await import("graphql");
  const { typeDef } = await import("../auth.ts");
  const { ErrorCode } = await import("../_types.ts");

  const typeDefs = `
    ${typeDef}

    type Query {
      todo: Todo
      user: User
      admin: String @auth(policy: ADMIN)
      authenticated: String @auth(policy: AUTHENTICATED)
      guest: String @auth(policy: GUEST)
      noAuth: String
    }

    type Todo {
      title: String @auth(policy: TODO_OWNER)
      user: User @auth(policy: ADMIN_OR_TODO_OWNER)
    }

    type User {
      name: String @auth(policy: ADMIN_OR_USER_OWNER)
    }
  `;

  const schema = buildSchema(typeDefs);

  const queryType = schema.getQueryType()!;
  queryType.getFields().todo!.resolve = () => ({
    id: "todo-1",
    userId: "user-1",
  });
  queryType.getFields().user!.resolve = () => ({
    id: "user-1",
  });

  applyAuthDirective(schema);

  const contexts = {
    guest: { role: "GUEST", user: null },
    owner: { role: "USER", user: { id: "user-1" } },
    other: { role: "USER", user: { id: "user-2" } },
    admin: { role: "ADMIN", user: { id: "admin-1" } },
  } as const;

  const query = async (contextValue: unknown, source: string) => {
    return await graphql({ schema, source, contextValue });
  };

  const adminQuery = `{ admin }`;
  const authenticatedQuery = `{ authenticated }`;
  const guestQuery = `{ guest }`;
  const todoOwnerQuery = `{ todo { title } }`;
  const adminOrTodoOwnerQuery = `{ todo { user { __typename } } }`;
  const adminOrUserOwnerQuery = `{ user { name } }`;
  const noAuthQuery = `{ noAuth }`;

  const cases: [keyof typeof contexts, string, boolean][] = [
    ["guest", guestQuery, true],
    ["owner", guestQuery, false],
    ["admin", guestQuery, false],
    ["guest", authenticatedQuery, false],
    ["owner", authenticatedQuery, true],
    ["admin", authenticatedQuery, true],
    ["guest", adminQuery, false],
    ["owner", adminQuery, false],
    ["admin", adminQuery, true],
    ["guest", todoOwnerQuery, false],
    ["owner", todoOwnerQuery, true],
    ["other", todoOwnerQuery, false],
    ["admin", todoOwnerQuery, false],
    ["guest", adminOrTodoOwnerQuery, false],
    ["owner", adminOrTodoOwnerQuery, true],
    ["other", adminOrTodoOwnerQuery, false],
    ["admin", adminOrTodoOwnerQuery, true],
    ["guest", adminOrUserOwnerQuery, false],
    ["owner", adminOrUserOwnerQuery, true],
    ["other", adminOrUserOwnerQuery, false],
    ["admin", adminOrUserOwnerQuery, true],
    ["guest", noAuthQuery, true],
  ];

  describe("applyAuthDirective", () => {
    it.each(cases)("%#", async (role, source, allowed) => {
      const result = await query(contexts[role as keyof typeof contexts], source);
      if (allowed) {
        expect(result.errors).toBeUndefined();
      } else {
        expect(result.errors?.[0]?.extensions?.code).toBe(ErrorCode.Forbidden);
      }
    });
  });
}
