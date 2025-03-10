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
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: DateTime; output: Date | DateTime; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: EmailAddress; output: EmailAddress; }
};

export type AccountDeleteResult = AccountDeleteSuccess;

export type AccountDeleteSuccess = {
  __typename?: 'AccountDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors;

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
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  QueryTooComplex: 'QUERY_TOO_COMPLEX',
  TokenExpired: 'TOKEN_EXPIRED'
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];
export type IncorrectOldPasswordError = Error & {
  __typename?: 'IncorrectOldPasswordError';
  message: Scalars['String']['output'];
};

export type InvalidInputError = Error & {
  __typename?: 'InvalidInputError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type InvalidInputErrors = {
  __typename?: 'InvalidInputErrors';
  errors: Array<InvalidInputError>;
};

export type InvalidRefreshTokenError = Error & {
  __typename?: 'InvalidRefreshTokenError';
  message: Scalars['String']['output'];
};

export type LoginFailedError = Error & {
  __typename?: 'LoginFailedError';
  message: Scalars['String']['output'];
};

export type LoginPasswordChangeResult = IncorrectOldPasswordError | InvalidInputErrors | LoginPasswordChangeSuccess | SamePasswordsError;

export type LoginPasswordChangeSuccess = {
  __typename?: 'LoginPasswordChangeSuccess';
  id: Scalars['ID']['output'];
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
  loginPasswordChange?: Maybe<LoginPasswordChangeResult>;
  logout?: Maybe<LogoutResult>;
  signup?: Maybe<SignupResult>;
  /** 10000件まで */
  todoCreate?: Maybe<TodoCreateResult>;
  todoDelete?: Maybe<TodoDeleteResult>;
  todoStatusChange?: Maybe<TodoStatusChangeResult>;
  todoUpdate?: Maybe<TodoUpdateResult>;
  tokenRefresh?: Maybe<TokenRefreshResult>;
  userEmailChange?: Maybe<UserEmailChangeResult>;
};


export type MutationAccountUpdateArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationLoginPasswordChangeArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationTodoCreateArgs = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationTodoDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTodoStatusChangeArgs = {
  id: Scalars['ID']['input'];
  status: TodoStatus;
};


