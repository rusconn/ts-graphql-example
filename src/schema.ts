import type { ID } from './modules/scalar/_mod.ts';
import type { DateTime } from './modules/scalar/_mod.ts';
import type { EmailAddress } from './modules/scalar/_mod.ts';
import type { NonEmptyString } from './modules/scalar/_mod.ts';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { Node as NodeMapper } from './modules/node/mapper.ts';
import type { Todo as TodoMapper } from './modules/todo/mapper.ts';
import type { User as UserMapper } from './modules/user/mapper.ts';
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
};

export type CompleteTodoResult = CompleteTodoSuccess | InvalidInputError | ResourceNotFoundError;

export type CompleteTodoSuccess = {
  __typename?: 'CompleteTodoSuccess';
  todo: Todo;
};

export type CreateTodoResult = CreateTodoSuccess | InvalidInputError | ResourceLimitExceededError;

export type CreateTodoSuccess = {
  __typename?: 'CreateTodoSuccess';
  todo: Todo;
};

export type DeleteAccountResult = DeleteAccountSuccess;

export type DeleteAccountSuccess = {
  __typename?: 'DeleteAccountSuccess';
  id: Scalars['ID']['output'];
};

export type DeleteTodoResult = DeleteTodoSuccess | InvalidInputError | ResourceNotFoundError;

export type DeleteTodoSuccess = {
  __typename?: 'DeleteTodoSuccess';
  id: Scalars['ID']['output'];
};

export type EmailAlreadyTakenError = Error & {
  __typename?: 'EmailAlreadyTakenError';
  message: Scalars['String']['output'];
};

export type Error = {
  message: Scalars['String']['output'];
};

export enum ErrorCode {
  AuthenticationError = 'AUTHENTICATION_ERROR',
  BadUserInput = 'BAD_USER_INPUT',
  Forbidden = 'FORBIDDEN'
}

export type InvalidInputError = Error & {
  __typename?: 'InvalidInputError';
  message: Scalars['String']['output'];
};

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
  completeTodo?: Maybe<CompleteTodoResult>;
  /** 10000件まで */
  createTodo?: Maybe<CreateTodoResult>;
  /** 紐づくリソースは全て削除される */
  deleteAccount?: Maybe<DeleteAccountResult>;
  deleteTodo?: Maybe<DeleteTodoResult>;
  login?: Maybe<LoginResult>;
  logout?: Maybe<LogoutResult>;
  signup?: Maybe<SignupResult>;
  uncompleteTodo?: Maybe<UncompleteTodoResult>;
  updateAccount?: Maybe<UpdateAccountResult>;
  updateTodo?: Maybe<UpdateTodoResult>;
};


export type MutationCompleteTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateTodoArgs = {
  description: Scalars['String']['input'];
  title: Scalars['NonEmptyString']['input'];
};


export type MutationDeleteTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
};


export type MutationSignupArgs = {
  email: Scalars['NonEmptyString']['input'];
  name: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
};


export type MutationUncompleteTodoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAccountArgs = {
  email?: InputMaybe<Scalars['NonEmptyString']['input']>;
  name?: InputMaybe<Scalars['NonEmptyString']['input']>;
  password?: InputMaybe<Scalars['NonEmptyString']['input']>;
};


export type MutationUpdateTodoArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<TodoStatus>;
  title?: InputMaybe<Scalars['NonEmptyString']['input']>;
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

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  user?: Maybe<User>;
  users?: Maybe<UserConnection>;
  viewer?: Maybe<User>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: UserSortKeys;
};

export type ResourceLimitExceededError = Error & {
  __typename?: 'ResourceLimitExceededError';
  message: Scalars['String']['output'];
};

export type ResourceNotFoundError = Error & {
  __typename?: 'ResourceNotFoundError';
  message: Scalars['String']['output'];
};

export type SignupResult = EmailAlreadyTakenError | InvalidInputError | SignupSuccess;

export type SignupSuccess = {
  __typename?: 'SignupSuccess';
  token: Scalars['NonEmptyString']['output'];
};

