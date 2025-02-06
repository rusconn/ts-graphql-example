import type { ID } from './graphql/ID.ts';
import type { DateTime } from './graphql/DateTime.ts';
import type { EmailAddress } from './graphql/EmailAddress.ts';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { Node as NodeMapper } from './graphql/Node/_mapper.ts';
import type { Todo as TodoMapper } from './graphql/Todo/_mapper.ts';
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
  EmailAddress: { input: EmailAddress; output: EmailAddress; }
};

export type AccountDeleteResult = AccountDeleteSuccess;

export type AccountDeleteSuccess = {
  __typename?: 'AccountDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type AccountUpdateResult = AccountUpdateSuccess | EmailAlreadyTakenError | InvalidInputErrors;

export type AccountUpdateSuccess = {
  __typename?: 'AccountUpdateSuccess';
  user: User;
};

export type EmailAlreadyTakenError = Error & {
  __typename?: 'EmailAlreadyTakenError';
  message: Scalars['String']['output'];
};

export type Error = {
  message: Scalars['String']['output'];
};

export const ErrorCode = {
  AuthenticationError: 'AUTHENTICATION_ERROR',
  BadUserInput: 'BAD_USER_INPUT',
  Forbidden: 'FORBIDDEN',
  InternalServerError: 'INTERNAL_SERVER_ERROR'
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
export type InvalidInputError = Error & {
  __typename?: 'InvalidInputError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type InvalidInputErrors = {
  __typename?: 'InvalidInputErrors';
  errors: Array<InvalidInputError>;
};

export type LoginFailedError = Error & {
  __typename?: 'LoginFailedError';
  message: Scalars['String']['output'];
};

export type LoginResult = InvalidInputErrors | LoginFailedError | LoginSuccess;

export type LoginSuccess = {
  __typename?: 'LoginSuccess';
  token: Scalars['String']['output'];
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
  accountUpdate?: Maybe<AccountUpdateResult>;
  login?: Maybe<LoginResult>;
  logout?: Maybe<LogoutResult>;
  signup?: Maybe<SignupResult>;
  todoComplete?: Maybe<TodoCompleteResult>;
  /** 10000件まで */
  todoCreate?: Maybe<TodoCreateResult>;
  todoDelete?: Maybe<TodoDeleteResult>;
  todoUncomplete?: Maybe<TodoUncompleteResult>;
  todoUpdate?: Maybe<TodoUpdateResult>;
};


export type MutationAccountUpdateArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationTodoCompleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTodoCreateArgs = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationTodoDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTodoUncompleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTodoUpdateArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<TodoStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
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

export type SignupResult = EmailAlreadyTakenError | InvalidInputErrors | SignupSuccess;

export type SignupSuccess = {
  __typename?: 'SignupSuccess';
  token: Scalars['String']['output'];
};

export type Todo = Node & {
  __typename?: 'Todo';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status?: Maybe<TodoStatus>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
};

export type TodoCompleteResult = ResourceNotFoundError | TodoCompleteSuccess;

export type TodoCompleteSuccess = {
  __typename?: 'TodoCompleteSuccess';
  todo: Todo;
};

export type TodoConnection = {
  __typename?: 'TodoConnection';
  edges?: Maybe<Array<Maybe<TodoEdge>>>;
  nodes?: Maybe<Array<Maybe<Todo>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TodoCreateResult = InvalidInputErrors | ResourceLimitExceededError | TodoCreateSuccess;

export type TodoCreateSuccess = {
  __typename?: 'TodoCreateSuccess';
  todo: Todo;
};

export type TodoDeleteResult = ResourceNotFoundError | TodoDeleteSuccess;

export type TodoDeleteSuccess = {
  __typename?: 'TodoDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type TodoEdge = {
  __typename?: 'TodoEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Todo>;
};

export const TodoSortKeys = {
  CreatedAt: 'CREATED_AT',
  UpdatedAt: 'UPDATED_AT'
} as const;

export type TodoSortKeys = typeof TodoSortKeys[keyof typeof TodoSortKeys];
export const TodoStatus = {
  Done: 'DONE',
  Pending: 'PENDING'
} as const;

export type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus];
export type TodoUncompleteResult = ResourceNotFoundError | TodoUncompleteSuccess;

export type TodoUncompleteSuccess = {
  __typename?: 'TodoUncompleteSuccess';
  todo: Todo;
};

export type TodoUpdateResult = InvalidInputErrors | ResourceNotFoundError | TodoUpdateSuccess;

export type TodoUpdateSuccess = {
  __typename?: 'TodoUpdateSuccess';
  todo: Todo;
};

export type User = Node & {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['EmailAddress']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
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

export const UserSortKeys = {
  CreatedAt: 'CREATED_AT',
  UpdatedAt: 'UPDATED_AT'
} as const;

export type UserSortKeys = typeof UserSortKeys[keyof typeof UserSortKeys];
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

/** Mapping of union types */
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  AccountDeleteResult: ( AccountDeleteSuccess & { __typename: 'AccountDeleteSuccess' } );
  AccountUpdateResult: ( Omit<AccountUpdateSuccess, 'user'> & { user: RefType['User'] } & { __typename: 'AccountUpdateSuccess' } ) | ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } ) | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } );
  LoginResult: ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( LoginFailedError & { __typename: 'LoginFailedError' } ) | ( LoginSuccess & { __typename: 'LoginSuccess' } );
  LogoutResult: ( LogoutSuccess & { __typename: 'LogoutSuccess' } );
  SignupResult: ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } ) | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( SignupSuccess & { __typename: 'SignupSuccess' } );
  TodoCompleteResult: ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<TodoCompleteSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'TodoCompleteSuccess' } );
  TodoCreateResult: ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( ResourceLimitExceededError & { __typename: 'ResourceLimitExceededError' } ) | ( Omit<TodoCreateSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'TodoCreateSuccess' } );
  TodoDeleteResult: ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( TodoDeleteSuccess & { __typename: 'TodoDeleteSuccess' } );
  TodoUncompleteResult: ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<TodoUncompleteSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'TodoUncompleteSuccess' } );
  TodoUpdateResult: ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<TodoUpdateSuccess, 'todo'> & { todo: RefType['Todo'] } & { __typename: 'TodoUpdateSuccess' } );
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = ResolversObject<{
  Error: ( EmailAlreadyTakenError ) | ( InvalidInputError ) | ( LoginFailedError ) | ( ResourceLimitExceededError ) | ( ResourceNotFoundError );
  Node: ( TodoMapper ) | ( UserMapper );
}>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AccountDeleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccountDeleteResult']>;
  AccountDeleteSuccess: ResolverTypeWrapper<AccountDeleteSuccess>;
  AccountUpdateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['AccountUpdateResult']>;
  AccountUpdateSuccess: ResolverTypeWrapper<Omit<AccountUpdateSuccess, 'user'> & { user: ResolversTypes['User'] }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  EmailAlreadyTakenError: ResolverTypeWrapper<EmailAlreadyTakenError>;
  Error: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Error']>;
  ErrorCode: ErrorCode;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputError: ResolverTypeWrapper<InvalidInputError>;
  InvalidInputErrors: ResolverTypeWrapper<InvalidInputErrors>;
  LoginFailedError: ResolverTypeWrapper<LoginFailedError>;
  LoginResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LoginResult']>;
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>;
  LogoutResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LogoutResult']>;
  LogoutSuccess: ResolverTypeWrapper<LogoutSuccess>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolverTypeWrapper<NodeMapper>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  ResourceLimitExceededError: ResolverTypeWrapper<ResourceLimitExceededError>;
  ResourceNotFoundError: ResolverTypeWrapper<ResourceNotFoundError>;
  SignupResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SignupResult']>;
  SignupSuccess: ResolverTypeWrapper<SignupSuccess>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Todo: ResolverTypeWrapper<TodoMapper>;
  TodoCompleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoCompleteResult']>;
  TodoCompleteSuccess: ResolverTypeWrapper<Omit<TodoCompleteSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  TodoConnection: ResolverTypeWrapper<Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['TodoEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['Todo']>>> }>;
  TodoCreateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoCreateResult']>;
  TodoCreateSuccess: ResolverTypeWrapper<Omit<TodoCreateSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  TodoDeleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoDeleteResult']>;
  TodoDeleteSuccess: ResolverTypeWrapper<TodoDeleteSuccess>;
  TodoEdge: ResolverTypeWrapper<Omit<TodoEdge, 'node'> & { node: Maybe<ResolversTypes['Todo']> }>;
  TodoSortKeys: TodoSortKeys;
  TodoStatus: TodoStatus;
  TodoUncompleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoUncompleteResult']>;
  TodoUncompleteSuccess: ResolverTypeWrapper<Omit<TodoUncompleteSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  TodoUpdateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoUpdateResult']>;
  TodoUpdateSuccess: ResolverTypeWrapper<Omit<TodoUpdateSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  User: ResolverTypeWrapper<UserMapper>;
  UserConnection: ResolverTypeWrapper<Omit<UserConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversTypes['UserEdge']>>>, nodes: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  UserEdge: ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: Maybe<ResolversTypes['User']> }>;
  UserSortKeys: UserSortKeys;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AccountDeleteResult: ResolversUnionTypes<ResolversParentTypes>['AccountDeleteResult'];
  AccountDeleteSuccess: AccountDeleteSuccess;
  AccountUpdateResult: ResolversUnionTypes<ResolversParentTypes>['AccountUpdateResult'];
  AccountUpdateSuccess: Omit<AccountUpdateSuccess, 'user'> & { user: ResolversParentTypes['User'] };
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  EmailAddress: Scalars['EmailAddress']['output'];
  EmailAlreadyTakenError: EmailAlreadyTakenError;
  Error: ResolversInterfaceTypes<ResolversParentTypes>['Error'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  InvalidInputError: InvalidInputError;
  InvalidInputErrors: InvalidInputErrors;
  LoginFailedError: LoginFailedError;
  LoginResult: ResolversUnionTypes<ResolversParentTypes>['LoginResult'];
  LoginSuccess: LoginSuccess;
  LogoutResult: ResolversUnionTypes<ResolversParentTypes>['LogoutResult'];
  LogoutSuccess: LogoutSuccess;
  Mutation: {};
  Node: NodeMapper;
  PageInfo: PageInfo;
  Query: {};
  ResourceLimitExceededError: ResourceLimitExceededError;
  ResourceNotFoundError: ResourceNotFoundError;
  SignupResult: ResolversUnionTypes<ResolversParentTypes>['SignupResult'];
  SignupSuccess: SignupSuccess;
  String: Scalars['String']['output'];
  Todo: TodoMapper;
  TodoCompleteResult: ResolversUnionTypes<ResolversParentTypes>['TodoCompleteResult'];
  TodoCompleteSuccess: Omit<TodoCompleteSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  TodoConnection: Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['TodoEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['Todo']>>> };
  TodoCreateResult: ResolversUnionTypes<ResolversParentTypes>['TodoCreateResult'];
  TodoCreateSuccess: Omit<TodoCreateSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  TodoDeleteResult: ResolversUnionTypes<ResolversParentTypes>['TodoDeleteResult'];
  TodoDeleteSuccess: TodoDeleteSuccess;
  TodoEdge: Omit<TodoEdge, 'node'> & { node: Maybe<ResolversParentTypes['Todo']> };
  TodoUncompleteResult: ResolversUnionTypes<ResolversParentTypes>['TodoUncompleteResult'];
  TodoUncompleteSuccess: Omit<TodoUncompleteSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  TodoUpdateResult: ResolversUnionTypes<ResolversParentTypes>['TodoUpdateResult'];
  TodoUpdateSuccess: Omit<TodoUpdateSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  User: UserMapper;
  UserConnection: Omit<UserConnection, 'edges' | 'nodes'> & { edges: Maybe<Array<Maybe<ResolversParentTypes['UserEdge']>>>, nodes: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  UserEdge: Omit<UserEdge, 'node'> & { node: Maybe<ResolversParentTypes['User']> };
}>;

export type AccountDeleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteResult'] = ResolversParentTypes['AccountDeleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountDeleteSuccess', ParentType, ContextType>;
}>;

export type AccountDeleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteSuccess'] = ResolversParentTypes['AccountDeleteSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AccountUpdateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountUpdateResult'] = ResolversParentTypes['AccountUpdateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountUpdateSuccess' | 'EmailAlreadyTakenError' | 'InvalidInputErrors', ParentType, ContextType>;
}>;