export type MutationTodoUpdateArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<TodoStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUserEmailChangeArgs = {
  email: Scalars['String']['input'];
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

export type SamePasswordsError = Error & {
  __typename?: 'SamePasswordsError';
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
  todoEdge: TodoEdge;
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
export type TodoStatusChangeResult = ResourceNotFoundError | TodoStatusChangeSuccess;

export type TodoStatusChangeSuccess = {
  __typename?: 'TodoStatusChangeSuccess';
  todo: Todo;
};

export type TodoUpdateResult = InvalidInputErrors | ResourceNotFoundError | TodoUpdateSuccess;

export type TodoUpdateSuccess = {
  __typename?: 'TodoUpdateSuccess';
  todo: Todo;
};

export type TokenRefreshResult = InvalidRefreshTokenError | TokenRefreshSuccess;

export type TokenRefreshSuccess = {
  __typename?: 'TokenRefreshSuccess';
  token: Scalars['String']['output'];
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

export type UserEmailChangeResult = EmailAlreadyTakenError | InvalidInputErrors | UserEmailChangeSuccess;

export type UserEmailChangeSuccess = {
  __typename?: 'UserEmailChangeSuccess';
  user: User;
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
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  AccountDeleteResult: ( AccountDeleteSuccess & { __typename: 'AccountDeleteSuccess' } );
  AccountUpdateResult: ( Omit<AccountUpdateSuccess, 'user'> & { user: _RefType['User'] } & { __typename: 'AccountUpdateSuccess' } ) | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } );
  LoginPasswordChangeResult: ( IncorrectOldPasswordError & { __typename: 'IncorrectOldPasswordError' } ) | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( LoginPasswordChangeSuccess & { __typename: 'LoginPasswordChangeSuccess' } ) | ( SamePasswordsError & { __typename: 'SamePasswordsError' } );
  LoginResult: ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( LoginFailedError & { __typename: 'LoginFailedError' } ) | ( LoginSuccess & { __typename: 'LoginSuccess' } );
  LogoutResult: ( LogoutSuccess & { __typename: 'LogoutSuccess' } );
  SignupResult: ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } ) | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( SignupSuccess & { __typename: 'SignupSuccess' } );
  TodoCreateResult: ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( ResourceLimitExceededError & { __typename: 'ResourceLimitExceededError' } ) | ( Omit<TodoCreateSuccess, 'todo' | 'todoEdge'> & { todo: _RefType['Todo'], todoEdge: _RefType['TodoEdge'] } & { __typename: 'TodoCreateSuccess' } );
  TodoDeleteResult: ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( TodoDeleteSuccess & { __typename: 'TodoDeleteSuccess' } );
  TodoStatusChangeResult: ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<TodoStatusChangeSuccess, 'todo'> & { todo: _RefType['Todo'] } & { __typename: 'TodoStatusChangeSuccess' } );
  TodoUpdateResult: ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( ResourceNotFoundError & { __typename: 'ResourceNotFoundError' } ) | ( Omit<TodoUpdateSuccess, 'todo'> & { todo: _RefType['Todo'] } & { __typename: 'TodoUpdateSuccess' } );
  TokenRefreshResult: ( InvalidRefreshTokenError & { __typename: 'InvalidRefreshTokenError' } ) | ( TokenRefreshSuccess & { __typename: 'TokenRefreshSuccess' } );
  UserEmailChangeResult: ( EmailAlreadyTakenError & { __typename: 'EmailAlreadyTakenError' } ) | ( InvalidInputErrors & { __typename: 'InvalidInputErrors' } ) | ( Omit<UserEmailChangeSuccess, 'user'> & { user: _RefType['User'] } & { __typename: 'UserEmailChangeSuccess' } );
}>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Error: ( EmailAlreadyTakenError ) | ( IncorrectOldPasswordError ) | ( InvalidInputError ) | ( InvalidRefreshTokenError ) | ( LoginFailedError ) | ( ResourceLimitExceededError ) | ( ResourceNotFoundError ) | ( SamePasswordsError );
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
  IncorrectOldPasswordError: ResolverTypeWrapper<IncorrectOldPasswordError>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputError: ResolverTypeWrapper<InvalidInputError>;
  InvalidInputErrors: ResolverTypeWrapper<InvalidInputErrors>;
  InvalidRefreshTokenError: ResolverTypeWrapper<InvalidRefreshTokenError>;
  LoginFailedError: ResolverTypeWrapper<LoginFailedError>;
  LoginPasswordChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['LoginPasswordChangeResult']>;
  LoginPasswordChangeSuccess: ResolverTypeWrapper<LoginPasswordChangeSuccess>;
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
  SamePasswordsError: ResolverTypeWrapper<SamePasswordsError>;
  SignupResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['SignupResult']>;
  SignupSuccess: ResolverTypeWrapper<SignupSuccess>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Todo: ResolverTypeWrapper<TodoMapper>;
  TodoConnection: ResolverTypeWrapper<Omit<TodoConnection, 'edges' | 'nodes'> & { edges?: Maybe<Array<Maybe<ResolversTypes['TodoEdge']>>>, nodes?: Maybe<Array<Maybe<ResolversTypes['Todo']>>> }>;
  TodoCreateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoCreateResult']>;
  TodoCreateSuccess: ResolverTypeWrapper<Omit<TodoCreateSuccess, 'todo' | 'todoEdge'> & { todo: ResolversTypes['Todo'], todoEdge: ResolversTypes['TodoEdge'] }>;
  TodoDeleteResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoDeleteResult']>;
  TodoDeleteSuccess: ResolverTypeWrapper<TodoDeleteSuccess>;
  TodoEdge: ResolverTypeWrapper<Omit<TodoEdge, 'node'> & { node?: Maybe<ResolversTypes['Todo']> }>;
  TodoSortKeys: TodoSortKeys;
  TodoStatus: TodoStatus;
  TodoStatusChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoStatusChangeResult']>;
  TodoStatusChangeSuccess: ResolverTypeWrapper<Omit<TodoStatusChangeSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  TodoUpdateResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TodoUpdateResult']>;
  TodoUpdateSuccess: ResolverTypeWrapper<Omit<TodoUpdateSuccess, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  TokenRefreshResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['TokenRefreshResult']>;
  TokenRefreshSuccess: ResolverTypeWrapper<TokenRefreshSuccess>;
  User: ResolverTypeWrapper<UserMapper>;
  UserConnection: ResolverTypeWrapper<Omit<UserConnection, 'edges' | 'nodes'> & { edges?: Maybe<Array<Maybe<ResolversTypes['UserEdge']>>>, nodes?: Maybe<Array<Maybe<ResolversTypes['User']>>> }>;
  UserEdge: ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node?: Maybe<ResolversTypes['User']> }>;
  UserEmailChangeResult: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserEmailChangeResult']>;
  UserEmailChangeSuccess: ResolverTypeWrapper<Omit<UserEmailChangeSuccess, 'user'> & { user: ResolversTypes['User'] }>;
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
  IncorrectOldPasswordError: IncorrectOldPasswordError;
  Int: Scalars['Int']['output'];
  InvalidInputError: InvalidInputError;
  InvalidInputErrors: InvalidInputErrors;
  InvalidRefreshTokenError: InvalidRefreshTokenError;
  LoginFailedError: LoginFailedError;
  LoginPasswordChangeResult: ResolversUnionTypes<ResolversParentTypes>['LoginPasswordChangeResult'];
  LoginPasswordChangeSuccess: LoginPasswordChangeSuccess;
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
  SamePasswordsError: SamePasswordsError;
  SignupResult: ResolversUnionTypes<ResolversParentTypes>['SignupResult'];
  SignupSuccess: SignupSuccess;
  String: Scalars['String']['output'];
  Todo: TodoMapper;
  TodoConnection: Omit<TodoConnection, 'edges' | 'nodes'> & { edges?: Maybe<Array<Maybe<ResolversParentTypes['TodoEdge']>>>, nodes?: Maybe<Array<Maybe<ResolversParentTypes['Todo']>>> };
  TodoCreateResult: ResolversUnionTypes<ResolversParentTypes>['TodoCreateResult'];
  TodoCreateSuccess: Omit<TodoCreateSuccess, 'todo' | 'todoEdge'> & { todo: ResolversParentTypes['Todo'], todoEdge: ResolversParentTypes['TodoEdge'] };
  TodoDeleteResult: ResolversUnionTypes<ResolversParentTypes>['TodoDeleteResult'];
  TodoDeleteSuccess: TodoDeleteSuccess;
  TodoEdge: Omit<TodoEdge, 'node'> & { node?: Maybe<ResolversParentTypes['Todo']> };
  TodoStatusChangeResult: ResolversUnionTypes<ResolversParentTypes>['TodoStatusChangeResult'];
  TodoStatusChangeSuccess: Omit<TodoStatusChangeSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  TodoUpdateResult: ResolversUnionTypes<ResolversParentTypes>['TodoUpdateResult'];
  TodoUpdateSuccess: Omit<TodoUpdateSuccess, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  TokenRefreshResult: ResolversUnionTypes<ResolversParentTypes>['TokenRefreshResult'];
  TokenRefreshSuccess: TokenRefreshSuccess;
  User: UserMapper;
  UserConnection: Omit<UserConnection, 'edges' | 'nodes'> & { edges?: Maybe<Array<Maybe<ResolversParentTypes['UserEdge']>>>, nodes?: Maybe<Array<Maybe<ResolversParentTypes['User']>>> };
  UserEdge: Omit<UserEdge, 'node'> & { node?: Maybe<ResolversParentTypes['User']> };
  UserEmailChangeResult: ResolversUnionTypes<ResolversParentTypes>['UserEmailChangeResult'];
  UserEmailChangeSuccess: Omit<UserEmailChangeSuccess, 'user'> & { user: ResolversParentTypes['User'] };
}>;