export type Todo = Node & {
  __typename?: 'Todo';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status?: Maybe<TodoStatus>;
  title?: Maybe<Scalars['NonEmptyString']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type TodoConnection = {
  __typename?: 'TodoConnection';
  edges?: Maybe<Array<Maybe<TodoEdge>>>;
  nodes?: Maybe<Array<Maybe<Todo>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TodoEdge = {
  __typename?: 'TodoEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Todo>;
};

export enum TodoSortKeys {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export enum TodoStatus {
  Done = 'DONE',
  Pending = 'PENDING'
}

export type UncompleteTodoResult = InvalidInputError | ResourceNotFoundError | UncompleteTodoSuccess;

export type UncompleteTodoSuccess = {
  __typename?: 'UncompleteTodoSuccess';
  todo: Todo;
};

export type UpdateAccountResult = EmailAlreadyTakenError | InvalidInputError | UpdateAccountSuccess;

export type UpdateAccountSuccess = {
  __typename?: 'UpdateAccountSuccess';
  user: User;
};

export type UpdateTodoResult = InvalidInputError | ResourceNotFoundError | UpdateTodoSuccess;

export type UpdateTodoSuccess = {
  __typename?: 'UpdateTodoSuccess';
  todo: Todo;
};

export type User = Node & {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['EmailAddress']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['NonEmptyString']['output']>;
  todo?: Maybe<Todo>;
  todos?: Maybe<TodoConnection>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type UserTodoArgs = {
  id: Scalars['ID']['input'];
};


export type UserTodosArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse: Scalars['Boolean']['input'];
  sortKey: TodoSortKeys;
  status?: InputMaybe<TodoStatus>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export type UserNotFoundError = Error & {
  __typename?: 'UserNotFoundError';
  message: Scalars['String']['output'];
};

export enum UserSortKeys {
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
  CompleteTodoResult: ( Omit<CompleteTodoSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'CompleteTodoSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  CreateTodoResult: ( Omit<CreateTodoSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'CreateTodoSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceLimitExceededError & { __typename: 'ResourceLimitExceededError' } );
  DeleteAccountResult: ( DeleteAccountSuccess & { __typename: 'DeleteAccountSuccess' } );
  DeleteTodoResult: ( DeleteTodoSuccess & { __typename: 'DeleteTodoSuccess' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } );
  LoginResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( LoginSuccess & { __typename: 'LoginSuccess' } ) | ( UserNotFoundError & { __typename: 'UserNotFoundError' } );
  LogoutResult: ( Omit<LogoutSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'LogoutSuccess' } );
  SignupResult: ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( SignupSuccess & { __typename: 'SignupSuccess' } );
  UncompleteTodoResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UncompleteTodoSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'UncompleteTodoSuccess' } );
  UpdateAccountResult: ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } ) | ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( Omit<UpdateAccountSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'UpdateAccountSuccess' } );
  UpdateTodoResult: ( InvalidInputError & { __typename: 'InvalidInputError' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<UpdateTodoSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'UpdateTodoSuccess' } );
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  Error: ( EmailAlreadyTakenError ) | ( InvalidInputError ) | ( ResourceLimitExceededError ) | ( ResourceNotFoundError ) | ( UserNotFoundError );
  Node: ( TodoMapper ) | ( UserMapper );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CompleteTodoResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CompleteTodoResult']>;
  CompleteTodoSuccess: ResolverTypeWrapper<Omit<CompleteTodoSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  CreateTodoResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateTodoResult']>;
  CreateTodoSuccess: ResolverTypeWrapper<Omit<CreateTodoSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteAccountResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteAccountResult']>;
  DeleteAccountSuccess: ResolverTypeWrapper<DeleteAccountSuccess>;
  DeleteTodoResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteTodoResult']>;
  DeleteTodoSuccess: ResolverTypeWrapper<DeleteTodoSuccess>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  EmailAlreadyTakenError: ResolverTypeWrapper<EmailAlreadyTakenError>;
  Error: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Error']>;
  ErrorCode: ErrorCode;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputError: ResolverTypeWrapper<InvalidInputError>;
  LoginResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LoginResult']>;
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>;
  LogoutResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LogoutResult']>;
  LogoutSuccess: ResolverTypeWrapper<Omit<LogoutSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<NodeMapper>;
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']['output']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  ResourceLimitExceededError: ResolverTypeWrapper<ResourceLimitExceededError>;
  ResourceNotFoundError: ResolverTypeWrapper<ResourceNotFoundError>;
  SignupResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SignupResult']>;
  SignupSuccess: ResolverTypeWrapper<SignupSuccess>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Todo: ResolverTypeWrapper<TodoMapper>;
  TodoConnection: ResolverTypeWrapper<Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['TodoEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Todo']>>> }>;
  TodoEdge: ResolverTypeWrapper<Omit<TodoEdge, 'node'> & { node: Maybe<ResolversTypes['Todo']> }>;
  TodoSortKeys: TodoSortKeys;
  TodoStatus: TodoStatus;
  UncompleteTodoResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UncompleteTodoResult']>;
  UncompleteTodoSuccess: ResolverTypeWrapper<Omit<UncompleteTodoSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  UpdateAccountResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateAccountResult']>;
  UpdateAccountSuccess: ResolverTypeWrapper<Omit<UpdateAccountSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  UpdateTodoResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateTodoResult']>;
  UpdateTodoSuccess: ResolverTypeWrapper<Omit<UpdateTodoSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  User: ResolverTypeWrapper<UserMapper>;
  UserConnection: ResolverTypeWrapper<Omit<UserConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['UserEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  UserEdge: ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  UserNotFoundError: ResolverTypeWrapper<UserNotFoundError>;
  UserSortKeys: UserSortKeys;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  CompleteTodoResult: ResolversUnionTypes<ResolversParentTypes>['CompleteTodoResult'];
  CompleteTodoSuccess: Omit<CompleteTodoSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  CreateTodoResult: ResolversUnionTypes<ResolversParentTypes>['CreateTodoResult'];
  CreateTodoSuccess: Omit<CreateTodoSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  DateTime: Scalars['DateTime']['output'];
  DeleteAccountResult: ResolversUnionTypes<ResolversParentTypes>['DeleteAccountResult'];
  DeleteAccountSuccess: DeleteAccountSuccess;
  DeleteTodoResult: ResolversUnionTypes<ResolversParentTypes>['DeleteTodoResult'];
  DeleteTodoSuccess: DeleteTodoSuccess;
  EmailAddress: Scalars['EmailAddress']['output'];
  EmailAlreadyTakenError: EmailAlreadyTakenError;
  Error: ResolversInterfaceTypes<ResolversParentTypes>['Error'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  InvalidInputError: InvalidInputError;
  LoginResult: ResolversUnionTypes<ResolversParentTypes>['LoginResult'];
  LoginSuccess: LoginSuccess;
  LogoutResult: ResolversUnionTypes<ResolversParentTypes>['LogoutResult'];
  LogoutSuccess: Omit<LogoutSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  Mutation: {};
  Node: NodeMapper;
  NonEmptyString: Scalars['NonEmptyString']['output'];
  PageInfo: PageInfo;
  Query: {};
  ResourceLimitExceededError: ResourceLimitExceededError;
  ResourceNotFoundError: ResourceNotFoundError;
  SignupResult: ResolversUnionTypes<ResolversParentTypes>['SignupResult'];
  SignupSuccess: SignupSuccess;
  String: Scalars['String']['output'];
  Todo: TodoMapper;
  TodoConnection: Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['TodoEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Todo']>>> };
  TodoEdge: Omit<TodoEdge, 'node'> & { node: Maybe<ResolversParentTypes['Todo']> };
  UncompleteTodoResult: ResolversUnionTypes<ResolversParentTypes>['UncompleteTodoResult'];
  UncompleteTodoSuccess: Omit<UncompleteTodoSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  UpdateAccountResult: ResolversUnionTypes<ResolversParentTypes>['UpdateAccountResult'];
  UpdateAccountSuccess: Omit<UpdateAccountSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  UpdateTodoResult: ResolversUnionTypes<ResolversParentTypes>['UpdateTodoResult'];
  UpdateTodoSuccess: Omit<UpdateTodoSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  User: UserMapper;
  UserConnection: Omit<UserConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['UserEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  UserEdge: Omit<UserEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
  UserNotFoundError: UserNotFoundError;
}>;

export type CompleteTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CompleteTodoResult'] = ResolversParentTypes['CompleteTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CompleteTodoSuccess' | 'InvalidInputError' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type CompleteTodoSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CompleteTodoSuccess'] = ResolversParentTypes['CompleteTodoSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTodoResult'] = ResolversParentTypes['CreateTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CreateTodoSuccess' | 'InvalidInputError' | 'ResourceLimitExceededError', ParentType, ContextType>;
}>;

