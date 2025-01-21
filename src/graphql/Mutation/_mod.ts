import type { Resolvers } from "../../schema.ts";
import * as accountDelete from "./accountDelete.ts";
import * as login from "./login.ts";
import * as loginPasswordChange from "./loginPasswordChange.ts";
import * as logout from "./logout.ts";
import * as postCreate from "./postCreate.ts";
import * as postDelete from "./postDelete.ts";
import * as postEdit from "./postEdit.ts";
import * as postLike from "./postLike.ts";
import * as postReply from "./postReply.ts";
import * as postUnlike from "./postUnlike.ts";
import * as signup from "./signup.ts";
import * as userBlock from "./userBlock.ts";
import * as userEmailChange from "./userEmailChange.ts";
import * as userFollow from "./userFollow.ts";
import * as userNameChange from "./userNameChange.ts";
import * as userProfileEdit from "./userProfileEdit.ts";
import * as userUnblock from "./userUnblock.ts";
import * as userUnfollow from "./userUnfollow.ts";

const typeDef = /* GraphQL */ `
  type Mutation
`;

export const typeDefs = [
  typeDef,
  accountDelete.typeDef,
  login.typeDef,
  loginPasswordChange.typeDef,
  logout.typeDef,
  postCreate.typeDef,
  postDelete.typeDef,
  postEdit.typeDef,
  postLike.typeDef,
  postReply.typeDef,
  postUnlike.typeDef,
  signup.typeDef,
  userBlock.typeDef,
  userEmailChange.typeDef,
  userFollow.typeDef,
  userNameChange.typeDef,
  userProfileEdit.typeDef,
  userUnblock.typeDef,
  userUnfollow.typeDef,
];

export const resolvers: Resolvers["Mutation"] = {
  accountDelete: accountDelete.resolver,
  login: login.resolver,
  loginPasswordChange: loginPasswordChange.resolver,
  logout: logout.resolver,
  postCreate: postCreate.resolver,
  postDelete: postDelete.resolver,
  postEdit: postEdit.resolver,
  postLike: postLike.resolver,
  postReply: postReply.resolver,
  postUnlike: postUnlike.resolver,
  signup: signup.resolver,
  userBlock: userBlock.resolver,
  userEmailChange: userEmailChange.resolver,
  userFollow: userFollow.resolver,
  userNameChange: userNameChange.resolver,
  userProfileEdit: userProfileEdit.resolver,
  userUnblock: userUnblock.resolver,
  userUnfollow: userUnfollow.resolver,
};