export type ComplexityDirectiveArgs = {
  multipliers?: Maybe<Array<Scalars['String']['input']>>;
  value: Scalars['Int']['input'];
};

export type ComplexityDirectiveResolver<Result, Parent, ContextType = Context, Args = ComplexityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SemanticNonNullDirectiveArgs = {
  levels?: Maybe<Array<Maybe<Scalars['Int']['input']>>>;
};

export type SemanticNonNullDirectiveResolver<Result, Parent, ContextType = Context, Args = SemanticNonNullDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AccountDeleteResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteResult'] = ResolversParentTypes['AccountDeleteResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountDeleteSuccess', ParentType, ContextType>;
}>;

export type AccountDeleteSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountDeleteSuccess'] = ResolversParentTypes['AccountDeleteSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type AccountUpdateResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AccountUpdateResult'] = ResolversParentTypes['AccountUpdateResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AccountUpdateSuccess' | 'InvalidInputErrors', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'IncorrectOldPasswordError' | 'InvalidInputError' | 'InvalidRefreshTokenError' | 'LoginFailedError' | 'ResourceLimitExceededError' | 'ResourceNotFoundError' | 'SamePasswordsError', ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type IncorrectOldPasswordErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['IncorrectOldPasswordError'] = ResolversParentTypes['IncorrectOldPasswordError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type InvalidRefreshTokenErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['InvalidRefreshTokenError'] = ResolversParentTypes['InvalidRefreshTokenError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginFailedErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginFailedError'] = ResolversParentTypes['LoginFailedError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LoginPasswordChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginPasswordChangeResult'] = ResolversParentTypes['LoginPasswordChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'IncorrectOldPasswordError' | 'InvalidInputErrors' | 'LoginPasswordChangeSuccess' | 'SamePasswordsError', ParentType, ContextType>;
}>;