export type AccountUpdateSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountUpdateSuccess'] = ResolversParentTypes['AccountUpdateSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type EmailAlreadyTakenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EmailAlreadyTakenError'] = ResolversParentTypes['EmailAlreadyTakenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'InvalidInputError' | 'LoginFailedError' | 'ResourceLimitExceededError' | 'ResourceNotFoundError', ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type InvalidInputErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidInputError'] = ResolversParentTypes['InvalidInputError']> = ResolversObject<{
  field?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InvalidInputErrorsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidInputErrors'] = ResolversParentTypes['InvalidInputErrors']> = ResolversObject<{
  errors?: Resolver<Array<ResolversTypes['InvalidInputError']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginFailedErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginFailedError'] = ResolversParentTypes['LoginFailedError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginResult'] = ResolversParentTypes['LoginResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputErrors' | 'LoginFailedError' | 'LoginSuccess', ParentType, ContextType>;
}>;

export type LoginSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginSuccess'] = ResolversParentTypes['LoginSuccess']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  accountUpdate?: Resolver<Maybe<ResolversTypes['AccountUpdateResult']>, ParentType, ContextType, Partial<MutationAccountUpdateArgs>>;
  login?: Resolver<Maybe<ResolversTypes['LoginResult']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout?: Resolver<Maybe<ResolversTypes['LogoutResult']>, ParentType, ContextType>;
  signup?: Resolver<Maybe<ResolversTypes['SignupResult']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'email' | 'name' | 'password'>>;
  todoComplete?: Resolver<Maybe<ResolversTypes['TodoCompleteResult']>, ParentType, ContextType, RequireFields<MutationTodoCompleteArgs, 'id'>>;
  todoCreate?: Resolver<Maybe<ResolversTypes['TodoCreateResult']>, ParentType, ContextType, RequireFields<MutationTodoCreateArgs, 'description' | 'title'>>;
  todoDelete?: Resolver<Maybe<ResolversTypes['TodoDeleteResult']>, ParentType, ContextType, RequireFields<MutationTodoDeleteArgs, 'id'>>;
  todoUncomplete?: Resolver<Maybe<ResolversTypes['TodoUncompleteResult']>, ParentType, ContextType, RequireFields<MutationTodoUncompleteArgs, 'id'>>;
  todoUpdate?: Resolver<Maybe<ResolversTypes['TodoUpdateResult']>, ParentType, ContextType, RequireFields<MutationTodoUpdateArgs, 'id'>>;
}>;

