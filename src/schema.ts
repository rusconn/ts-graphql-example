import type { ID } from './graphql/ID.ts';
import type { DateTime } from './graphql/DateTime.ts';
import type { EmailAddress } from './graphql/EmailAddress.ts';
import type { NonEmptyString } from './graphql/NonEmptyString.ts';
import type { URL } from './graphql/URL.ts';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { Node as NodeMapper } from './graphql/Node/_mapper.ts';
import type { Post as PostMapper } from './graphql/Post/_mapper.ts';
import type { User as UserMapper } from './graphql/User/_mapper.ts';
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

export type AccountDeleteResult = AccountDeleteSuccess;

export type AccountDeleteSuccess = {
  __typename?: 'AccountDeleteSuccess';
  id: Scalars['ID']['output'];
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

export type Error = {
  message: Scalars['String']['output'];
};

export enum ErrorCode {
  AuthenticationError = 'AUTHENTICATION_ERROR',
  BadUserInput = 'BAD_USER_INPUT',
  Forbidden = 'FORBIDDEN',
  InternalServerError = 'INTERNAL_SERVER_ERROR'
}

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

export type LikedPostConnection = {
  __typename?: 'LikedPostConnection';
  edges?: Maybe<Array<Maybe<LikedPostEdge>>>;
  nodes?: Maybe<Array<Maybe<Post>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type LikedPostEdge = {
  __typename?: 'LikedPostEdge';
  cursor: Scalars['String']['output'];
  likedAt?: Maybe<Scalars['DateTime']['output']>;
  node?: Maybe<Post>;
};

export enum LikedPostSortKeys {
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

export type LoginPasswordChangeResult = InvalidInputError | LoginPasswordChangeSuccess;

export type LoginPasswordChangeSuccess = {
  __typename?: 'LoginPasswordChangeSuccess';
  id: Scalars['ID']['output'];
};

export type LoginResult = InvalidInputError | LoginSuccess | UserNotFoundError;

export type LoginSuccess = {
  __typename?: 'LoginSuccess';
  token: Scalars['NonEmptyString']['output'];
};

export type LogoutResult = LogoutSuccess;

export type LogoutSuccess = {
  __typename?: 'LogoutSuccess';
  id: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** 紐づくリソースは全て削除される */
  accountDelete?: Maybe<AccountDeleteResult>;
  login?: Maybe<LoginResult>;
  loginPasswordChange?: Maybe<LoginPasswordChangeResult>;
  logout?: Maybe<LogoutResult>;
  postCreate?: Maybe<PostCreateResult>;
  postDelete?: Maybe<PostDeleteResult>;
  postEdit?: Maybe<PostEditResult>;
  postLike?: Maybe<PostLikeResult>;
  postReply?: Maybe<PostReplyResult>;
  postUnlike?: Maybe<PostUnlikeResult>;
  signup?: Maybe<SignupResult>;
  userBlock?: Maybe<UserBlockResult>;
  userEmailChange?: Maybe<UserEmailChangeResult>;
  userFollow?: Maybe<UserFollowResult>;
  userNameChange?: Maybe<UserNameChangeResult>;
  userProfileEdit?: Maybe<UserProfileEditResult>;
  userUnblock?: Maybe<UserUnblockResult>;
  userUnfollow?: Maybe<UserUnfollowResult>;
};


export type MutationLoginArgs = {
  loginId: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
};


export type MutationLoginPasswordChangeArgs = {
  password: Scalars['NonEmptyString']['input'];
};


export type MutationPostCreateArgs = {
  content: Scalars['NonEmptyString']['input'];
};


export type MutationPostDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPostEditArgs = {
  content: Scalars['NonEmptyString']['input'];
  id: Scalars['ID']['input'];
};


export type MutationPostLikeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPostReplyArgs = {
  content: Scalars['NonEmptyString']['input'];
  id: Scalars['ID']['input'];
};


export type MutationPostUnlikeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSignupArgs = {
  email: Scalars['NonEmptyString']['input'];
  name: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
};


export type MutationUserBlockArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserEmailChangeArgs = {
  email: Scalars['NonEmptyString']['input'];
};


export type MutationUserFollowArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserNameChangeArgs = {
  name: Scalars['NonEmptyString']['input'];
};


export type MutationUserProfileEditArgs = {
  avatar?: InputMaybe<Scalars['URL']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  handle?: InputMaybe<Scalars['NonEmptyString']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['URL']['input']>;
};


export type MutationUserUnblockArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUserUnfollowArgs = {
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
  hasDeleted?: Maybe<Scalars['Boolean']['output']>;
  hasUpdated?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  likeCount?: Maybe<Scalars['Int']['output']>;
  likers?: Maybe<LikerConnection>;
  parents?: Maybe<PostParentConnection>;
  replies?: Maybe<ReplyConnection>;
  replyCount?: Maybe<Scalars['Int']['output']>;
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


export type PostParentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: PostParentSortKeys;
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

export type PostCreateResult = InvalidInputError | PostCreateSuccess;

export type PostCreateSuccess = {
  __typename?: 'PostCreateSuccess';
  post: Post;
};

export type PostDeleteResult = InvalidInputError | PostDeleteSuccess | ResourceNotFoundError;

export type PostDeleteSuccess = {
  __typename?: 'PostDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Post>;
};

export type PostEditResult = InvalidInputError | PostEditSuccess | ResourceNotFoundError;

export type PostEditSuccess = {
  __typename?: 'PostEditSuccess';
  post: Post;
};

export type PostLikeResult = InvalidInputError | PostLikeSuccess | ResourceNotFoundError;

export type PostLikeSuccess = {
  __typename?: 'PostLikeSuccess';
  alreadyLiked: Scalars['Boolean']['output'];
  post: Post;
};

export type PostParentConnection = {
  __typename?: 'PostParentConnection';
  edges?: Maybe<Array<Maybe<PostParentEdge>>>;
  nodes?: Maybe<Array<Maybe<Post>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PostParentEdge = {
  __typename?: 'PostParentEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Post>;
};

export enum PostParentSortKeys {
  CreatedAt = 'CREATED_AT'
}

export type PostReplyResult = InvalidInputError | PostReplySuccess | ResourceNotFoundError;

export type PostReplySuccess = {
  __typename?: 'PostReplySuccess';
  post: Post;
};

export enum PostSortKeys {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export type PostUnlikeResult = InvalidInputError | PostUnlikeSuccess | ResourceNotFoundError;

export type PostUnlikeSuccess = {
  __typename?: 'PostUnlikeSuccess';
  alreadyUnliked: Scalars['Boolean']['output'];
  post: Post;
};

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
  repliedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum ReplySortKeys {
  RepliedAt = 'REPLIED_AT'
}

export type ResourceNotFoundError = Error & {
  __typename?: 'ResourceNotFoundError';
  message: Scalars['String']['output'];
};

export type SignupResult = InvalidInputError | SignupSuccess | UserEmailAlreadyTakenError | UserNameAlreadyTakenError;

export type SignupSuccess = {
  __typename?: 'SignupSuccess';
  token: Scalars['NonEmptyString']['output'];
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
  likedPosts?: Maybe<LikedPostConnection>;
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


export type UserLikedPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: LikedPostSortKeys;
};


export type UserPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: UserPostSortKeys;
};

export type UserBlockResult = InvalidInputError | ResourceNotFoundError | UserBlockSuccess;

export type UserBlockSuccess = {
  __typename?: 'UserBlockSuccess';
  alreadyBlocked: Scalars['Boolean']['output'];
  blockee: User;
  blocker: User;
};

export type UserEmailAlreadyTakenError = Error & {
  __typename?: 'UserEmailAlreadyTakenError';
  message: Scalars['String']['output'];
};

export type UserEmailChangeResult = InvalidInputError | UserEmailAlreadyTakenError | UserEmailChangeSuccess;

export type UserEmailChangeSuccess = {
  __typename?: 'UserEmailChangeSuccess';
  user: User;
};

export type UserFollowResult = InvalidInputError | ResourceNotFoundError | UserFollowSuccess;

export type UserFollowSuccess = {
  __typename?: 'UserFollowSuccess';
  alreadyFollowed: Scalars['Boolean']['output'];
  followee: User;
  follower: User;
};

export type UserNameAlreadyTakenError = Error & {
  __typename?: 'UserNameAlreadyTakenError';
  message: Scalars['String']['output'];
};

export type UserNameChangeResult = InvalidInputError | UserNameAlreadyTakenError | UserNameChangeSuccess;

export type UserNameChangeSuccess = {
  __typename?: 'UserNameChangeSuccess';
  user: User;
};

export type UserNotFoundError = Error & {
  __typename?: 'UserNotFoundError';
  message: Scalars['String']['output'];
};

export enum UserPostSortKeys {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export type UserProfileEditResult = InvalidInputError | UserProfileEditSuccess;

export type UserProfileEditSuccess = {
  __typename?: 'UserProfileEditSuccess';
  user: User;
};

export type UserUnblockResult = InvalidInputError | ResourceNotFoundError | UserUnblockSuccess;

export type UserUnblockSuccess = {
  __typename?: 'UserUnblockSuccess';
  alreadyUnblocked: Scalars['Boolean']['output'];
  unblockee: User;
  unblocker: User;
};

export type UserUnfollowResult = InvalidInputError | ResourceNotFoundError | UserUnfollowSuccess;

export type UserUnfollowSuccess = {
  __typename?: 'UserUnfollowSuccess';
  alreadyUnfollowed: Scalars['Boolean']['output'];
  unfollowee: User;
  unfollower: User;
};

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
  AccountDeleteResult: ( AccountDeleteSuccess & { __typename: 'AccountDeleteSuccess' } );
  LoginPasswordChangeResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( LoginPasswordChangeSuccess & { __typename: 'LoginPasswordChangeSuccess' } );
  LoginResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( LoginSuccess & { __typename: 'LoginSuccess' } ) | ( UserNotFoundError & { __typename: 'UserNotFoundError' } );
  LogoutResult: ( LogoutSuccess & { __typename: 'LogoutSuccess' } );
  PostCreateResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<PostCreateSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'PostCreateSuccess' } );
  PostDeleteResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( PostDeleteSuccess & { __typename: 'PostDeleteSuccess' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  PostEditResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<PostEditSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'PostEditSuccess' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  PostLikeResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<PostLikeSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'PostLikeSuccess' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  PostReplyResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<PostReplySuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'PostReplySuccess' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  PostUnlikeResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<PostUnlikeSuccess, 'post'> & { post: RefType['Post'] } & { __typename: 'PostUnlikeSuccess' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  SignupResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( SignupSuccess & { __typename: 'SignupSuccess' } ) | ( UserEmailAlreadyTakenError & { __typename: 'UserEmailAlreadyTakenError' } ) | ( UserNameAlreadyTakenError & { __typename: 'UserNameAlreadyTakenError' } );
  UserBlockResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UserBlockSuccess, 'blockee' | 'blocker'> & { blockee: RefType['User'], blocker: RefType['User'] } & { __typename: 'UserBlockSuccess' } );
  UserEmailChangeResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( UserEmailAlreadyTakenError & { __typename: 'UserEmailAlreadyTakenError' } ) | ( Omit<UserEmailChangeSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'UserEmailChangeSuccess' } );
  UserFollowResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UserFollowSuccess, 'followee' | 'follower'> & { followee: RefType['User'], follower: RefType['User'] } & { __typename: 'UserFollowSuccess' } );
  UserNameChangeResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( UserNameAlreadyTakenError & { __typename: 'UserNameAlreadyTakenError' } ) | ( Omit<UserNameChangeSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'UserNameChangeSuccess' } );
  UserProfileEditResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<UserProfileEditSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'UserProfileEditSuccess' } );
  UserUnblockResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UserUnblockSuccess, 'unblockee' | 'unblocker'> & { unblockee: RefType['User'], unblocker: RefType['User'] } & { __typename: 'UserUnblockSuccess' } );
  UserUnfollowResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UserUnfollowSuccess, 'unfollowee' | 'unfollower'> & { unfollowee: RefType['User'], unfollower: RefType['User'] } & { __typename: 'UserUnfollowSuccess' } );
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  Error: ( InvalidInputError ) | ( ResourceNotFoundError ) | ( UserEmailAlreadyTakenError ) | ( UserNameAlreadyTakenError ) | ( UserNotFoundError );
  Node: ( PostMapper ) | ( UserMapper );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AccountDeleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccountDeleteResult']>;
  AccountDeleteSuccess: ResolverTypeWrapper<AccountDeleteSuccess>;
  BlockerConnection: ResolverTypeWrapper<Omit<BlockerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['BlockerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  BlockerEdge: ResolverTypeWrapper<Omit<BlockerEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  BlockerSortKeys: BlockerSortKeys;
  BlockingConnection: ResolverTypeWrapper<Omit<BlockingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['BlockingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  BlockingEdge: ResolverTypeWrapper<Omit<BlockingEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  BlockingSortKeys: BlockingSortKeys;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  Error: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Error']>;
  ErrorCode: ErrorCode;
  FollowerConnection: ResolverTypeWrapper<Omit<FollowerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['FollowerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  FollowerEdge: ResolverTypeWrapper<Omit<FollowerEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  FollowerSortKeys: FollowerSortKeys;
  FollowingConnection: ResolverTypeWrapper<Omit<FollowingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['FollowingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  FollowingEdge: ResolverTypeWrapper<Omit<FollowingEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  FollowingSortKeys: FollowingSortKeys;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputError: ResolverTypeWrapper<InvalidInputError>;
  LikedPostConnection: ResolverTypeWrapper<Omit<LikedPostConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['LikedPostEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Post']>>> }>;
  LikedPostEdge: ResolverTypeWrapper<Omit<LikedPostEdge, 'node'> & { node: Maybe<ResolversTypes['Post']> }>;
  LikedPostSortKeys: LikedPostSortKeys;
  LikerConnection: ResolverTypeWrapper<Omit<LikerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['LikerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  LikerEdge: ResolverTypeWrapper<Omit<LikerEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  LikerSortKeys: LikerSortKeys;
  LoginPasswordChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LoginPasswordChangeResult']>;
  LoginPasswordChangeSuccess: ResolverTypeWrapper<LoginPasswordChangeSuccess>;
  LoginResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LoginResult']>;
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>;
  LogoutResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LogoutResult']>;
  LogoutSuccess: ResolverTypeWrapper<LogoutSuccess>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<NodeMapper>;
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']['output']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Post: ResolverTypeWrapper<PostMapper>;
  PostConnection: ResolverTypeWrapper<Omit<PostConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['PostEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Post']>>> }>;
  PostCreateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostCreateResult']>;
  PostCreateSuccess: ResolverTypeWrapper<Omit<PostCreateSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  PostDeleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostDeleteResult']>;
  PostDeleteSuccess: ResolverTypeWrapper<PostDeleteSuccess>;
  PostEdge: ResolverTypeWrapper<Omit<PostEdge, 'node'> & { node: Maybe<ResolversTypes['Post']> }>;
  PostEditResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostEditResult']>;
  PostEditSuccess: ResolverTypeWrapper<Omit<PostEditSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  PostLikeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostLikeResult']>;
  PostLikeSuccess: ResolverTypeWrapper<Omit<PostLikeSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  PostParentConnection: ResolverTypeWrapper<Omit<PostParentConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['PostParentEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Post']>>> }>;
  PostParentEdge: ResolverTypeWrapper<Omit<PostParentEdge, 'node'> & { node: Maybe<ResolversTypes['Post']> }>;
  PostParentSortKeys: PostParentSortKeys;
  PostReplyResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostReplyResult']>;
  PostReplySuccess: ResolverTypeWrapper<Omit<PostReplySuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  PostSortKeys: PostSortKeys;
  PostUnlikeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostUnlikeResult']>;
  PostUnlikeSuccess: ResolverTypeWrapper<Omit<PostUnlikeSuccess, 'post'> & { post: ResolversTypes['Post'] }>;
  Query: ResolverTypeWrapper<{}>;
  ReplyConnection: ResolverTypeWrapper<Omit<ReplyConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['ReplyEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Post']>>> }>;
  ReplyEdge: ResolverTypeWrapper<Omit<ReplyEdge, 'node'> & { node: Maybe<ResolversTypes['Post']> }>;
  ReplySortKeys: ReplySortKeys;
  ResourceNotFoundError: ResolverTypeWrapper<ResourceNotFoundError>;
  SignupResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SignupResult']>;
  SignupSuccess: ResolverTypeWrapper<SignupSuccess>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  User: ResolverTypeWrapper<UserMapper>;
  UserBlockResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserBlockResult']>;
  UserBlockSuccess: ResolverTypeWrapper<Omit<UserBlockSuccess, 'blockee' | 'blocker'> & { blockee: ResolversTypes['User'], blocker: ResolversTypes['User'] }>;
  UserEmailAlreadyTakenError: ResolverTypeWrapper<UserEmailAlreadyTakenError>;
  UserEmailChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserEmailChangeResult']>;
  UserEmailChangeSuccess: ResolverTypeWrapper<Omit<UserEmailChangeSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  UserFollowResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserFollowResult']>;
  UserFollowSuccess: ResolverTypeWrapper<Omit<UserFollowSuccess, 'followee' | 'follower'> & { followee: ResolversTypes['User'], follower: ResolversTypes['User'] }>;
  UserNameAlreadyTakenError: ResolverTypeWrapper<UserNameAlreadyTakenError>;
  UserNameChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserNameChangeResult']>;
  UserNameChangeSuccess: ResolverTypeWrapper<Omit<UserNameChangeSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  UserNotFoundError: ResolverTypeWrapper<UserNotFoundError>;
  UserPostSortKeys: UserPostSortKeys;
  UserProfileEditResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserProfileEditResult']>;
  UserProfileEditSuccess: ResolverTypeWrapper<Omit<UserProfileEditSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  UserUnblockResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserUnblockResult']>;
  UserUnblockSuccess: ResolverTypeWrapper<Omit<UserUnblockSuccess, 'unblockee' | 'unblocker'> & { unblockee: ResolversTypes['User'], unblocker: ResolversTypes['User'] }>;
  UserUnfollowResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserUnfollowResult']>;
  UserUnfollowSuccess: ResolverTypeWrapper<Omit<UserUnfollowSuccess, 'unfollowee' | 'unfollower'> & { unfollowee: ResolversTypes['User'], unfollower: ResolversTypes['User'] }>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AccountDeleteResult: ResolversUnionTypes<ResolversParentTypes>['AccountDeleteResult'];
  AccountDeleteSuccess: AccountDeleteSuccess;
  BlockerConnection: Omit<BlockerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['BlockerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  BlockerEdge: Omit<BlockerEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  BlockingConnection: Omit<BlockingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['BlockingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  BlockingEdge: Omit<BlockingEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  EmailAddress: Scalars['EmailAddress']['output'];
  Error: ResolversInterfaceTypes<ResolversParentTypes>['Error'];
  FollowerConnection: Omit<FollowerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['FollowerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  FollowerEdge: Omit<FollowerEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  FollowingConnection: Omit<FollowingConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['FollowingEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  FollowingEdge: Omit<FollowingEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  InvalidInputError: InvalidInputError;
  LikedPostConnection: Omit<LikedPostConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['LikedPostEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Post']>>> };
  LikedPostEdge: Omit<LikedPostEdge, 'node'> & { node: Maybe<ResolversParentTypes['Post']> };
  LikerConnection: Omit<LikerConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['LikerEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  LikerEdge: Omit<LikerEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  LoginPasswordChangeResult: ResolversUnionTypes<ResolversParentTypes>['LoginPasswordChangeResult'];
  LoginPasswordChangeSuccess: LoginPasswordChangeSuccess;
  LoginResult: ResolversUnionTypes<ResolversParentTypes>['LoginResult'];
  LoginSuccess: LoginSuccess;
  LogoutResult: ResolversUnionTypes<ResolversParentTypes>['LogoutResult'];
  LogoutSuccess: LogoutSuccess;
  Mutation: {};
  Node: NodeMapper;
  NonEmptyString: Scalars['NonEmptyString']['output'];
  PageInfo: PageInfo;
  Post: PostMapper;
  PostConnection: Omit<PostConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['PostEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Post']>>> };
  PostCreateResult: ResolversUnionTypes<ResolversParentTypes>['PostCreateResult'];
  PostCreateSuccess: Omit<PostCreateSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  PostDeleteResult: ResolversUnionTypes<ResolversParentTypes>['PostDeleteResult'];
  PostDeleteSuccess: PostDeleteSuccess;
  PostEdge: Omit<PostEdge, 'node'> & { node: Maybe<ResolversParentTypes['Post']> };
  PostEditResult: ResolversUnionTypes<ResolversParentTypes>['PostEditResult'];
  PostEditSuccess: Omit<PostEditSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  PostLikeResult: ResolversUnionTypes<ResolversParentTypes>['PostLikeResult'];
  PostLikeSuccess: Omit<PostLikeSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  PostParentConnection: Omit<PostParentConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['PostParentEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Post']>>> };
  PostParentEdge: Omit<PostParentEdge, 'node'> & { node: Maybe<ResolversParentTypes['Post']> };
  PostReplyResult: ResolversUnionTypes<ResolversParentTypes>['PostReplyResult'];
  PostReplySuccess: Omit<PostReplySuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  PostUnlikeResult: ResolversUnionTypes<ResolversParentTypes>['PostUnlikeResult'];
  PostUnlikeSuccess: Omit<PostUnlikeSuccess, 'post'> & { post: ResolversParentTypes['Post'] };
  Query: {};
  ReplyConnection: Omit<ReplyConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['ReplyEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Post']>>> };
  ReplyEdge: Omit<ReplyEdge, 'node'> & { node: Maybe<ResolversParentTypes['Post']> };
  ResourceNotFoundError: ResourceNotFoundError;
  SignupResult: ResolversUnionTypes<ResolversParentTypes>['SignupResult'];
  SignupSuccess: SignupSuccess;
  String: Scalars['String']['output'];
  URL: Scalars['URL']['output'];
  User: UserMapper;
  UserBlockResult: ResolversUnionTypes<ResolversParentTypes>['UserBlockResult'];
  UserBlockSuccess: Omit<UserBlockSuccess, 'blockee' | 'blocker'> & { blockee: ResolversParentTypes['User'], blocker: ResolversParentTypes['User'] };
  UserEmailAlreadyTakenError: UserEmailAlreadyTakenError;
  UserEmailChangeResult: ResolversUnionTypes<ResolversParentTypes>['UserEmailChangeResult'];
  UserEmailChangeSuccess: Omit<UserEmailChangeSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  UserFollowResult: ResolversUnionTypes<ResolversParentTypes>['UserFollowResult'];
  UserFollowSuccess: Omit<UserFollowSuccess, 'followee' | 'follower'> & { followee: ResolversParentTypes['User'], follower: ResolversParentTypes['User'] };
  UserNameAlreadyTakenError: UserNameAlreadyTakenError;
  UserNameChangeResult: ResolversUnionTypes<ResolversParentTypes>['UserNameChangeResult'];
  UserNameChangeSuccess: Omit<UserNameChangeSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  UserNotFoundError: UserNotFoundError;
  UserProfileEditResult: ResolversUnionTypes<ResolversParentTypes>['UserProfileEditResult'];
  UserProfileEditSuccess: Omit<UserProfileEditSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  UserUnblockResult: ResolversUnionTypes<ResolversParentTypes>['UserUnblockResult'];
  UserUnblockSuccess: Omit<UserUnblockSuccess, 'unblockee' | 'unblocker'> & { unblockee: ResolversParentTypes['User'], unblocker: ResolversParentTypes['User'] };
  UserUnfollowResult: ResolversUnionTypes<ResolversParentTypes>['UserUnfollowResult'];
  UserUnfollowSuccess: Omit<UserUnfollowSuccess, 'unfollowee' | 'unfollower'> & { unfollowee: ResolversParentTypes['User'], unfollower: ResolversParentTypes['User'] };
}>;

