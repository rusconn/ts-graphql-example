import type { MutationResolvers } from "../../../schema.ts";
import * as blockUser from "./blockUser.ts";
import * as changeLoginPassword from "./changeLoginPassword.ts";
import * as changeUserEmail from "./changeUserEmail.ts";
import * as changeUserName from "./changeUserName.ts";
import * as deleteAccount from "./deleteAccount.ts";
import * as editUserProfile from "./editUserProfile.ts";
import * as followUser from "./followUser.ts";
import * as login from "./login.ts";
import * as logout from "./logout.ts";
import * as signup from "./signup.ts";
import * as unblockUser from "./unblockUser.ts";
import * as unfollowUser from "./unfollowUser.ts";

const typeDef = /* GraphQL */ `
  type UserNameAlreadyTakenError implements Error {
    message: String!
  }
  type UserEmailAlreadyTakenError implements Error {
    message: String!
  }
`;

export const typeDefs = [
  typeDef,
  blockUser.typeDef,
  changeLoginPassword.typeDef,
  changeUserEmail.typeDef,
  changeUserName.typeDef,
  deleteAccount.typeDef,
  editUserProfile.typeDef,
  followUser.typeDef,
  login.typeDef,
  logout.typeDef,
  signup.typeDef,
  unblockUser.typeDef,
  unfollowUser.typeDef,
];

export const resolvers: MutationResolvers = {
  blockUser: blockUser.resolver,
  changeLoginPassword: changeLoginPassword.resolver,
  changeUserEmail: changeUserEmail.resolver,
  changeUserName: changeUserName.resolver,
  deleteAccount: deleteAccount.resolver,
  editUserProfile: editUserProfile.resolver,
  followUser: followUser.resolver,
  login: login.resolver,
  logout: logout.resolver,
  signup: signup.resolver,
  unblockUser: unblockUser.resolver,
  unfollowUser: unfollowUser.resolver,
};
