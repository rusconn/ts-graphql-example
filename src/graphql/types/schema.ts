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

export type CompleteTodoPayload = {
  __typename?: 'CompleteTodoPayload';
  todo?: Maybe<Todo>;
};

export type CreateTodoInput = {
  /** 5000文字まで */
  description: Scalars['String'];
  /** 100文字まで */
  title: Scalars['NonEmptyString'];
};

export type CreateTodoPayload = {
  __typename?: 'CreateTodoPayload';
  todo?: Maybe<Todo>;
};

export type DeleteMePayload = {
  __typename?: 'DeleteMePayload';
  id?: Maybe<Scalars['ID']>;
};

export type DeleteTodoPayload = {
  __typename?: 'DeleteTodoPayload';
  id?: Maybe<Scalars['ID']>;
};

export type EmailAlreadyTakenError = Error & {
  __typename?: 'EmailAlreadyTakenError';
  message: Scalars['String'];
};

export type Error = {
  message: Scalars['String'];
};

export enum ErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  AuthenticationError = 'AUTHENTICATION_ERROR',
  BadUserInput = 'BAD_USER_INPUT',
  Forbidden = 'FORBIDDEN',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  NotFound = 'NOT_FOUND'
}

export type LoginError = UserNotFoundError;

export type LoginFailed = {
  __typename?: 'LoginFailed';
  errors: Array<LoginError>;
};

export type LoginInput = {
  /** 100文字まで */
  email: Scalars['EmailAddress'];
  /** 8文字以上、50文字まで */
  password: Scalars['NonEmptyString'];
};

export type LoginPayload = LoginFailed | LoginSucceeded;

export type LoginSucceeded = {
  __typename?: 'LoginSucceeded';
  user: User;
};

export type LogoutPayload = {
  __typename?: 'LogoutPayload';
  user?: Maybe<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  completeTodo?: Maybe<CompleteTodoPayload>;
  createTodo?: Maybe<CreateTodoPayload>;
  /** 紐づくリソースは全て削除される */
  deleteMe?: Maybe<DeleteMePayload>;
  deleteTodo?: Maybe<DeleteTodoPayload>;
  login?: Maybe<LoginPayload>;
  logout?: Maybe<LogoutPayload>;
  signup?: Maybe<SignupPayload>;
  uncompleteTodo?: Maybe<UncompleteTodoPayload>;
  /** 指定したフィールドのみ更新する */
  updateMe?: Maybe<UpdateMePayload>;
  /** 指定したフィールドのみ更新する */
  updateTodo?: Maybe<UpdateTodoPayload>;
};


export type MutationCompleteTodoArgs = {
  id: Scalars['ID'];
};


export type MutationCreateTodoArgs = {
  input: CreateTodoInput;
};