export type AccountDeleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteResult'] = ResolversParentTypes['AccountDeleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountDeleteSuccess', ParentType, ContextType>;
}>;

export type AccountDeleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteSuccess'] = ResolversParentTypes['AccountDeleteSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type ErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UserEmailAlreadyTakenError' | 'UserNameAlreadyTakenError' | 'UserNotFoundError', ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type LikedPostConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikedPostConnection'] = ResolversParentTypes['LikedPostConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['LikedPostEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LikedPostEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LikedPostEdge'] = ResolversParentTypes['LikedPostEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  likedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
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

export type LoginPasswordChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginPasswordChangeResult'] = ResolversParentTypes['LoginPasswordChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'LoginPasswordChangeSuccess', ParentType, ContextType>;
}>;

export type LoginPasswordChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginPasswordChangeSuccess'] = ResolversParentTypes['LoginPasswordChangeSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  accountDelete?: Resolver<Maybe<ResolversTypes['AccountDeleteResult']>, ParentType, ContextType>;
  login?: Resolver<Maybe<ResolversTypes['LoginResult']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'loginId' | 'password'>>;
  loginPasswordChange?: Resolver<Maybe<ResolversTypes['LoginPasswordChangeResult']>, ParentType, ContextType, RequireFields<MutationLoginPasswordChangeArgs, 'password'>>;
  logout?: Resolver<Maybe<ResolversTypes['LogoutResult']>, ParentType, ContextType>;
  postCreate?: Resolver<Maybe<ResolversTypes['PostCreateResult']>, ParentType, ContextType, RequireFields<MutationPostCreateArgs, 'content'>>;
  postDelete?: Resolver<Maybe<ResolversTypes['PostDeleteResult']>, ParentType, ContextType, RequireFields<MutationPostDeleteArgs, 'id'>>;
  postEdit?: Resolver<Maybe<ResolversTypes['PostEditResult']>, ParentType, ContextType, RequireFields<MutationPostEditArgs, 'content' | 'id'>>;
  postLike?: Resolver<Maybe<ResolversTypes['PostLikeResult']>, ParentType, ContextType, RequireFields<MutationPostLikeArgs, 'id'>>;
  postReply?: Resolver<Maybe<ResolversTypes['PostReplyResult']>, ParentType, ContextType, RequireFields<MutationPostReplyArgs, 'content' | 'id'>>;
  postUnlike?: Resolver<Maybe<ResolversTypes['PostUnlikeResult']>, ParentType, ContextType, RequireFields<MutationPostUnlikeArgs, 'id'>>;
  signup?: Resolver<Maybe<ResolversTypes['SignupResult']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'email' | 'name' | 'password'>>;
  userBlock?: Resolver<Maybe<ResolversTypes['UserBlockResult']>, ParentType, ContextType, RequireFields<MutationUserBlockArgs, 'id'>>;
  userEmailChange?: Resolver<Maybe<ResolversTypes['UserEmailChangeResult']>, ParentType, ContextType, RequireFields<MutationUserEmailChangeArgs, 'email'>>;
  userFollow?: Resolver<Maybe<ResolversTypes['UserFollowResult']>, ParentType, ContextType, RequireFields<MutationUserFollowArgs, 'id'>>;
  userNameChange?: Resolver<Maybe<ResolversTypes['UserNameChangeResult']>, ParentType, ContextType, RequireFields<MutationUserNameChangeArgs, 'name'>>;
  userProfileEdit?: Resolver<Maybe<ResolversTypes['UserProfileEditResult']>, ParentType, ContextType, Partial<MutationUserProfileEditArgs>>;
  userUnblock?: Resolver<Maybe<ResolversTypes['UserUnblockResult']>, ParentType, ContextType, RequireFields<MutationUserUnblockArgs, 'id'>>;
  userUnfollow?: Resolver<Maybe<ResolversTypes['UserUnfollowResult']>, ParentType, ContextType, RequireFields<MutationUserUnfollowArgs, 'id'>>;
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
  hasDeleted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasUpdated?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  likeCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  likers?: Resolver<Maybe<ResolversTypes['LikerConnection']>, ParentType, ContextType, RequireFields<PostLikersArgs, 'reverse' | 'sortKey'>>;
  parents?: Resolver<Maybe<ResolversTypes['PostParentConnection']>, ParentType, ContextType, RequireFields<PostParentsArgs, 'reverse' | 'sortKey'>>;
  replies?: Resolver<Maybe<ResolversTypes['ReplyConnection']>, ParentType, ContextType, RequireFields<PostRepliesArgs, 'reverse' | 'sortKey'>>;
  replyCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type PostCreateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostCreateResult'] = ResolversParentTypes['PostCreateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'PostCreateSuccess', ParentType, ContextType>;
}>;