export type CreateTodoSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTodoSuccess'] = ResolversParentTypes['CreateTodoSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
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

export type DeleteTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTodoResult'] = ResolversParentTypes['DeleteTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeleteTodoSuccess' | 'InvalidInputError' | 'ResourceNotFoundError', ParentType, ContextType>;
}>;

export type DeleteTodoSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTodoSuccess'] = ResolversParentTypes['DeleteTodoSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'InvalidInputError' | 'ResourceLimitExceededError' | 'ResourceNotFoundError' | 'UserNotFoundError', ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type InvalidInputErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidInputError'] = ResolversParentTypes['InvalidInputError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  completeTodo?: Resolver<Maybe<ResolversTypes['CompleteTodoResult']>, ParentType, ContextType, RequireFields<MutationCompleteTodoArgs, 'id'>>;
  createTodo?: Resolver<Maybe<ResolversTypes['CreateTodoResult']>, ParentType, ContextType, RequireFields<MutationCreateTodoArgs, 'description' | 'title'>>;
  deleteAccount?: Resolver<Maybe<ResolversTypes['DeleteAccountResult']>, ParentType, ContextType>;
  deleteTodo?: Resolver<Maybe<ResolversTypes['DeleteTodoResult']>, ParentType, ContextType, RequireFields<MutationDeleteTodoArgs, 'id'>>;
  login?: Resolver<Maybe<ResolversTypes['LoginResult']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout?: Resolver<Maybe<ResolversTypes['LogoutResult']>, ParentType, ContextType>;
  signup?: Resolver<Maybe<ResolversTypes['SignupResult']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'email' | 'name' | 'password'>>;
  uncompleteTodo?: Resolver<Maybe<ResolversTypes['UncompleteTodoResult']>, ParentType, ContextType, RequireFields<MutationUncompleteTodoArgs, 'id'>>;
  updateAccount?: Resolver<Maybe<ResolversTypes['UpdateAccountResult']>, ParentType, ContextType, Partial<MutationUpdateAccountArgs>>;
  updateTodo?: Resolver<Maybe<ResolversTypes['UpdateTodoResult']>, ParentType, ContextType, RequireFields<MutationUpdateTodoArgs, 'id'>>;
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
  node?: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<Maybe<ResolversTypes['UserConnection']>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'reverse' | 'sortKey'>>;
  viewer?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'InvalidInputError' | 'SignupSuccess', ParentType, ContextType>;
}>;