export type MutationDeleteTodoArgs = {
  id: Scalars['ID'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUncompleteTodoArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateMeArgs = {
  input: UpdateMeInput;
};


export type MutationUpdateTodoArgs = {
  id: Scalars['ID'];
  input: UpdateTodoInput;
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
  node?: Maybe<Node>;
  user?: Maybe<User>;
  users?: Maybe<UserConnection>;
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
  orderBy: UserOrder;
};

export type SignupError = EmailAlreadyTakenError;

export type SignupFailed = {
  __typename?: 'SignupFailed';
  errors: Array<SignupError>;
};

export type SignupInput = {
  /** 100文字まで、既に存在する場合はエラー */
  email: Scalars['EmailAddress'];
  /** 100文字まで */
  name: Scalars['NonEmptyString'];
  /** 8文字以上、50文字まで */
  password: Scalars['NonEmptyString'];
};

export type SignupPayload = SignupFailed | SignupSucceeded;

export type SignupSucceeded = {
  __typename?: 'SignupSucceeded';
  id: Scalars['ID'];
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

export type UncompleteTodoPayload = {
  __typename?: 'UncompleteTodoPayload';
  todo?: Maybe<Todo>;
};

export type UpdateMeInput = {
  /** 100文字まで、既に存在する場合はエラー、null は入力エラー */
  email?: InputMaybe<Scalars['EmailAddress']>;
  /** 100文字まで、null は入力エラー */
  name?: InputMaybe<Scalars['NonEmptyString']>;
  /** 8文字以上、50文字まで、null は入力エラー */
  password?: InputMaybe<Scalars['NonEmptyString']>;
};

export type UpdateMePayload = {
  __typename?: 'UpdateMePayload';
  user?: Maybe<User>;
};

export type UpdateTodoInput = {
  /** 5000文字まで、null は入力エラー */
  description?: InputMaybe<Scalars['String']>;
  /** null は入力エラー */
  status?: InputMaybe<TodoStatus>;
  /** 100文字まで、null は入力エラー */
  title?: InputMaybe<Scalars['NonEmptyString']>;
};

export type UpdateTodoPayload = {
  __typename?: 'UpdateTodoPayload';
  todo?: Maybe<Todo>;
};

export type User = Node & {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email?: Maybe<Scalars['EmailAddress']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['NonEmptyString']>;
  todo?: Maybe<Todo>;
  todos?: Maybe<TodoConnection>;
  token?: Maybe<Scalars['NonEmptyString']>;
  updatedAt: Scalars['DateTime'];
};


export type UserTodoArgs = {
  id: Scalars['ID'];
};


export type UserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy: TodoOrder;
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

export type UserNotFoundError = Error & {
  __typename?: 'UserNotFoundError';
  message: Scalars['String'];
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
  CompleteTodoPayload: ResolverTypeWrapper<Omit<CompleteTodoPayload, 'todo'> & { todo: Maybe<ResolversTypes['Todo']> }>;
  CreateTodoInput: CreateTodoInput;
  CreateTodoPayload: ResolverTypeWrapper<Omit<CreateTodoPayload, 'todo'> & { todo: Maybe<ResolversTypes['Todo']> }>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteMePayload: ResolverTypeWrapper<DeleteMePayload>;
  DeleteTodoPayload: ResolverTypeWrapper<DeleteTodoPayload>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']>;
  EmailAlreadyTakenError: ResolverTypeWrapper<EmailAlreadyTakenError>;
  Error: ResolversTypes['EmailAlreadyTakenError'] | ResolversTypes['UserNotFoundError'];
  ErrorCode: ErrorCode;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LoginError: ResolversTypes['UserNotFoundError'];
  LoginFailed: ResolverTypeWrapper<Omit<LoginFailed, 'errors'> & { errors: Array<ResolversTypes['LoginError']> }>;
  LoginInput: LoginInput;
  LoginPayload: ResolversTypes['LoginFailed'] | ResolversTypes['LoginSucceeded'];
  LoginSucceeded: ResolverTypeWrapper<Omit<LoginSucceeded, 'user'> & { user: ResolversTypes['User'] }>;
  LogoutPayload: ResolverTypeWrapper<Omit<LogoutPayload, 'user'> & { user: Maybe<ResolversTypes['User']> }>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['Todo'] | ResolversTypes['User'];
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']>;
  OrderDirection: OrderDirection;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  SignupError: ResolversTypes['EmailAlreadyTakenError'];
  SignupFailed: ResolverTypeWrapper<Omit<SignupFailed, 'errors'> & { errors: Array<ResolversTypes['SignupError']> }>;
  SignupInput: SignupInput;
  SignupPayload: ResolversTypes['SignupFailed'] | ResolversTypes['SignupSucceeded'];
  SignupSucceeded: ResolverTypeWrapper<SignupSucceeded>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Todo: ResolverTypeWrapper<TodoMapped>;
  TodoConnection: ResolverTypeWrapper<Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Array<ResolversTypes['TodoEdge']>, nodes: Array<ResolversTypes['Todo']> }>;
  TodoEdge: ResolverTypeWrapper<Omit<TodoEdge, 'node'> & { node: ResolversTypes['Todo'] }>;
  TodoOrder: TodoOrder;
  TodoOrderField: TodoOrderField;
  TodoStatus: TodoStatus;
  UncompleteTodoPayload: ResolverTypeWrapper<Omit<UncompleteTodoPayload, 'todo'> & { todo: Maybe<ResolversTypes['Todo']> }>;
  UpdateMeInput: UpdateMeInput;
  UpdateMePayload: ResolverTypeWrapper<Omit<UpdateMePayload, 'user'> & { user: Maybe<ResolversTypes['User']> }>;
  UpdateTodoInput: UpdateTodoInput;
  UpdateTodoPayload: ResolverTypeWrapper<Omit<UpdateTodoPayload, 'todo'> & { todo: Maybe<ResolversTypes['Todo']> }>;
  User: ResolverTypeWrapper<UserMapped>;
  UserConnection: ResolverTypeWrapper<Omit<UserConnection, 'edges' | 'nodes'> & { edges: Array<ResolversTypes['UserEdge']>, nodes: Array<ResolversTypes['User']> }>;
  UserEdge: ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: ResolversTypes['User'] }>;
  UserNotFoundError: ResolverTypeWrapper<UserNotFoundError>;
  UserOrder: UserOrder;
  UserOrderField: UserOrderField;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean'];
  CompleteTodoPayload: Omit<CompleteTodoPayload, 'todo'> & { todo: Maybe<ResolversParentTypes['Todo']> };
  CreateTodoInput: CreateTodoInput;
  CreateTodoPayload: Omit<CreateTodoPayload, 'todo'> & { todo: Maybe<ResolversParentTypes['Todo']> };
  DateTime: Scalars['DateTime'];
  DeleteMePayload: DeleteMePayload;
  DeleteTodoPayload: DeleteTodoPayload;
  EmailAddress: Scalars['EmailAddress'];
  EmailAlreadyTakenError: EmailAlreadyTakenError;
  Error: ResolversParentTypes['EmailAlreadyTakenError'] | ResolversParentTypes['UserNotFoundError'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  LoginError: ResolversParentTypes['UserNotFoundError'];
  LoginFailed: Omit<LoginFailed, 'errors'> & { errors: Array<ResolversParentTypes['LoginError']> };
  LoginInput: LoginInput;
  LoginPayload: ResolversParentTypes['LoginFailed'] | ResolversParentTypes['LoginSucceeded'];
  LoginSucceeded: Omit<LoginSucceeded, 'user'> & { user: ResolversParentTypes['User'] };
  LogoutPayload: Omit<LogoutPayload, 'user'> & { user: Maybe<ResolversParentTypes['User']> };
  Mutation: {};
  Node: ResolversParentTypes['Todo'] | ResolversParentTypes['User'];
  NonEmptyString: Scalars['NonEmptyString'];
  PageInfo: PageInfo;
  Query: {};
  SignupError: ResolversParentTypes['EmailAlreadyTakenError'];
  SignupFailed: Omit<SignupFailed, 'errors'> & { errors: Array<ResolversParentTypes['SignupError']> };
  SignupInput: SignupInput;
  SignupPayload: ResolversParentTypes['SignupFailed'] | ResolversParentTypes['SignupSucceeded'];
  SignupSucceeded: SignupSucceeded;
  String: Scalars['String'];
  Todo: TodoMapped;
  TodoConnection: Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Array<ResolversParentTypes['TodoEdge']>, nodes: Array<ResolversParentTypes['Todo']> };
  TodoEdge: Omit<TodoEdge, 'node'> & { node: ResolversParentTypes['Todo'] };
  TodoOrder: TodoOrder;
  UncompleteTodoPayload: Omit<UncompleteTodoPayload, 'todo'> & { todo: Maybe<ResolversParentTypes['Todo']> };
  UpdateMeInput: UpdateMeInput;
  UpdateMePayload: Omit<UpdateMePayload, 'user'> & { user: Maybe<ResolversParentTypes['User']> };
  UpdateTodoInput: UpdateTodoInput;
  UpdateTodoPayload: Omit<UpdateTodoPayload, 'todo'> & { todo: Maybe<ResolversParentTypes['Todo']> };
  User: UserMapped;
  UserConnection: Omit<UserConnection, 'edges' | 'nodes'> & { edges: Array<ResolversParentTypes['UserEdge']>, nodes: Array<ResolversParentTypes['User']> };
  UserEdge: Omit<UserEdge, 'node'> & { node: ResolversParentTypes['User'] };
  UserNotFoundError: UserNotFoundError;
  UserOrder: UserOrder;
}>;

export type CompleteTodoPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CompleteTodoPayload'] = ResolversParentTypes['CompleteTodoPayload']> = ResolversObject<{
  todo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateTodoPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTodoPayload'] = ResolversParentTypes['CreateTodoPayload']> = ResolversObject<{
  todo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteMePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteMePayload'] = ResolversParentTypes['DeleteMePayload']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteTodoPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTodoPayload'] = ResolversParentTypes['DeleteTodoPayload']> = ResolversObject<{
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type EmailAlreadyTakenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EmailAlreadyTakenError'] = ResolversParentTypes['EmailAlreadyTakenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'UserNotFoundError', ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type LoginErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginError'] = ResolversParentTypes['LoginError']> = ResolversObject<{
  __resolveType: TypeResolveFn<'UserNotFoundError', ParentType, ContextType>;
}>;