export type LoginPasswordChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginPasswordChangeSuccess'] = ResolversParentTypes['LoginPasswordChangeSuccess']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  accountDelete: Resolver<Maybe<ResolversTypes['AccountDeleteResult']>, ParentType, ContextType>;
  accountUpdate: Resolver<Maybe<ResolversTypes['AccountUpdateResult']>, ParentType, ContextType, Partial<MutationAccountUpdateArgs>>;
  login: Resolver<Maybe<ResolversTypes['LoginResult']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  loginPasswordChange: Resolver<Maybe<ResolversTypes['LoginPasswordChangeResult']>, ParentType, ContextType, RequireFields<MutationLoginPasswordChangeArgs, 'newPassword' | 'oldPassword'>>;
  logout: Resolver<Maybe<ResolversTypes['LogoutResult']>, ParentType, ContextType>;
  signup: Resolver<Maybe<ResolversTypes['SignupResult']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'email' | 'name' | 'password'>>;
  todoCreate: Resolver<Maybe<ResolversTypes['TodoCreateResult']>, ParentType, ContextType, RequireFields<MutationTodoCreateArgs, 'description' | 'title'>>;
  todoDelete: Resolver<Maybe<ResolversTypes['TodoDeleteResult']>, ParentType, ContextType, RequireFields<MutationTodoDeleteArgs, 'id'>>;
  todoStatusChange: Resolver<Maybe<ResolversTypes['TodoStatusChangeResult']>, ParentType, ContextType, RequireFields<MutationTodoStatusChangeArgs, 'id' | 'status'>>;
  todoUpdate: Resolver<Maybe<ResolversTypes['TodoUpdateResult']>, ParentType, ContextType, RequireFields<MutationTodoUpdateArgs, 'id'>>;
  tokenRefresh: Resolver<Maybe<ResolversTypes['TokenRefreshResult']>, ParentType, ContextType>;
  userEmailChange: Resolver<Maybe<ResolversTypes['UserEmailChangeResult']>, ParentType, ContextType, RequireFields<MutationUserEmailChangeArgs, 'email'>>;
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
  node: Resolver<Maybe<ResolversTypes['Node']>, ParentType, ContextType, RequireFields<QueryNodeArgs, 'id'>>;
  user: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users: Resolver<Maybe<ResolversTypes['UserConnection']>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'reverse' | 'sortKey'>>;
  viewer: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type ResourceLimitExceededErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ResourceLimitExceededError'] = ResolversParentTypes['ResourceLimitExceededError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ResourceNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ResourceNotFoundError'] = ResolversParentTypes['ResourceNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SamePasswordsErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SamePasswordsError'] = ResolversParentTypes['SamePasswordsError']> = ResolversObject<{
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
  todoEdge?: Resolver<ResolversTypes['TodoEdge'], ParentType, ContextType>;
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

