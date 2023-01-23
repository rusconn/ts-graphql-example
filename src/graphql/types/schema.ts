import type { DateTime } from '@/graphql/types/scalars';
import type { EmailAddress } from '@/graphql/types/scalars';
import type { NonEmptyString } from '@/graphql/types/scalars';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { User as UserMapped, Todo as TodoMapped } from '@/graphql/types/mappers';
import type { Context } from '@/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: DateTime;
  EmailAddress: EmailAddress;
  NonEmptyString: NonEmptyString;
};

export type CreateMyTodoInput = {
  /** 5000文字まで */
  description: Scalars['String'];
  /** 100文字まで */
  title: Scalars['NonEmptyString'];
};

export enum ErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  AuthenticationError = 'AUTHENTICATION_ERROR',
  BadUserInput = 'BAD_USER_INPUT',
  Forbidden = 'FORBIDDEN',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  NotFound = 'NOT_FOUND'
}

export type LoginInput = {
  /** 100文字まで */
  email: Scalars['EmailAddress'];
  /** 8文字以上、50文字まで */
  password: Scalars['NonEmptyString'];
};

export type Mutation = {
  __typename?: 'Mutation';
  completeMyTodo?: Maybe<Todo>;
  createMyTodo?: Maybe<Todo>;
  /** 紐づくリソースは全て削除される */
  deleteMe?: Maybe<Scalars['ID']>;
  deleteMyTodo?: Maybe<Scalars['ID']>;
  login?: Maybe<User>;
  logout?: Maybe<User>;
  signup?: Maybe<User>;
  uncompleteMyTodo?: Maybe<Todo>;
  /** 指定したフィールドのみ更新する */
  updateMe?: Maybe<User>;
  /** 指定したフィールドのみ更新する */
  updateMyTodo?: Maybe<Todo>;
};


export type MutationCompleteMyTodoArgs = {
  id: Scalars['ID'];
};


export type MutationCreateMyTodoArgs = {
  input: CreateMyTodoInput;
};


export type MutationDeleteMyTodoArgs = {
  id: Scalars['ID'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUncompleteMyTodoArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};


export type MutationUpdateMyTodoArgs = {
  id: Scalars['ID'];
  input: UpdateMyTodoInput;
};

export type Node = {
  id: Scalars['ID'];
};

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<User>;
  myTodo?: Maybe<Todo>;
  myTodos?: Maybe<TodoConnection>;
  node?: Maybe<Node>;
  user?: Maybe<User>;
  users?: Maybe<UserConnection>;
};


export type QueryMyTodoArgs = {
  id: Scalars['ID'];
};


export type QueryMyTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TodoOrder>;
};


export type QueryNodeArgs = {
  id: Scalars['ID'];
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserOrder>;
};

export type SignupInput = {
  /** 100文字まで、既に存在する場合はエラー */
  email: Scalars['EmailAddress'];
  /** 100文字まで */
  name: Scalars['NonEmptyString'];
  /** 8文字以上、50文字まで */
  password: Scalars['NonEmptyString'];
};

export type Todo = Node & {
  __typename?: 'Todo';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  status?: Maybe<TodoStatus>;
  title?: Maybe<Scalars['NonEmptyString']>;
  updatedAt: Scalars['DateTime'];
  user?: Maybe<User>;
};

