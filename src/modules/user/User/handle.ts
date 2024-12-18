import type { UserResolvers } from "../../../schema.ts";
import { auth } from "../../common/authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    handle: NonEmptyString
  }
`;

export const resolver: UserResolvers["handle"] = (parent, _args, context) => {
  auth(context);

  return parent.handle;
};