export type PostCreateSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostCreateSuccess'] = ResolversParentTypes['PostCreateSuccess']> = ResolversObject<{
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostDeleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostDeleteResult'] = ResolversParentTypes['PostDeleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'PostDeleteSuccess' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type PostDeleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostDeleteSuccess'] = ResolversParentTypes['PostDeleteSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostEdge'] = ResolversParentTypes['PostEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostEditResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostEditResult'] = ResolversParentTypes['PostEditResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'PostEditSuccess' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type PostEditSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostEditSuccess'] = ResolversParentTypes['PostEditSuccess']> = ResolversObject<{
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostLikeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostLikeResult'] = ResolversParentTypes['PostLikeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'PostLikeSuccess' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type PostLikeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostLikeSuccess'] = ResolversParentTypes['PostLikeSuccess']> = ResolversObject<{
  alreadyLiked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostParentConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostParentConnection'] = ResolversParentTypes['PostParentConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['PostParentEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostParentEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostParentEdge'] = ResolversParentTypes['PostParentEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostReplyResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostReplyResult'] = ResolversParentTypes['PostReplyResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'PostReplySuccess' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type PostReplySuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostReplySuccess'] = ResolversParentTypes['PostReplySuccess']> = ResolversObject<{
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PostUnlikeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostUnlikeResult'] = ResolversParentTypes['PostUnlikeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'PostUnlikeSuccess' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type PostUnlikeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PostUnlikeSuccess'] = ResolversParentTypes['PostUnlikeSuccess']> = ResolversObject<{
  alreadyUnliked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
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
  repliedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
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
  likedPosts?: Resolver<Maybe<ResolversTypes['LikedPostConnection']>, ParentType, ContextType, RequireFields<UserLikedPostsArgs, 'reverse' | 'sortKey'>>;
  location?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  posts?: Resolver<Maybe<ResolversTypes['PostConnection']>, ParentType, ContextType, RequireFields<UserPostsArgs, 'reverse' | 'sortKey'>>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerIsBlocking?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  viewerIsFollowing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserBlockResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserBlockResult'] = ResolversParentTypes['UserBlockResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UserBlockSuccess', ParentType, ContextType>;
}>;