export type LoginFailedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginFailed'] = ResolversParentTypes['LoginFailed']> = ResolversObject<{
  errors?: Resolver<Array<ResolversTypes['LoginError']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginPayload'] = ResolversParentTypes['LoginPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'LoginFailed' | 'LoginSucceeded', ParentType, ContextType>;
}>;

export type LoginSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginSucceeded'] = ResolversParentTypes['LoginSucceeded']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LogoutPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LogoutPayload'] = ResolversParentTypes['LogoutPayload']> = ResolversObject<{
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  completeTodo?: Resolver<Maybe<ResolversTypes['CompleteTodoPayload']>, ParentType, ContextType, RequireFields<MutationCompleteTodoArgs, 'id'>>;
  createTodo?: Resolver<Maybe<ResolversTypes['CreateTodoPayload']>, ParentType, ContextType, RequireFields<MutationCreateTodoArgs, 'input'>>;
  deleteMe?: Resolver<Maybe<ResolversTypes['DeleteMePayload']>, ParentType, ContextType>;
  deleteTodo?: Resolver<Maybe<ResolversTypes['DeleteTodoPayload']>, ParentType, ContextType, RequireFields<MutationDeleteTodoArgs, 'id'>>;
  login?: Resolver<Maybe<ResolversTypes['LoginPayload']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  logout?: Resolver<Maybe<ResolversTypes['LogoutPayload']>, ParentType, ContextType>;
  signup?: Resolver<Maybe<ResolversTypes['SignupPayload']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  uncompleteTodo?: Resolver<Maybe<ResolversTypes['UncompleteTodoPayload']>, ParentType, ContextType, RequireFields<MutationUncompleteTodoArgs, 'id'>>;
  updateMe?: Resolver<Maybe<ResolversTypes['UpdateMePayload']>, ParentType, ContextType, RequireFields<MutationUpdateMeArgs, 'input'>>;
  updateTodo?: Resolver<Maybe<ResolversTypes['UpdateTodoPayload']>, ParentType, ContextType, RequireFields<MutationUpdateTodoArgs, 'id' | 'input'>>;
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
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Maybe<ResolversTypes['UserConnection']>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'orderBy'>>;
}>;

