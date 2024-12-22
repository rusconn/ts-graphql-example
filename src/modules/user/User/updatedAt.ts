import type { UserResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { authAdminOrUserOwner } from "../authorizers/adminOrUserOwner.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    updatedAt: DateTime
  }
`;

export const resolver: UserResolvers["updatedAt"] = (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return parent.updatedAt;
};