export type TodoStatusChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoStatusChangeResult'] = ResolversParentTypes['TodoStatusChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ResourceNotFoundError' | 'TodoStatusChangeSuccess', ParentType, ContextType>;
}>;

export type TodoStatusChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoStatusChangeSuccess'] = ResolversParentTypes['TodoStatusChangeSuccess']> = ResolversObject<{
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

export type TokenRefreshResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TokenRefreshResult'] = ResolversParentTypes['TokenRefreshResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'InvalidRefreshTokenError' | 'TokenRefreshSuccess', ParentType, ContextType>;
}>;

export type TokenRefreshSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TokenRefreshSuccess'] = ResolversParentTypes['TokenRefreshSuccess']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type UserEmailChangeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEmailChangeResult'] = ResolversParentTypes['UserEmailChangeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'InvalidInputErrors' | 'UserEmailChangeSuccess', ParentType, ContextType>;
}>;

export type UserEmailChangeSuccessResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEmailChangeSuccess'] = ResolversParentTypes['UserEmailChangeSuccess']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
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
  IncorrectOldPasswordError?: IncorrectOldPasswordErrorResolvers<ContextType>;
  InvalidInputError?: InvalidInputErrorResolvers<ContextType>;
  InvalidInputErrors?: InvalidInputErrorsResolvers<ContextType>;
  InvalidRefreshTokenError?: InvalidRefreshTokenErrorResolvers<ContextType>;
  LoginFailedError?: LoginFailedErrorResolvers<ContextType>;
  LoginPasswordChangeResult?: LoginPasswordChangeResultResolvers<ContextType>;
  LoginPasswordChangeSuccess?: LoginPasswordChangeSuccessResolvers<ContextType>;
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
  SamePasswordsError?: SamePasswordsErrorResolvers<ContextType>;
  SignupResult?: SignupResultResolvers<ContextType>;
  SignupSuccess?: SignupSuccessResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoConnection?: TodoConnectionResolvers<ContextType>;
  TodoCreateResult?: TodoCreateResultResolvers<ContextType>;
  TodoCreateSuccess?: TodoCreateSuccessResolvers<ContextType>;
  TodoDeleteResult?: TodoDeleteResultResolvers<ContextType>;
  TodoDeleteSuccess?: TodoDeleteSuccessResolvers<ContextType>;
  TodoEdge?: TodoEdgeResolvers<ContextType>;
  TodoStatusChangeResult?: TodoStatusChangeResultResolvers<ContextType>;
  TodoStatusChangeSuccess?: TodoStatusChangeSuccessResolvers<ContextType>;
  TodoUpdateResult?: TodoUpdateResultResolvers<ContextType>;
  TodoUpdateSuccess?: TodoUpdateSuccessResolvers<ContextType>;
  TokenRefreshResult?: TokenRefreshResultResolvers<ContextType>;
  TokenRefreshSuccess?: TokenRefreshSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserEmailChangeResult?: UserEmailChangeResultResolvers<ContextType>;
  UserEmailChangeSuccess?: UserEmailChangeSuccessResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = Context> = ResolversObject<{
  complexity?: ComplexityDirectiveResolver<any, any, ContextType>;
  semanticNonNull?: SemanticNonNullDirectiveResolver<any, any, ContextType>;
}>;