export type SignupSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupSuccess'] = ResolversParentTypes['SignupSuccess']> = ResolversObject<{
  token?: Resolver<ResolversTypes['NonEmptyString'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Todo'] = ResolversParentTypes['Todo']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TodoStatus']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoConnection'] = ResolversParentTypes['TodoConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['TodoEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Todo']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoEdge'] = ResolversParentTypes['TodoEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UncompleteTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UncompleteTodoResult'] = ResolversParentTypes['UncompleteTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UncompleteTodoSuccess', ParentType, ContextType>;
}>;

export type UncompleteTodoSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UncompleteTodoSuccess'] = ResolversParentTypes['UncompleteTodoSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateAccountResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateAccountResult'] = ResolversParentTypes['UpdateAccountResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'InvalidInputError' | 'UpdateAccountSuccess', ParentType, ContextType>;
}>;

export type UpdateAccountSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateAccountSuccess'] = ResolversParentTypes['UpdateAccountSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTodoResult'] = ResolversParentTypes['UpdateTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputError' | 'ResourceNotFoundError' | 'UpdateTodoSuccess', ParentType, ContextType>;
}>;

export type UpdateTodoSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTodoSuccess'] = ResolversParentTypes['UpdateTodoSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['EmailAddress']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['NonEmptyString']>, ParentType, ContextType>;
  todo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType, RequireFields<UserTodoArgs, 'id'>>;
  todos?: Resolver<Maybe<ResolversTypes['TodoConnection']>, ParentType, ContextType, RequireFields<UserTodosArgs, 'reverse' | 'sortKey'>>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserNotFoundError'] = ResolversParentTypes['UserNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  CompleteTodoResult?: CompleteTodoResultResolvers<ContextType>;
  CompleteTodoSuccess?: CompleteTodoSuccessResolvers<ContextType>;
  CreateTodoResult?: CreateTodoResultResolvers<ContextType>;
  CreateTodoSuccess?: CreateTodoSuccessResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteAccountResult?: DeleteAccountResultResolvers<ContextType>;
  DeleteAccountSuccess?: DeleteAccountSuccessResolvers<ContextType>;
  DeleteTodoResult?: DeleteTodoResultResolvers<ContextType>;
  DeleteTodoSuccess?: DeleteTodoSuccessResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  EmailAlreadyTakenError?: EmailAlreadyTakenErrorResolvers<ContextType>;
  Error?: ErrorResolvers<ContextType>;
  InvalidInputError?: InvalidInputErrorResolvers<ContextType>;
  LoginResult?: LoginResultResolvers<ContextType>;
  LoginSuccess?: LoginSuccessResolvers<ContextType>;
  LogoutResult?: LogoutResultResolvers<ContextType>;
  LogoutSuccess?: LogoutSuccessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  NonEmptyString?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ResourceLimitExceededError?: ResourceLimitExceededErrorResolvers<ContextType>;
  ResourceNotFoundError?: ResourceNotFoundErrorResolvers<ContextType>;
  SignupResult?: SignupResultResolvers<ContextType>;
  SignupSuccess?: SignupSuccessResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoConnection?: TodoConnectionResolvers<ContextType>;
  TodoEdge?: TodoEdgeResolvers<ContextType>;
  UncompleteTodoResult?: UncompleteTodoResultResolvers<ContextType>;
  UncompleteTodoSuccess?: UncompleteTodoSuccessResolvers<ContextType>;
  UpdateAccountResult?: UpdateAccountResultResolvers<ContextType>;
  UpdateAccountSuccess?: UpdateAccountSuccessResolvers<ContextType>;
  UpdateTodoResult?: UpdateTodoResultResolvers<ContextType>;
  UpdateTodoSuccess?: UpdateTodoSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserNotFoundError?: UserNotFoundErrorResolvers<ContextType>;
}>;