export type NodeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = ResolversObject<{
  __resolveType: TypeResolveFn<'Todo' | 'User', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

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
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'InvalidInputErrors' | 'SignupSuccess', ParentType, ContextType>;
}>;

export type SignupSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupSuccess'] = ResolversParentTypes['SignupSuccess']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Todo'] = ResolversParentTypes['Todo']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['TodoStatus']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoCompleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoCompleteResult'] = ResolversParentTypes['TodoCompleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ResourceNotFoundError' | 'TodoCompleteSuccess', ParentType, ContextType>;
}>;

export type TodoCompleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoCompleteSuccess'] = ResolversParentTypes['TodoCompleteSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoConnection'] = ResolversParentTypes['TodoConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['TodoEdge']>>>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Todo']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoCreateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoCreateResult'] = ResolversParentTypes['TodoCreateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputErrors' | 'ResourceLimitExceededError' | 'TodoCreateSuccess', ParentType, ContextType>;
}>;

export type TodoCreateSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoCreateSuccess'] = ResolversParentTypes['TodoCreateSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoDeleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoDeleteResult'] = ResolversParentTypes['TodoDeleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ResourceNotFoundError' | 'TodoDeleteSuccess', ParentType, ContextType>;
}>;

export type TodoDeleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoDeleteSuccess'] = ResolversParentTypes['TodoDeleteSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoEdge'] = ResolversParentTypes['TodoEdge']> = ResolversObject<{
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoUncompleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoUncompleteResult'] = ResolversParentTypes['TodoUncompleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ResourceNotFoundError' | 'TodoUncompleteSuccess', ParentType, ContextType>;
}>;