export type UserBlockSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserBlockSuccess'] = ResolversParentTypes['UserBlockSuccess']> = ResolversObject<{
  alreadyBlocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  blockee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  blocker?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEmailAlreadyTakenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEmailAlreadyTakenError'] = ResolversParentTypes['UserEmailAlreadyTakenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEmailChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEmailChangeResult'] = ResolversParentTypes['UserEmailChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'UserEmailAlreadyTakenError' | 'UserEmailChangeSuccess', ParentType, ContextType>;
}>;

export type UserEmailChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEmailChangeSuccess'] = ResolversParentTypes['UserEmailChangeSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserFollowResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserFollowResult'] = ResolversParentTypes['UserFollowResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UserFollowSuccess', ParentType, ContextType>;
}>;

export type UserFollowSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserFollowSuccess'] = ResolversParentTypes['UserFollowSuccess']> = ResolversObject<{
  alreadyFollowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  followee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  follower?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserNameAlreadyTakenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNameAlreadyTakenError'] = ResolversParentTypes['UserNameAlreadyTakenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserNameChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNameChangeResult'] = ResolversParentTypes['UserNameChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'UserNameAlreadyTakenError' | 'UserNameChangeSuccess', ParentType, ContextType>;
}>;

export type UserNameChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNameChangeSuccess'] = ResolversParentTypes['UserNameChangeSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNotFoundError'] = ResolversParentTypes['UserNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserProfileEditResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserProfileEditResult'] = ResolversParentTypes['UserProfileEditResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'UserProfileEditSuccess', ParentType, ContextType>;
}>;

