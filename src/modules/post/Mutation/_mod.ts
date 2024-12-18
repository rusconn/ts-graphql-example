import * as createPost from "./createPost.ts";
import * as deletePost from "./deletePost.ts";
import * as editPost from "./editPost.ts";
import * as likePost from "./likePost.ts";
import * as replyToPost from "./replyToPost.ts";
import * as unlikePost from "./unlikePost.ts";

export const typeDefs = [
  createPost.typeDef,
  deletePost.typeDef,
  editPost.typeDef,
  likePost.typeDef,
  replyToPost.typeDef,
  unlikePost.typeDef,
];

export const resolvers = {
  createPost: createPost.resolver,
  deletePost: deletePost.resolver,
  editPost: editPost.resolver,
  likePost: likePost.resolver,
  replyToPost: replyToPost.resolver,
  unlikePost: unlikePost.resolver,
};
