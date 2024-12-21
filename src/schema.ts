import type { ID } from './modules/scalar/mod.ts';
import type { DateTime } from './modules/scalar/mod.ts';
import type { EmailAddress } from './modules/scalar/mod.ts';
import type { NonEmptyString } from './modules/scalar/mod.ts';
import type { URL } from './modules/scalar/mod.ts';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { Node as NodeMapper } from './modules/node/common/resolver.ts';
import type { Post as PostMapper } from './modules/post/common/resolver.ts';
import type { User as UserMapper } from './modules/user/common/resolver.ts';
import type { Context } from './context.ts';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: ID; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: DateTime; output: Date | DateTime; }
  EmailAddress: { input: EmailAddress; output: string; }
  NonEmptyString: { input: NonEmptyString; output: string; }
  URL: { input: URL; output: string; }
};

export type BlockUserResult = BlockUserSuccess | InvalidInputError | ResourceNotFoundError;

export type BlockUserSuccess = {
  __typename?: 'BlockUserSuccess';
  alreadyBlocked: Scalars['Boolean']['output'];
  blockee: User;
  blocker: User;
};

export type BlockerConnection = {
  __typename?: 'BlockerConnection';
  edges?: Maybe<Array<Maybe<BlockerEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type BlockerEdge = {
  __typename?: 'BlockerEdge';
  blockedAt?: Maybe<Scalars['DateTime']['output']>;
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export enum BlockerSortKeys {
  BlockedAt = 'BLOCKED_AT'
}

export type BlockingConnection = {
  __typename?: 'BlockingConnection';
  edges?: Maybe<Array<Maybe<BlockingEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type BlockingEdge = {
  __typename?: 'BlockingEdge';
  blockedAt?: Maybe<Scalars['DateTime']['output']>;
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export enum BlockingSortKeys {
  BlockedAt = 'BLOCKED_AT'
}

export type ChangeLoginPasswordResult = ChangeLoginPasswordSuccess | InvalidInputError;

export type ChangeLoginPasswordSuccess = {
  __typename?: 'ChangeLoginPasswordSuccess';
  id: Scalars['ID']['output'];
};

export type ChangeUserEmailResult = ChangeUserEmailSuccess | InvalidInputError | UserEmailAlreadyTakenError;

export type ChangeUserEmailSuccess = {
  __typename?: 'ChangeUserEmailSuccess';
  user: User;
};

export type ChangeUserNameResult = ChangeUserNameSuccess | InvalidInputError | UserNameAlreadyTakenError;

export type ChangeUserNameSuccess = {
  __typename?: 'ChangeUserNameSuccess';
  user: User;
};

export type CreatePostResult = CreatePostSuccess | InvalidInputError;

export type CreatePostSuccess = {
  __typename?: 'CreatePostSuccess';
  post: Post;
};

export type DeleteAccountResult = DeleteAccountSuccess;

export type DeleteAccountSuccess = {
  __typename?: 'DeleteAccountSuccess';
  id: Scalars['ID']['output'];
};

export type DeletePostResult = DeletePostSuccess | InvalidInputError | ResourceNotFoundError;

export type DeletePostSuccess = {
  __typename?: 'DeletePostSuccess';
  id: Scalars['ID']['output'];
};

export type EditPostResult = EditPostSuccess | InvalidInputError | ResourceNotFoundError;

export type EditPostSuccess = {
  __typename?: 'EditPostSuccess';
  post: Post;
};

export type EditUserProfileResult = EditUserProfileSuccess | InvalidInputError;

export type EditUserProfileSuccess = {
  __typename?: 'EditUserProfileSuccess';
  user: User;
};

export type Error = {
  message: Scalars['String']['output'];
};

export enum ErrorCode {
  AuthenticationError = 'AUTHENTICATION_ERROR',
  BadUserInput = 'BAD_USER_INPUT',
  Forbidden = 'FORBIDDEN'
}

export type FollowUserResult = FollowUserSuccess | InvalidInputError | ResourceNotFoundError;

export type FollowUserSuccess = {
  __typename?: 'FollowUserSuccess';
  alreadyFollowed: Scalars['Boolean']['output'];
  followee: User;
  follower: User;
};

export type FollowerConnection = {
  __typename?: 'FollowerConnection';
  edges?: Maybe<Array<Maybe<FollowerEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type FollowerEdge = {
  __typename?: 'FollowerEdge';
  cursor: Scalars['String']['output'];
  followedAt?: Maybe<Scalars['DateTime']['output']>;
  node?: Maybe<User>;
};

export enum FollowerSortKeys {
  FollowedAt = 'FOLLOWED_AT'
}

export type FollowingConnection = {
  __typename?: 'FollowingConnection';
  edges?: Maybe<Array<Maybe<FollowingEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type FollowingEdge = {
  __typename?: 'FollowingEdge';
  cursor: Scalars['String']['output'];
  followedAt?: Maybe<Scalars['DateTime']['output']>;
  node?: Maybe<User>;
};

export enum FollowingSortKeys {
  FollowedAt = 'FOLLOWED_AT'
}

export type InvalidInputError = Error & {
  __typename?: 'InvalidInputError';
  message: Scalars['String']['output'];
};

export type LikeConnection = {
  __typename?: 'LikeConnection';
  edges?: Maybe<Array<Maybe<LikeEdge>>>;
  nodes?: Maybe<Array<Maybe<Post>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type LikeEdge = {
  __typename?: 'LikeEdge';
  cursor: Scalars['String']['output'];
  likedAt?: Maybe<Scalars['DateTime']['output']>;
  node?: Maybe<Post>;
};

export type LikePostResult = InvalidInputError | LikePostSuccess | ResourceNotFoundError;

export type LikePostSuccess = {
  __typename?: 'LikePostSuccess';
  alreadyLiked: Scalars['Boolean']['output'];
  post: Post;
};

export enum LikeSortKeys {
  LikedAt = 'LIKED_AT'
}

export type LikerConnection = {
  __typename?: 'LikerConnection';
  edges?: Maybe<Array<Maybe<LikerEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type LikerEdge = {
  __typename?: 'LikerEdge';
  cursor: Scalars['String']['output'];
  likedAt?: Maybe<Scalars['DateTime']['output']>;
  node?: Maybe<User>;
};

export enum LikerSortKeys {
  LikedAt = 'LIKED_AT'
}

export type LoginResult = InvalidInputError | LoginSuccess | UserNotFoundError;

export type LoginSuccess = {
  __typename?: 'LoginSuccess';
  token: Scalars['NonEmptyString']['output'];
};

export type LogoutResult = LogoutSuccess;

export type LogoutSuccess = {
  __typename?: 'LogoutSuccess';
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  blockUser?: Maybe<BlockUserResult>;
  changeLoginPassword?: Maybe<ChangeLoginPasswordResult>;
  changeUserEmail?: Maybe<ChangeUserEmailResult>;
  changeUserName?: Maybe<ChangeUserNameResult>;
  createPost?: Maybe<CreatePostResult>;
  /** 紐づくリソースは全て削除される */
  deleteAccount?: Maybe<DeleteAccountResult>;
  deletePost?: Maybe<DeletePostResult>;
  editPost?: Maybe<EditPostResult>;
  editUserProfile?: Maybe<EditUserProfileResult>;
  followUser?: Maybe<FollowUserResult>;
  likePost?: Maybe<LikePostResult>;
  login?: Maybe<LoginResult>;
  logout?: Maybe<LogoutResult>;
  replyToPost?: Maybe<ReplyToPostResult>;
  signup?: Maybe<SignupResult>;
  unblockUser?: Maybe<UnblockUserResult>;
  unfollowUser?: Maybe<UnfollowUserResult>;
  unlikePost?: Maybe<UnlikePostResult>;
};


export type MutationBlockUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChangeLoginPasswordArgs = {
  password: Scalars['NonEmptyString']['input'];
};


export type MutationChangeUserEmailArgs = {
  email: Scalars['EmailAddress']['input'];
};


export type MutationChangeUserNameArgs = {
  name: Scalars['NonEmptyString']['input'];
};


export type MutationCreatePostArgs = {
  content: Scalars['NonEmptyString']['input'];
};


export type MutationDeletePostArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEditPostArgs = {
  content: Scalars['NonEmptyString']['input'];
  id: Scalars['ID']['input'];
};


export type MutationEditUserProfileArgs = {
  avatar?: InputMaybe<Scalars['URL']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  handle?: InputMaybe<Scalars['NonEmptyString']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['URL']['input']>;
};


export type MutationFollowUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLikePostArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  loginId: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
};


export type MutationReplyToPostArgs = {
  content: Scalars['NonEmptyString']['input'];
  id: Scalars['ID']['input'];
};


export type MutationSignupArgs = {
  email: Scalars['NonEmptyString']['input'];
  name: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
};


export type MutationUnblockUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnfollowUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUnlikePostArgs = {
  id: Scalars['ID']['input'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Post = Node & {
  __typename?: 'Post';
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  hasUpdated?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  likers?: Maybe<LikerConnection>;
  likesCount?: Maybe<Scalars['Int']['output']>;
  parents?: Maybe<Array<Maybe<Post>>>;
  replies?: Maybe<ReplyConnection>;
  repliesCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url?: Maybe<Scalars['URL']['output']>;
  user?: Maybe<User>;
  viewerHasLiked?: Maybe<Scalars['Boolean']['output']>;
};


export type PostLikersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: LikerSortKeys;
};


export type PostRepliesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: ReplySortKeys;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  edges?: Maybe<Array<Maybe<PostEdge>>>;
  nodes?: Maybe<Array<Maybe<Post>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Post>;
};

export enum PostSortKeys {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  post?: Maybe<Post>;
  posts?: Maybe<PostConnection>;
  user?: Maybe<User>;
  viewer?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPostArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: PostSortKeys;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type ReplyConnection = {
  __typename?: 'ReplyConnection';
  edges?: Maybe<Array<Maybe<ReplyEdge>>>;
  nodes?: Maybe<Array<Maybe<Post>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ReplyEdge = {
  __typename?: 'ReplyEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Post>;
};

export enum ReplySortKeys {
  RepliedAt = 'REPLIED_AT'
}

export type ReplyToPostResult = InvalidInputError | ReplyToPostSuccess | ResourceNotFoundError;

export type ReplyToPostSuccess = {
  __typename?: 'ReplyToPostSuccess';
  post: Post;
};

export type ResourceLimitExceededError = Error & {
  __typename?: 'ResourceLimitExceededError';
  message: Scalars['String']['output'];
};

export type ResourceNotFoundError = Error & {
  __typename?: 'ResourceNotFoundError';
  message: Scalars['String']['output'];
};

export type SignupResult = InvalidInputError | SignupSuccess | UserEmailAlreadyTakenError | UserNameAlreadyTakenError;

export type SignupSuccess = {
  __typename?: 'SignupSuccess';
  token: Scalars['NonEmptyString']['output'];
};

export type UnblockUserResult = InvalidInputError | ResourceNotFoundError | UnblockUserSuccess;

export type UnblockUserSuccess = {
  __typename?: 'UnblockUserSuccess';
  alreadyUnblocked: Scalars['Boolean']['output'];
  unblockee: User;
  unblocker: User;
};

export type UnfollowUserResult = InvalidInputError | ResourceNotFoundError | UnfollowUserSuccess;

export type UnfollowUserSuccess = {
  __typename?: 'UnfollowUserSuccess';
  alreadyUnfollowed: Scalars['Boolean']['output'];
  unfollowee: User;
  unfollower: User;
};

export type UnlikePostResult = InvalidInputError | ResourceNotFoundError | UnlikePostSuccess;

export type UnlikePostSuccess = {
  __typename?: 'UnlikePostSuccess';
  alreadyUnliked: Scalars['Boolean']['output'];
  post: Post;
};

export type User = Node & {
  __typename?: 'User';
  avatar?: Maybe<Scalars['URL']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  blockers?: Maybe<BlockerConnection>;
  blockings?: Maybe<BlockingConnection>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['EmailAddress']['output']>;
  followers?: Maybe<FollowerConnection>;
  followings?: Maybe<FollowingConnection>;
  handle?: Maybe<Scalars['NonEmptyString']['output']>;
  id: Scalars['ID']['output'];
  isBlockingViewer?: Maybe<Scalars['Boolean']['output']>;
  isFollowingViewer?: Maybe<Scalars['Boolean']['output']>;
  likes?: Maybe<LikeConnection>;
  location?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['NonEmptyString']['output']>;
  posts?: Maybe<PostConnection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  viewerIsBlocking?: Maybe<Scalars['Boolean']['output']>;
  viewerIsFollowing?: Maybe<Scalars['Boolean']['output']>;
  website?: Maybe<Scalars['URL']['output']>;
};


export type UserBlockersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: BlockerSortKeys;
};


export type UserBlockingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: BlockingSortKeys;
};


export type UserFollowersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: FollowerSortKeys;
};


export type UserFollowingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: FollowingSortKeys;
};


export type UserLikesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: LikeSortKeys;
};


export type UserPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: UserPostSortKeys;
};

export type UserEmailAlreadyTakenError = Error & {
  __typename?: 'UserEmailAlreadyTakenError';
  message: Scalars['String']['output'];
};

export type UserNameAlreadyTakenError = Error & {
  __typename?: 'UserNameAlreadyTakenError';
  message: Scalars['String']['output'];
};

export type UserNotFoundError = Error & {
  __typename?: 'UserNotFoundError';
  message: Scalars['String']['output'];
};

export enum UserPostSortKeys {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info?: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info?: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  BlockUserResult: ( Omit<BlockUserSuccess, 'blockee' | 'blocker'> & { blockee: RefType['User'], blocker: RefType['User'] } & { __typename: 'BlockUserSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  ChangeLoginPasswordResult: ( ChangeLoginPasswordSuccess & { __typename: 'ChangeLoginPasswordSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } );
  ChangeUserEmailResult: ( Omit<ChangeUserEmailSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'ChangeUserEmailSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( UserEmailAlreadyTakenError & { __typename: 'UserEmailAlreadyTakenError' } );
  ChangeUserNameResult: ( Omit<ChangeUserNameSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'ChangeUserNameSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( UserNameAlreadyTakenError & { __typename: 'UserNameAlreadyTakenError' } );
  CreatePostResult: ( Omit<CreatePostSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'CreatePostSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } );
  DeleteAccountResult: ( DeleteAccountSuccess & { __typename: 'DeleteAccountSuccess' } );
  DeletePostResult: ( DeletePostSuccess & { __typename: 'DeletePostSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  EditPostResult: ( Omit<EditPostSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'EditPostSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  EditUserProfileResult: ( Omit<EditUserProfileSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'EditUserProfileSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } );
  FollowUserResult: ( Omit<FollowUserSuccess, 'followee' | 'follower'> & { followee: RefType['User'], follower: RefType['User'] } & { __typename: 'FollowUserSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  LikePostResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<LikePostSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'LikePostSuccess' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  LoginResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( LoginSuccess & { __typename: 'LoginSuccess' } ) | ( UserNotFoundError & { __typename: 'UserNotFoundError' } );
  LogoutResult: ( Omit<LogoutSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'LogoutSuccess' } );
  ReplyToPostResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<ReplyToPostSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'ReplyToPostSuccess' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  SignupResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( SignupSuccess & { __typename: 'SignupSuccess' } ) | ( UserEmailAlreadyTakenError & { __typename: 'UserEmailAlreadyTakenError' } ) | ( UserNameAlreadyTakenError & { __typename: 'UserNameAlreadyTakenError' } );
  UnblockUserResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UnblockUserSuccess, 'unblockee' | 'unblocker'> & { unblockee: RefType['User'], unblocker: RefType['User'] } & { __typename: 'UnblockUserSuccess' } );
  UnfollowUserResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UnfollowUserSuccess, 'unfollowee' | 'unfollower'> & { unfollowee: RefType['User'], unfollower: RefType['User'] } & { __typename: 'UnfollowUserSuccess' } );
  UnlikePostResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UnlikePostSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'UnlikePostSuccess' } );
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  Error: ( InvalidInputError ) | ( ResourceLimitExceededError ) | ( ResourceNotFoundError ) | ( UserEmailAlreadyTakenError ) | ( UserNameAlreadyTakenError ) | ( UserNotFoundError );
  Node: ( PostMapper ) | ( UserMapper );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  BlockUserResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['BlockUserResult']>;
  BlockUserSuccess: ResolverTypeWrapper<Omit<BlockUserSuccess, 'blockee' | 'blocker'> & { blockee: ResolversTypes['User'], blocker: ResolversTypes['User'] }>;
  BlockerConnection: ResolverTypeWrapper<Omit<BlockerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['BlockerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  BlockerEdge: ResolverTypeWrapper<Omit<BlockerEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  BlockerSortKeys: BlockerSortKeys;
  BlockingConnection: ResolverTypeWrapper<Omit<BlockingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['BlockingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  BlockingEdge: ResolverTypeWrapper<Omit<BlockingEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  BlockingSortKeys: BlockingSortKeys;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ChangeLoginPasswordResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChangeLoginPasswordResult']>;
  ChangeLoginPasswordSuccess: ResolverTypeWrapper<ChangeLoginPasswordSuccess>;
  ChangeUserEmailResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChangeUserEmailResult']>;
  ChangeUserEmailSuccess: ResolverTypeWrapper<Omit<ChangeUserEmailSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  ChangeUserNameResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChangeUserNameResult']>;
  ChangeUserNameSuccess: ResolverTypeWrapper<Omit<ChangeUserNameSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  CreatePostResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreatePostResult']>;
  CreatePostSuccess: ResolverTypeWrapper<Omit<CreatePostSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteAccountResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteAccountResult']>;
  DeleteAccountSuccess: ResolverTypeWrapper<DeleteAccountSuccess>;
  DeletePostResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeletePostResult']>;
  DeletePostSuccess: ResolverTypeWrapper<DeletePostSuccess>;
  EditPostResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['EditPostResult']>;
  EditPostSuccess: ResolverTypeWrapper<Omit<EditPostSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  EditUserProfileResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['EditUserProfileResult']>;
  EditUserProfileSuccess: ResolverTypeWrapper<Omit<EditUserProfileSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  Error: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Error']>;
  ErrorCode: ErrorCode;
  FollowUserResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['FollowUserResult']>;
  FollowUserSuccess: ResolverTypeWrapper<Omit<FollowUserSuccess, 'followee' | 'follower'> & { followee: ResolversTypes['User'], follower: ResolversTypes['User'] }>;
  FollowerConnection: ResolverTypeWrapper<Omit<FollowerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['FollowerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  FollowerEdge: ResolverTypeWrapper<Omit<FollowerEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  FollowerSortKeys: FollowerSortKeys;
  FollowingConnection: ResolverTypeWrapper<Omit<FollowingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['FollowingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  FollowingEdge: ResolverTypeWrapper<Omit<FollowingEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  FollowingSortKeys: FollowingSortKeys;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputError: ResolverTypeWrapper<InvalidInputError>;
  LikeConnection: ResolverTypeWrapper<Omit<LikeConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['LikeEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Post']>>> }>;
  LikeEdge: ResolverTypeWrapper<Omit<LikeEdge, 'node'> & { node: Maybe<ResolversTypes['Post']> }>;
  LikePostResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LikePostResult']>;
  LikePostSuccess: ResolverTypeWrapper<Omit<LikePostSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  LikeSortKeys: LikeSortKeys;
  LikerConnection: ResolverTypeWrapper<Omit<LikerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['LikerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  LikerEdge: ResolverTypeWrapper<Omit<LikerEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  LikerSortKeys: LikerSortKeys;
  LoginResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LoginResult']>;
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>;
  LogoutResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LogoutResult']>;
  LogoutSuccess: ResolverTypeWrapper<Omit<LogoutSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<NodeMapper>;
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']['output']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Post: ResolverTypeWrapper<PostMapper>;
  PostConnection: ResolverTypeWrapper<Omit<PostConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['PostEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Post']>>> }>;
  PostEdge: ResolverTypeWrapper<Omit<PostEdge, 'node'> & { node: Maybe<ResolversTypes['Post']> }>;
  PostSortKeys: PostSortKeys;
  Query: ResolverTypeWrapper<{}>;
  ReplyConnection: ResolverTypeWrapper<Omit<ReplyConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['ReplyEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Post']>>> }>;
  ReplyEdge: ResolverTypeWrapper<Omit<ReplyEdge, 'node'> & { node: Maybe<ResolversTypes['Post']> }>;
  ReplySortKeys: ReplySortKeys;
  ReplyToPostResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ReplyToPostResult']>;
  ReplyToPostSuccess: ResolverTypeWrapper<Omit<ReplyToPostSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  ResourceLimitExceededError: ResolverTypeWrapper<ResourceLimitExceededError>;
  ResourceNotFoundError: ResolverTypeWrapper<ResourceNotFoundError>;
  SignupResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SignupResult']>;
  SignupSuccess: ResolverTypeWrapper<SignupSuccess>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  UnblockUserResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UnblockUserResult']>;
  UnblockUserSuccess: ResolverTypeWrapper<Omit<UnblockUserSuccess, 'unblockee' | 'unblocker'> & { unblockee: ResolversTypes['User'], unblocker: ResolversTypes['User'] }>;
  UnfollowUserResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UnfollowUserResult']>;
  UnfollowUserSuccess: ResolverTypeWrapper<Omit<UnfollowUserSuccess, 'unfollowee' | 'unfollower'> & { unfollowee: ResolversTypes['User'], unfollower: ResolversTypes['User'] }>;
  UnlikePostResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UnlikePostResult']>;
  UnlikePostSuccess: ResolverTypeWrapper<Omit<UnlikePostSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  User: ResolverTypeWrapper<UserMapper>;
  UserEmailAlreadyTakenError: ResolverTypeWrapper<UserEmailAlreadyTakenError>;
  UserNameAlreadyTakenError: ResolverTypeWrapper<UserNameAlreadyTakenError>;
  UserNotFoundError: ResolverTypeWrapper<UserNotFoundError>;
  UserPostSortKeys: UserPostSortKeys;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BlockUserResult: ResolversUnionTypes<ResolversParentTypes>['BlockUserResult'];
  BlockUserSuccess: Omit<BlockUserSuccess, 'blockee' | 'blocker'> & { blockee: ResolversParentTypes['User'], blocker: ResolversParentTypes['User'] };
  BlockerConnection: Omit<BlockerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['BlockerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  BlockerEdge: Omit<BlockerEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  BlockingConnection: Omit<BlockingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['BlockingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  BlockingEdge: Omit<BlockingEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  Boolean: Scalars['Boolean']['output'];
  ChangeLoginPasswordResult: ResolversUnionTypes<ResolversParentTypes>['ChangeLoginPasswordResult'];
  ChangeLoginPasswordSuccess: ChangeLoginPasswordSuccess;
  ChangeUserEmailResult: ResolversUnionTypes<ResolversParentTypes>['ChangeUserEmailResult'];
  ChangeUserEmailSuccess: Omit<ChangeUserEmailSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  ChangeUserNameResult: ResolversUnionTypes<ResolversParentTypes>['ChangeUserNameResult'];
  ChangeUserNameSuccess: Omit<ChangeUserNameSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  CreatePostResult: ResolversUnionTypes<ResolversParentTypes>['CreatePostResult'];
  CreatePostSuccess: Omit<CreatePostSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  DateTime: Scalars['DateTime']['output'];
  DeleteAccountResult: ResolversUnionTypes<ResolversParentTypes>['DeleteAccountResult'];
  DeleteAccountSuccess: DeleteAccountSuccess;
  DeletePostResult: ResolversUnionTypes<ResolversParentTypes>['DeletePostResult'];
  DeletePostSuccess: DeletePostSuccess;
  EditPostResult: ResolversUnionTypes<ResolversParentTypes>['EditPostResult'];
  EditPostSuccess: Omit<EditPostSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  EditUserProfileResult: ResolversUnionTypes<ResolversParentTypes>['EditUserProfileResult'];
  EditUserProfileSuccess: Omit<EditUserProfileSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  EmailAddress: Scalars['EmailAddress']['output'];
  Error: ResolversInterfaceTypes<ResolversParentTypes>['Error'];
  FollowUserResult: ResolversUnionTypes<ResolversParentTypes>['FollowUserResult'];
  FollowUserSuccess: Omit<FollowUserSuccess, 'followee' | 'follower'> & { followee: ResolversParentTypes['User'], follower: ResolversParentTypes['User'] };
  FollowerConnection: Omit<FollowerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['FollowerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  FollowerEdge: Omit<FollowerEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  FollowingConnection: Omit<FollowingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['FollowingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  FollowingEdge: Omit<FollowingEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  InvalidInputError: InvalidInputError;
  LikeConnection: Omit<LikeConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['LikeEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Post']>>> };
  LikeEdge: Omit<LikeEdge, 'node'> & { node: Maybe<ResolversParentTypes['Post']> };
  LikePostResult: ResolversUnionTypes<ResolversParentTypes>['LikePostResult'];
  LikePostSuccess: Omit<LikePostSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  LikerConnection: Omit<LikerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['LikerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  LikerEdge: Omit<LikerEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  LoginResult: ResolversUnionTypes<ResolversParentTypes>['LoginResult'];
  LoginSuccess: LoginSuccess;
  LogoutResult: ResolversUnionTypes<ResolversParentTypes>['LogoutResult'];
  LogoutSuccess: Omit<LogoutSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  Mutation: {};
  Node: NodeMapper;
  NonEmptyString: Scalars['NonEmptyString']['output'];
  PageInfo: PageInfo;
  Post: PostMapper;
  PostConnection: Omit<PostConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['PostEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Post']>>> };
  PostEdge: Omit<PostEdge, 'node'> & { node: Maybe<ResolversParentTypes['Post']> };
  Query: {};
  ReplyConnection: Omit<ReplyConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['ReplyEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Post']>>> };
  ReplyEdge: Omit<ReplyEdge, 'node'> & { node: Maybe<ResolversParentTypes['Post']> };
  ReplyToPostResult: ResolversUnionTypes<ResolversParentTypes>['ReplyToPostResult'];
  ReplyToPostSuccess: Omit<ReplyToPostSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  ResourceLimitExceededError: ResourceLimitExceededError;
  ResourceNotFoundError: ResourceNotFoundError;
  SignupResult: ResolversUnionTypes<ResolversParentTypes>['SignupResult'];
  SignupSuccess: SignupSuccess;
  String: Scalars['String']['output'];
  URL: Scalars['URL']['output'];
  UnblockUserResult: ResolversUnionTypes<ResolversParentTypes>['UnblockUserResult'];
  UnblockUserSuccess: Omit<UnblockUserSuccess, 'unblockee' | 'unblocker'> & { unblockee: ResolversParentTypes['User'], unblocker: ResolversParentTypes['User'] };
  UnfollowUserResult: ResolversUnionTypes<ResolversParentTypes>['UnfollowUserResult'];
  UnfollowUserSuccess: Omit<UnfollowUserSuccess, 'unfollowee' | 'unfollower'> & { unfollowee: ResolversParentTypes['User'], unfollower: ResolversParentTypes['User'] };
  UnlikePostResult: ResolversUnionTypes<ResolversParentTypes>['UnlikePostResult'];
  UnlikePostSuccess: Omit<UnlikePostSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  User: UserMapper;
  UserEmailAlreadyTakenError: UserEmailAlreadyTakenError;
  UserNameAlreadyTakenError: UserNameAlreadyTakenError;
  UserNotFoundError: UserNotFoundError;
}>;

export type BlockUserResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BlockUserResult'] = ResolversParentTypes['BlockUserResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'BlockUserSuccess' | 'InvalidInputError' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type BlockUserSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BlockUserSuccess'] = ResolversParentTypes['BlockUserSuccess']> = ResolversObject<{
  alreadyBlocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  blockee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  blocker?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BlockerConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BlockerConnection'] = ResolversParentTypes['BlockerConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['BlockerEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BlockerEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BlockerEdge'] = ResolversParentTypes['BlockerEdge']> = ResolversObject<{
  blockedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BlockingConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BlockingConnection'] = ResolversParentTypes['BlockingConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['BlockingEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BlockingEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BlockingEdge'] = ResolversParentTypes['BlockingEdge']> = ResolversObject<{
  blockedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChangeLoginPasswordResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChangeLoginPasswordResult'] = ResolversParentTypes['ChangeLoginPasswordResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ChangeLoginPasswordSuccess' | 'InvalidInputError', ParentType, ContextType>;
}>;

export type ChangeLoginPasswordSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChangeLoginPasswordSuccess'] = ResolversParentTypes['ChangeLoginPasswordSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChangeUserEmailResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChangeUserEmailResult'] = ResolversParentTypes['ChangeUserEmailResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ChangeUserEmailSuccess' | 'InvalidInputError' | 'UserEmailAlreadyTakenError', ParentType, ContextType>;
}>;

export type ChangeUserEmailSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChangeUserEmailSuccess'] = ResolversParentTypes['ChangeUserEmailSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChangeUserNameResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChangeUserNameResult'] = ResolversParentTypes['ChangeUserNameResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ChangeUserNameSuccess' | 'InvalidInputError' | 'UserNameAlreadyTakenError', ParentType, ContextType>;
}>;

export type ChangeUserNameSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChangeUserNameSuccess'] = ResolversParentTypes['ChangeUserNameSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreatePostResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreatePostResult'] = ResolversParentTypes['CreatePostResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CreatePostSuccess' | 'InvalidInputError', ParentType, ContextType>;
}>;

export type CreatePostSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreatePostSuccess'] = ResolversParentTypes['CreatePostSuccess']> = ResolversObject<{
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteAccountResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteAccountResult'] = ResolversParentTypes['DeleteAccountResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeleteAccountSuccess', ParentType, ContextType>;
}>;

export type DeleteAccountSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteAccountSuccess'] = ResolversParentTypes['DeleteAccountSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeletePostResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeletePostResult'] = ResolversParentTypes['DeletePostResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeletePostSuccess' | 'InvalidInputError' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type DeletePostSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeletePostSuccess'] = ResolversParentTypes['DeletePostSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EditPostResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EditPostResult'] = ResolversParentTypes['EditPostResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EditPostSuccess' | 'InvalidInputError' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type EditPostSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EditPostSuccess'] = ResolversParentTypes['EditPostSuccess']> = ResolversObject<{
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EditUserProfileResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EditUserProfileResult'] = ResolversParentTypes['EditUserProfileResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EditUserProfileSuccess' | 'InvalidInputError', ParentType, ContextType>;
}>;

export type EditUserProfileSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EditUserProfileSuccess'] = ResolversParentTypes['EditUserProfileSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type ErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceLimitExceededError' | 'ResourceNotFoundError' | 'UserEmailAlreadyTakenError' | 'UserNameAlreadyTakenError' | 'UserNotFoundError', ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type FollowUserResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FollowUserResult'] = ResolversParentTypes['FollowUserResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'FollowUserSuccess' | 'InvalidInputError' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type FollowUserSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FollowUserSuccess'] = ResolversParentTypes['FollowUserSuccess']> = ResolversObject<{
  alreadyFollowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  followee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  follower?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FollowerConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FollowerConnection'] = ResolversParentTypes['FollowerConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FollowerEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FollowerEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FollowerEdge'] = ResolversParentTypes['FollowerEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  followedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FollowingConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FollowingConnection'] = ResolversParentTypes['FollowingConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['FollowingEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FollowingEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FollowingEdge'] = ResolversParentTypes['FollowingEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  followedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvalidInputErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidInputError'] = ResolversParentTypes['InvalidInputError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LikeConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikeConnection'] = ResolversParentTypes['LikeConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['LikeEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LikeEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikeEdge'] = ResolversParentTypes['LikeEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  likedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LikePostResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikePostResult'] = ResolversParentTypes['LikePostResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'LikePostSuccess' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type LikePostSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikePostSuccess'] = ResolversParentTypes['LikePostSuccess']> = ResolversObject<{
  alreadyLiked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LikerConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikerConnection'] = ResolversParentTypes['LikerConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['LikerEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LikerEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikerEdge'] = ResolversParentTypes['LikerEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  likedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginResult'] = ResolversParentTypes['LoginResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'LoginSuccess' | 'UserNotFoundError', ParentType, ContextType>;
}>;

export type LoginSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginSuccess'] = ResolversParentTypes['LoginSuccess']> = ResolversObject<{
  token?: Resolver<ResolversTypes['NonEmptyString'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LogoutResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LogoutResult'] = ResolversParentTypes['LogoutResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'LogoutSuccess', ParentType, ContextType>;
}>;

export type LogoutSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LogoutSuccess'] = ResolversParentTypes['LogoutSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  blockUser?: Resolver<Maybe<ResolversTypes['BlockUserResult']>, ParentType, ContextType, RequireFields<MutationBlockUserArgs, 'id'>>;
  changeLoginPassword?: Resolver<Maybe<ResolversTypes['ChangeLoginPasswordResult']>, ParentType, ContextType, RequireFields<MutationChangeLoginPasswordArgs, 'password'>>;
  changeUserEmail?: Resolver<Maybe<ResolversTypes['ChangeUserEmailResult']>, ParentType, ContextType, RequireFields<MutationChangeUserEmailArgs, 'email'>>;
  changeUserName?: Resolver<Maybe<ResolversTypes['ChangeUserNameResult']>, ParentType, ContextType, RequireFields<MutationChangeUserNameArgs, 'name'>>;
  createPost?: Resolver<Maybe<ResolversTypes['CreatePostResult']>, ParentType, ContextType, RequireFields<MutationCreatePostArgs, 'content'>>;
  deleteAccount?: Resolver<Maybe<ResolversTypes['DeleteAccountResult']>, ParentType, ContextType>;
  deletePost?: Resolver<Maybe<ResolversTypes['DeletePostResult']>, ParentType, ContextType, RequireFields<MutationDeletePostArgs, 'id'>>;
  editPost?: Resolver<Maybe<ResolversTypes['EditPostResult']>, ParentType, ContextType, RequireFields<MutationEditPostArgs, 'content' | 'id'>>;
  editUserProfile?: Resolver<Maybe<ResolversTypes['EditUserProfileResult']>, ParentType, ContextType, Partial<MutationEditUserProfileArgs>>;
  followUser?: Resolver<Maybe<ResolversTypes['FollowUserResult']>, ParentType, ContextType, RequireFields<MutationFollowUserArgs, 'id'>>;
  likePost?: Resolver<Maybe<ResolversTypes['LikePostResult']>, ParentType, ContextType, RequireFields<MutationLikePostArgs, 'id'>>;
  login?: Resolver<Maybe<ResolversTypes['LoginResult']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'loginId' | 'password'>>;
  logout?: Resolver<Maybe<ResolversTypes['LogoutResult']>, ParentType, ContextType>;
  replyToPost?: Resolver<Maybe<ResolversTypes['ReplyToPostResult']>, ParentType, ContextType, RequireFields<MutationReplyToPostArgs, 'content' | 'id'>>;
  signup?: Resolver<Maybe<ResolversTypes['SignupResult']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'email' | 'name' | 'password'>>;
  unblockUser?: Resolver<Maybe<ResolversTypes['UnblockUserResult']>, ParentType, ContextType, RequireFields<MutationUnblockUserArgs, 'id'>>;
  unfollowUser?: Resolver<Maybe<ResolversTypes['UnfollowUserResult']>, ParentType, ContextType, RequireFields<MutationUnfollowUserArgs, 'id'>>;
  unlikePost?: Resolver<Maybe<ResolversTypes['UnlikePostResult']>, ParentType, ContextType, RequireFields<MutationUnlikePostArgs, 'id'>>;
}>;

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Post' | 'User', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export interface NonEmptyStringScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['NonEmptyString'], any> {
  name: 'NonEmptyString';
}

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post']> = ResolversObject<{
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  hasUpdated?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  likers?: Resolver<Maybe<ResolversTypes['LikerConnection']>, ParentType, ContextType, RequireFields<PostLikersArgs, 'reverse' | 'sortKey'>>;
  likesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parents?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType>;
  replies?: Resolver<Maybe<ResolversTypes['ReplyConnection']>, ParentType, ContextType, RequireFields<PostRepliesArgs, 'reverse' | 'sortKey'>>;
  repliesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  viewerHasLiked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostConnection'] = ResolversParentTypes['PostConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PostEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostEdge'] = ResolversParentTypes['PostEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  post?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType, RequireFields<QueryPostArgs, 'id'>>;
  posts?: Resolver<Maybe<ResolversTypes['PostConnection']>, ParentType, ContextType, RequireFields<QueryPostsArgs, 'reverse' | 'sortKey'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  viewer?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type ReplyConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReplyConnection'] = ResolversParentTypes['ReplyConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['ReplyEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ReplyEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReplyEdge'] = ResolversParentTypes['ReplyEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ReplyToPostResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReplyToPostResult'] = ResolversParentTypes['ReplyToPostResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ReplyToPostSuccess' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type ReplyToPostSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ReplyToPostSuccess'] = ResolversParentTypes['ReplyToPostSuccess']> = ResolversObject<{
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ResourceLimitExceededErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ResourceLimitExceededError'] = ResolversParentTypes['ResourceLimitExceededError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ResourceNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ResourceNotFoundError'] = ResolversParentTypes['ResourceNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SignupResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupResult'] = ResolversParentTypes['SignupResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'SignupSuccess' | 'UserEmailAlreadyTakenError' | 'UserNameAlreadyTakenError', ParentType, ContextType>;
}>;

export type SignupSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupSuccess'] = ResolversParentTypes['SignupSuccess']> = ResolversObject<{
  token?: Resolver<ResolversTypes['NonEmptyString'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UnblockUserResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UnblockUserResult'] = ResolversParentTypes['UnblockUserResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UnblockUserSuccess', ParentType, ContextType>;
}>;

export type UnblockUserSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UnblockUserSuccess'] = ResolversParentTypes['UnblockUserSuccess']> = ResolversObject<{
  alreadyUnblocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  unblockee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  unblocker?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnfollowUserResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UnfollowUserResult'] = ResolversParentTypes['UnfollowUserResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UnfollowUserSuccess', ParentType, ContextType>;
}>;

export type UnfollowUserSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UnfollowUserSuccess'] = ResolversParentTypes['UnfollowUserSuccess']> = ResolversObject<{
  alreadyUnfollowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  unfollowee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  unfollower?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnlikePostResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UnlikePostResult'] = ResolversParentTypes['UnlikePostResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UnlikePostSuccess', ParentType, ContextType>;
}>;