export type UserProfileEditSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserProfileEditSuccess'] = ResolversParentTypes['UserProfileEditSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserUnblockResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserUnblockResult'] = ResolversParentTypes['UserUnblockResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UserUnblockSuccess', ParentType, ContextType>;
}>;

export type UserUnblockSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserUnblockSuccess'] = ResolversParentTypes['UserUnblockSuccess']> = ResolversObject<{
  alreadyUnblocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  unblockee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  unblocker?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserUnfollowResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserUnfollowResult'] = ResolversParentTypes['UserUnfollowResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UserUnfollowSuccess', ParentType, ContextType>;
}>;

export type UserUnfollowSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserUnfollowSuccess'] = ResolversParentTypes['UserUnfollowSuccess']> = ResolversObject<{
  alreadyUnfollowed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  unfollowee?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  unfollower?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  AccountDeleteResult?: AccountDeleteResultResolvers<ContextType>;
  AccountDeleteSuccess?: AccountDeleteSuccessResolvers<ContextType>;
  BlockerConnection?: BlockerConnectionResolvers<ContextType>;
  BlockerEdge?: BlockerEdgeResolvers<ContextType>;
  BlockingConnection?: BlockingConnectionResolvers<ContextType>;
  BlockingEdge?: BlockingEdgeResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  Error?: ErrorResolvers<ContextType>;
  FollowerConnection?: FollowerConnectionResolvers<ContextType>;
  FollowerEdge?: FollowerEdgeResolvers<ContextType>;
  FollowingConnection?: FollowingConnectionResolvers<ContextType>;
  FollowingEdge?: FollowingEdgeResolvers<ContextType>;
  InvalidInputError?: InvalidInputErrorResolvers<ContextType>;
  LikedPostConnection?: LikedPostConnectionResolvers<ContextType>;
  LikedPostEdge?: LikedPostEdgeResolvers<ContextType>;
  LikerConnection?: LikerConnectionResolvers<ContextType>;
  LikerEdge?: LikerEdgeResolvers<ContextType>;
  LoginPasswordChangeResult?: LoginPasswordChangeResultResolvers<ContextType>;
  LoginPasswordChangeSuccess?: LoginPasswordChangeSuccessResolvers<ContextType>;
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
  PostCreateResult?: PostCreateResultResolvers<ContextType>;
  PostCreateSuccess?: PostCreateSuccessResolvers<ContextType>;
  PostDeleteResult?: PostDeleteResultResolvers<ContextType>;
  PostDeleteSuccess?: PostDeleteSuccessResolvers<ContextType>;
  PostEdge?: PostEdgeResolvers<ContextType>;
  PostEditResult?: PostEditResultResolvers<ContextType>;
  PostEditSuccess?: PostEditSuccessResolvers<ContextType>;
  PostLikeResult?: PostLikeResultResolvers<ContextType>;
  PostLikeSuccess?: PostLikeSuccessResolvers<ContextType>;
  PostParentConnection?: PostParentConnectionResolvers<ContextType>;
  PostParentEdge?: PostParentEdgeResolvers<ContextType>;
  PostReplyResult?: PostReplyResultResolvers<ContextType>;
  PostReplySuccess?: PostReplySuccessResolvers<ContextType>;
  PostUnlikeResult?: PostUnlikeResultResolvers<ContextType>;
  PostUnlikeSuccess?: PostUnlikeSuccessResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReplyConnection?: ReplyConnectionResolvers<ContextType>;
  ReplyEdge?: ReplyEdgeResolvers<ContextType>;
  ResourceNotFoundError?: ResourceNotFoundErrorResolvers<ContextType>;
  SignupResult?: SignupResultResolvers<ContextType>;
  SignupSuccess?: SignupSuccessResolvers<ContextType>;
  URL?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UserBlockResult?: UserBlockResultResolvers<ContextType>;
  UserBlockSuccess?: UserBlockSuccessResolvers<ContextType>;
  UserEmailAlreadyTakenError?: UserEmailAlreadyTakenErrorResolvers<ContextType>;
  UserEmailChangeResult?: UserEmailChangeResultResolvers<ContextType>;
  UserEmailChangeSuccess?: UserEmailChangeSuccessResolvers<ContextType>;
  UserFollowResult?: UserFollowResultResolvers<ContextType>;
  UserFollowSuccess?: UserFollowSuccessResolvers<ContextType>;
  UserNameAlreadyTakenError?: UserNameAlreadyTakenErrorResolvers<ContextType>;
  UserNameChangeResult?: UserNameChangeResultResolvers<ContextType>;
  UserNameChangeSuccess?: UserNameChangeSuccessResolvers<ContextType>;
  UserNotFoundError?: UserNotFoundErrorResolvers<ContextType>;
  UserProfileEditResult?: UserProfileEditResultResolvers<ContextType>;
  UserProfileEditSuccess?: UserProfileEditSuccessResolvers<ContextType>;
  UserUnblockResult?: UserUnblockResultResolvers<ContextType>;
  UserUnblockSuccess?: UserUnblockSuccessResolvers<ContextType>;
  UserUnfollowResult?: UserUnfollowResultResolvers<ContextType>;
  UserUnfollowSuccess?: UserUnfollowSuccessResolvers<ContextType>;
}>;