export type TodoUncompleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoUncompleteSuccess'] = ResolversParentTypes['TodoUncompleteSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TodoUpdateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoUpdateResult'] = ResolversParentTypes['TodoUpdateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidInputErrors' | 'ResourceNotFoundError' | 'TodoUpdateSuccess', ParentType, ContextType>;
}>;

export type TodoUpdateSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoUpdateSuccess'] = ResolversParentTypes['TodoUpdateSuccess']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['EmailAddress']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type Resolvers<ContextType = Context> = ResolversObject<{
  AccountDeleteResult?: AccountDeleteResultResolvers<ContextType>;
  AccountDeleteSuccess?: AccountDeleteSuccessResolvers<ContextType>;
  AccountUpdateResult?: AccountUpdateResultResolvers<ContextType>;
  AccountUpdateSuccess?: AccountUpdateSuccessResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  EmailAlreadyTakenError?: EmailAlreadyTakenErrorResolvers<ContextType>;
  Error?: ErrorResolvers<ContextType>;
  InvalidInputError?: InvalidInputErrorResolvers<ContextType>;
  InvalidInputErrors?: InvalidInputErrorsResolvers<ContextType>;
  LoginFailedError?: LoginFailedErrorResolvers<ContextType>;
  LoginResult?: LoginResultResolvers<ContextType>;
  LoginSuccess?: LoginSuccessResolvers<ContextType>;
  LogoutResult?: LogoutResultResolvers<ContextType>;
  LogoutSuccess?: LogoutSuccessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ResourceLimitExceededError?: ResourceLimitExceededErrorResolvers<ContextType>;
  ResourceNotFoundError?: ResourceNotFoundErrorResolvers<ContextType>;
  SignupResult?: SignupResultResolvers<ContextType>;
  SignupSuccess?: SignupSuccessResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoCompleteResult?: TodoCompleteResultResolvers<ContextType>;
  TodoCompleteSuccess?: TodoCompleteSuccessResolvers<ContextType>;
  TodoConnection?: TodoConnectionResolvers<ContextType>;
  TodoCreateResult?: TodoCreateResultResolvers<ContextType>;
  TodoCreateSuccess?: TodoCreateSuccessResolvers<ContextType>;
  TodoDeleteResult?: TodoDeleteResultResolvers<ContextType>;
  TodoDeleteSuccess?: TodoDeleteSuccessResolvers<ContextType>;
  TodoEdge?: TodoEdgeResolvers<ContextType>;
  TodoUncompleteResult?: TodoUncompleteResultResolvers<ContextType>;
  TodoUncompleteSuccess?: TodoUncompleteSuccessResolvers<ContextType>;
  TodoUpdateResult?: TodoUpdateResultResolvers<ContextType>;
  TodoUpdateSuccess?: TodoUpdateSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
}>;