export type TodoConnection = {
  __typename?: 'TodoConnection';
  edges: Array<TodoEdge>;
  nodes: Array<Todo>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type TodoEdge = {
  __typename?: 'TodoEdge';
  cursor: Scalars['String'];
  node: Todo;
};

export type TodoOrder = {
  direction: OrderDirection;
  field: TodoOrderField;
};

export enum TodoOrderField {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export enum TodoStatus {
  Done = 'DONE',
  Pending = 'PENDING'
}

export type UpdateMeInput = {
  /** 100文字まで、既に存在する場合はエラー、null は入力エラー */
  email?: InputMaybe<Scalars['EmailAddress']>;
  /** 100文字まで、null は入力エラー */
  name?: InputMaybe<Scalars['NonEmptyString']>;
  /** 8文字以上、50文字まで、null は入力エラー */
  password?: InputMaybe<Scalars['NonEmptyString']>;
};

export type UpdateMyTodoInput = {
  /** 5000文字まで、null は入力エラー */
  description?: InputMaybe<Scalars['String']>;
  /** null は入力エラー */
  status?: InputMaybe<TodoStatus>;
  /** 100文字まで、null は入力エラー */
  title?: InputMaybe<Scalars['NonEmptyString']>;
};

export type User = Node & {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email?: Maybe<Scalars['EmailAddress']>;
  id: Scalars['ID'];
  name: Scalars['NonEmptyString'];
  todos?: Maybe<TodoConnection>;
  token?: Maybe<Scalars['NonEmptyString']>;
  updatedAt: Scalars['DateTime'];
};


export type UserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TodoOrder>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<UserEdge>;
  nodes: Array<User>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String'];
  node: User;
};

export type UserOrder = {
  direction: OrderDirection;
  field: UserOrderField;
};

export enum UserOrderField {
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
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
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
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CreateMyTodoInput: CreateMyTodoInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']>;
  ErrorCode: ErrorCode;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LoginInput: LoginInput;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['Todo'] | ResolversTypes['User'];
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']>;
  OrderDirection: OrderDirection;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  SignupInput: SignupInput;
  String: ResolverTypeWrapper<Scalars['String']>;
  Todo: ResolverTypeWrapper<TodoMapped>;
  TodoConnection: ResolverTypeWrapper<Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Array<ResolversTypes['TodoEdge']>, nodes: Array<ResolversTypes['Todo']> }>;
  TodoEdge: ResolverTypeWrapper<Omit<TodoEdge, 'node'> & { node: ResolversTypes['Todo'] }>;
  TodoOrder: TodoOrder;
  TodoOrderField: TodoOrderField;
  TodoStatus: TodoStatus;
  UpdateMeInput: UpdateMeInput;
  UpdateMyTodoInput: UpdateMyTodoInput;
  User: ResolverTypeWrapper<UserMapped>;
  UserConnection: ResolverTypeWrapper<Omit<UserConnection, 'edges' | 'nodes'> & { edges: Array<ResolversTypes['UserEdge']>, nodes: Array<ResolversTypes['User']> }>;
  UserEdge: ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: ResolversTypes['User'] }>;
  UserOrder: UserOrder;
  UserOrderField: UserOrderField;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  CreateMyTodoInput: CreateMyTodoInput;
  DateTime: Scalars['DateTime'];
  EmailAddress: Scalars['EmailAddress'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  LoginInput: LoginInput;
  Mutation: {};
  Node: ResolversParentTypes['Todo'] | ResolversParentTypes['User'];
  NonEmptyString: Scalars['NonEmptyString'];
  PageInfo: PageInfo;
  Query: {};
  SignupInput: SignupInput;
  String: Scalars['String'];
  Todo: TodoMapped;
  TodoConnection: Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Array<ResolversParentTypes['TodoEdge']>, nodes: Array<ResolversParentTypes['Todo']> };
  TodoEdge: Omit<TodoEdge, 'node'> & { node: ResolversParentTypes['Todo'] };
  TodoOrder: TodoOrder;
  UpdateMeInput: UpdateMeInput;
  UpdateMyTodoInput: UpdateMyTodoInput;
  User: UserMapped;
  UserConnection: Omit<UserConnection, 'edges' | 'nodes'> & { edges: Array<ResolversParentTypes['UserEdge']>, nodes: Array<ResolversParentTypes['User']> };
  UserEdge: Omit<UserEdge, 'node'> & { node: ResolversParentTypes['User'] };
  UserOrder: UserOrder;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  completeMyTodo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<MutationCompleteMyTodoArgs, 'id'>>;
  createMyTodo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<MutationCreateMyTodoArgs, 'input'>>;
  deleteMe?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  deleteMyTodo?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationDeleteMyTodoArgs, 'id'>>;
  login?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  logout?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  signup?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  uncompleteMyTodo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<MutationUncompleteMyTodoArgs, 'id'>>;
  updateMe?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateMeArgs, 'input'>>;
  updateMyTodo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<MutationUpdateMyTodoArgs, 'id' | 'input'>>;
}>;

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Todo' | 'User', ParentType, ContextType>;
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

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  myTodo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<QueryMyTodoArgs, 'id'>>;
  myTodos?: Resolver<Maybe<ResolversTypes['TodoConnection']>, ParentType, ContextType, Partial<QueryMyTodosArgs>>;
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Maybe<ResolversTypes['UserConnection']>, ParentType, ContextType, Partial<QueryUsersArgs>>;
}>;

export type TodoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Todo'] = ResolversParentTypes['Todo']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TodoStatus']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoConnection'] = ResolversParentTypes['TodoConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['TodoEdge']>, ParentType, ContextType>;
  nodes?: Resolver<Array<ResolversTypes['Todo']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoEdge'] = ResolversParentTypes['TodoEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['EmailAddress']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['NonEmptyString'], ParentType, ContextType>;
  todos?: Resolver<Maybe<ResolversTypes['TodoConnection']>, ParentType, ContextType, Partial<UserTodosArgs>>;
  token?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = ResolversObject<{
  edges?: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  nodes?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  DateTime?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  NonEmptyString?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoConnection?: TodoConnectionResolvers<ContextType>;
  TodoEdge?: TodoEdgeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
}>;

