import * as uuidv7 from "../../../lib/uuid/v7.ts";
import type { UserResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { authAdminOrUserOwner } from "../authorizers/adminOrUserOwner.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    createdAt: DateTime
  }
`;

export const resolver: UserResolvers["createdAt"] = (parent, _args, context) => {
  const authed = authAdminOrUserOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return uuidv7.date(parent.id);
};