export type SignupErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupError'] = ResolversParentTypes['SignupError']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError', ParentType, ContextType>;
}>;

export type SignupFailedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupFailed'] = ResolversParentTypes['SignupFailed']> = ResolversObject<{
  errors?: Resolver<Array<ResolversTypes['SignupError']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SignupPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupPayload'] = ResolversParentTypes['SignupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'SignupFailed' | 'SignupSucceeded', ParentType, ContextType>;
}>;

export type SignupSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupSucceeded'] = ResolversParentTypes['SignupSucceeded']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type UncompleteTodoPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UncompleteTodoPayload'] = ResolversParentTypes['UncompleteTodoPayload']> = ResolversObject<{
  todo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateMePayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateMePayload'] = ResolversParentTypes['UpdateMePayload']> = ResolversObject<{
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateTodoPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTodoPayload'] = ResolversParentTypes['UpdateTodoPayload']> = ResolversObject<{
  todo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['EmailAddress']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  todo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<UserTodoArgs, 'id'>>;
  todos?: Resolver<Maybe<ResolversTypes['TodoConnection']>, ParentType, ContextType, RequireFields<UserTodosArgs, 'orderBy'>>;
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

export type UserNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNotFoundError'] = ResolversParentTypes['UserNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  CompleteTodoPayload?: CompleteTodoPayloadResolvers<ContextType>;
  CreateTodoPayload?: CreateTodoPayloadResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteMePayload?: DeleteMePayloadResolvers<ContextType>;
  DeleteTodoPayload?: DeleteTodoPayloadResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  EmailAlreadyTakenError?: EmailAlreadyTakenErrorResolvers<ContextType>;
  Error?: ErrorResolvers<ContextType>;
  LoginError?: LoginErrorResolvers<ContextType>;
  LoginFailed?: LoginFailedResolvers<ContextType>;
  LoginPayload?: LoginPayloadResolvers<ContextType>;
  LoginSucceeded?: LoginSucceededResolvers<ContextType>;
  LogoutPayload?: LogoutPayloadResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  NonEmptyString?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SignupError?: SignupErrorResolvers<ContextType>;
  SignupFailed?: SignupFailedResolvers<ContextType>;
  SignupPayload?: SignupPayloadResolvers<ContextType>;
  SignupSucceeded?: SignupSucceededResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoConnection?: TodoConnectionResolvers<ContextType>;
  TodoEdge?: TodoEdgeResolvers<ContextType>;
  UncompleteTodoPayload?: UncompleteTodoPayloadResolvers<ContextType>;
  UpdateMePayload?: UpdateMePayloadResolvers<ContextType>;
  UpdateTodoPayload?: UpdateTodoPayloadResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserNotFoundError?: UserNotFoundErrorResolvers<ContextType>;
}>;