export type UnlikePostSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UnlikePostSuccess'] = ResolversParentTypes['UnlikePostSuccess']> = ResolversObject<{
  alreadyUnliked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  avatar?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  blockers?: Resolver<Maybe<ResolversTypes['BlockerConnection']>, ParentType, ContextType, RequireFields<UserBlockersArgs, 'reverse' | 'sortKey'>>;
  blockings?: Resolver<Maybe<ResolversTypes['BlockingConnection']>, ParentType, ContextType, RequireFields<UserBlockingsArgs, 'reverse' | 'sortKey'>>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['EmailAddress']>, ParentType, ContextType>;
  followers?: Resolver<Maybe<ResolversTypes['FollowerConnection']>, ParentType, ContextType, RequireFields<UserFollowersArgs, 'reverse' | 'sortKey'>>;
  followings?: Resolver<Maybe<ResolversTypes['FollowingConnection']>, ParentType, ContextType, RequireFields<UserFollowingsArgs, 'reverse' | 'sortKey'>>;
  handle?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isBlockingViewer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isFollowingViewer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  likes?: Resolver<Maybe<ResolversTypes['LikeConnection']>, ParentType, ContextType, RequireFields<UserLikesArgs, 'reverse' | 'sortKey'>>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  posts?: Resolver<Maybe<ResolversTypes['PostConnection']>, ParentType, ContextType, RequireFields<UserPostsArgs, 'reverse' | 'sortKey'>>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerIsBlocking?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  viewerIsFollowing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEmailAlreadyTakenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEmailAlreadyTakenError'] = ResolversParentTypes['UserEmailAlreadyTakenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserNameAlreadyTakenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNameAlreadyTakenError'] = ResolversParentTypes['UserNameAlreadyTakenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNotFoundError'] = ResolversParentTypes['UserNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  BlockUserResult?: BlockUserResultResolvers<ContextType>;
  BlockUserSuccess?: BlockUserSuccessResolvers<ContextType>;
  BlockerConnection?: BlockerConnectionResolvers<ContextType>;
  BlockerEdge?: BlockerEdgeResolvers<ContextType>;
  BlockingConnection?: BlockingConnectionResolvers<ContextType>;
  BlockingEdge?: BlockingEdgeResolvers<ContextType>;
  ChangeLoginPasswordResult?: ChangeLoginPasswordResultResolvers<ContextType>;
  ChangeLoginPasswordSuccess?: ChangeLoginPasswordSuccessResolvers<ContextType>;
  ChangeUserEmailResult?: ChangeUserEmailResultResolvers<ContextType>;
  ChangeUserEmailSuccess?: ChangeUserEmailSuccessResolvers<ContextType>;
  ChangeUserNameResult?: ChangeUserNameResultResolvers<ContextType>;
  ChangeUserNameSuccess?: ChangeUserNameSuccessResolvers<ContextType>;
  CreatePostResult?: CreatePostResultResolvers<ContextType>;
  CreatePostSuccess?: CreatePostSuccessResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteAccountResult?: DeleteAccountResultResolvers<ContextType>;
  DeleteAccountSuccess?: DeleteAccountSuccessResolvers<ContextType>;
  DeletePostResult?: DeletePostResultResolvers<ContextType>;
  DeletePostSuccess?: DeletePostSuccessResolvers<ContextType>;
  EditPostResult?: EditPostResultResolvers<ContextType>;
  EditPostSuccess?: EditPostSuccessResolvers<ContextType>;
  EditUserProfileResult?: EditUserProfileResultResolvers<ContextType>;
  EditUserProfileSuccess?: EditUserProfileSuccessResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  Error?: ErrorResolvers<ContextType>;
  FollowUserResult?: FollowUserResultResolvers<ContextType>;
  FollowUserSuccess?: FollowUserSuccessResolvers<ContextType>;
  FollowerConnection?: FollowerConnectionResolvers<ContextType>;
  FollowerEdge?: FollowerEdgeResolvers<ContextType>;
  FollowingConnection?: FollowingConnectionResolvers<ContextType>;
  FollowingEdge?: FollowingEdgeResolvers<ContextType>;
  InvalidInputError?: InvalidInputErrorResolvers<ContextType>;
  LikeConnection?: LikeConnectionResolvers<ContextType>;
  LikeEdge?: LikeEdgeResolvers<ContextType>;
  LikePostResult?: LikePostResultResolvers<ContextType>;
  LikePostSuccess?: LikePostSuccessResolvers<ContextType>;
  LikerConnection?: LikerConnectionResolvers<ContextType>;
  LikerEdge?: LikerEdgeResolvers<ContextType>;
  LoginResult?: LoginResultResolvers<ContextType>;
  LoginSuccess?: LoginSuccessResolvers<ContextType>;
  LogoutResult?: LogoutResultResolvers<ContextType>;
  LogoutSuccess?: LogoutSuccessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  NonEmptyString?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  PostConnection?: PostConnectionResolvers<ContextType>;
  PostEdge?: PostEdgeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReplyConnection?: ReplyConnectionResolvers<ContextType>;
  ReplyEdge?: ReplyEdgeResolvers<ContextType>;
  ReplyToPostResult?: ReplyToPostResultResolvers<ContextType>;
  ReplyToPostSuccess?: ReplyToPostSuccessResolvers<ContextType>;
  ResourceLimitExceededError?: ResourceLimitExceededErrorResolvers<ContextType>;
  ResourceNotFoundError?: ResourceNotFoundErrorResolvers<ContextType>;
  SignupResult?: SignupResultResolvers<ContextType>;
  SignupSuccess?: SignupSuccessResolvers<ContextType>;
  URL?: GraphQLScalarType;
  UnblockUserResult?: UnblockUserResultResolvers<ContextType>;
  UnblockUserSuccess?: UnblockUserSuccessResolvers<ContextType>;
  UnfollowUserResult?: UnfollowUserResultResolvers<ContextType>;
  UnfollowUserSuccess?: UnfollowUserSuccessResolvers<ContextType>;
  UnlikePostResult?: UnlikePostResultResolvers<ContextType>;
  UnlikePostSuccess?: UnlikePostSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserEmailAlreadyTakenError?: UserEmailAlreadyTakenErrorResolvers<ContextType>;
  UserNameAlreadyTakenError?: UserNameAlreadyTakenErrorResolvers<ContextType>;
  UserNotFoundError?: UserNotFoundErrorResolvers<ContextType>;
}>;

