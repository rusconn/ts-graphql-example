import type { UserResolvers } from "../../../schema.ts";
import * as avatar from "./avatar.ts";
import * as bio from "./bio.ts";
import * as blockings from "./blockings.ts";
import * as createdAt from "./createdAt.ts";
import * as email from "./email.ts";
import * as followers from "./followers.ts";
import * as followings from "./followings.ts";
import * as handle from "./handle.ts";
import * as id from "./id.ts";
import * as location from "./location.ts";
import * as name from "./name.ts";
import * as updatedAt from "./updatedAt.ts";
import * as website from "./website.ts";

const typeDef = /* GraphQL */ `
  type User
`;

export const typeDefs = [
  typeDef,
  avatar.typeDef,
  bio.typeDef,
  blockings.typeDef,
  createdAt.typeDef,
  email.typeDef,
  followers.typeDef,
  followings.typeDef,
  handle.typeDef,
  id.typeDef,
  location.typeDef,
  name.typeDef,
  updatedAt.typeDef,
  website.typeDef,
];

export const resolvers: UserResolvers = {
  avatar: avatar.resolver,
  bio: bio.resolver,
  blockings: blockings.resolver,
  createdAt: createdAt.resolver,
  email: email.resolver,
  followers: followers.resolver,
  followings: followings.resolver,
  handle: handle.resolver,
  id: id.resolver,
  location: location.resolver,
  name: name.resolver,
  updatedAt: updatedAt.resolver,
  website: website.resolver,
};
