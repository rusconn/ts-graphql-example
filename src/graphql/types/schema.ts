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

export type CompleteTodoResult = CompleteTodoSucceeded | TodoNotFoundError;

export type CompleteTodoSucceeded = {
  __typename?: 'CompleteTodoSucceeded';
  todo: Todo;
};

export type CreateTodoInput = {
  /** 5000文字まで */
  description: Scalars['String'];
  /** 100文字まで */
  title: Scalars['NonEmptyString'];
};

export type CreateTodoResult = CreateTodoSucceeded;

export type CreateTodoSucceeded = {
  __typename?: 'CreateTodoSucceeded';
  todo: Todo;
};

export type DeleteMeResult = DeleteMeSucceeded;

export type DeleteMeSucceeded = {
  __typename?: 'DeleteMeSucceeded';
  id: Scalars['ID'];
};

export type DeleteTodoResult = DeleteTodoSucceeded | TodoNotFoundError;

export type DeleteTodoSucceeded = {
  __typename?: 'DeleteTodoSucceeded';
  id: Scalars['ID'];
};

export type EmailAlreadyTakenError = Error & {
  __typename?: 'EmailAlreadyTakenError';
  message: Scalars['String'];
};

export type Error = {
  message: Scalars['String'];
};

export enum ErrorCode {
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

export type LoginResult = LoginSucceeded | UserNotFoundError;

export type LoginSucceeded = {
  __typename?: 'LoginSucceeded';
  user: User;
};

export type LogoutResult = LogoutSucceeded;

export type LogoutSucceeded = {
  __typename?: 'LogoutSucceeded';
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  completeTodo?: Maybe<CompleteTodoResult>;
  createTodo?: Maybe<CreateTodoResult>;
  /** 紐づくリソースは全て削除される */
  deleteMe?: Maybe<DeleteMeResult>;
  deleteTodo?: Maybe<DeleteTodoResult>;
  login?: Maybe<LoginResult>;
  logout?: Maybe<LogoutResult>;
  signup?: Maybe<SignupResult>;
  uncompleteTodo?: Maybe<UncompleteTodoResult>;
  /** 指定したフィールドのみ更新する */
  updateMe?: Maybe<UpdateMeResult>;
  /** 指定したフィールドのみ更新する */
  updateTodo?: Maybe<UpdateTodoResult>;
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

export type SignupInput = {
  /** 100文字まで、既に存在する場合はエラー */
  email: Scalars['EmailAddress'];
  /** 100文字まで */
  name: Scalars['NonEmptyString'];
  /** 8文字以上、50文字まで */
  password: Scalars['NonEmptyString'];
};

export type SignupResult = EmailAlreadyTakenError | SignupSucceeded;

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

export type TodoNotFoundError = Error & {
  __typename?: 'TodoNotFoundError';
  message: Scalars['String'];
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

export type UncompleteTodoResult = TodoNotFoundError | UncompleteTodoSucceeded;

export type UncompleteTodoSucceeded = {
  __typename?: 'UncompleteTodoSucceeded';
  todo: Todo;
};

export type UpdateMeInput = {
  /** 100文字まで、既に存在する場合はエラー、null は入力エラー */
  email?: InputMaybe<Scalars['EmailAddress']>;
  /** 100文字まで、null は入力エラー */
  name?: InputMaybe<Scalars['NonEmptyString']>;
  /** 8文字以上、50文字まで、null は入力エラー */
  password?: InputMaybe<Scalars['NonEmptyString']>;
};

export type UpdateMeResult = EmailAlreadyTakenError | UpdateMeSucceeded;

export type UpdateMeSucceeded = {
  __typename?: 'UpdateMeSucceeded';
  user: User;
};

export type UpdateTodoInput = {
  /** 5000文字まで、null は入力エラー */
  description?: InputMaybe<Scalars['String']>;
  /** null は入力エラー */
  status?: InputMaybe<TodoStatus>;
  /** 100文字まで、null は入力エラー */
  title?: InputMaybe<Scalars['NonEmptyString']>;
};

export type UpdateTodoResult = TodoNotFoundError | UpdateTodoSucceeded;

export type UpdateTodoSucceeded = {
  __typename?: 'UpdateTodoSucceeded';
  todo: Todo;
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
  CompleteTodoResult: ResolversTypes['CompleteTodoSucceeded'] | ResolversTypes['TodoNotFoundError'];
  CompleteTodoSucceeded: ResolverTypeWrapper<Omit<CompleteTodoSucceeded, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  CreateTodoInput: CreateTodoInput;
  CreateTodoResult: ResolversTypes['CreateTodoSucceeded'];
  CreateTodoSucceeded: ResolverTypeWrapper<Omit<CreateTodoSucceeded, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteMeResult: ResolversTypes['DeleteMeSucceeded'];
  DeleteMeSucceeded: ResolverTypeWrapper<DeleteMeSucceeded>;
  DeleteTodoResult: ResolversTypes['DeleteTodoSucceeded'] | ResolversTypes['TodoNotFoundError'];
  DeleteTodoSucceeded: ResolverTypeWrapper<DeleteTodoSucceeded>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']>;
  EmailAlreadyTakenError: ResolverTypeWrapper<EmailAlreadyTakenError>;
  Error: ResolversTypes['EmailAlreadyTakenError'] | ResolversTypes['TodoNotFoundError'] | ResolversTypes['UserNotFoundError'];
  ErrorCode: ErrorCode;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LoginInput: LoginInput;
  LoginResult: ResolversTypes['LoginSucceeded'] | ResolversTypes['UserNotFoundError'];
  LoginSucceeded: ResolverTypeWrapper<Omit<LoginSucceeded, 'user'> & { user: ResolversTypes['User'] }>;
  LogoutResult: ResolversTypes['LogoutSucceeded'];
  LogoutSucceeded: ResolverTypeWrapper<Omit<LogoutSucceeded, 'user'> & { user: ResolversTypes['User'] }>;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['Todo'] | ResolversTypes['User'];
  NonEmptyString: ResolverTypeWrapper<Scalars['NonEmptyString']>;
  OrderDirection: OrderDirection;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  SignupInput: SignupInput;
  SignupResult: ResolversTypes['EmailAlreadyTakenError'] | ResolversTypes['SignupSucceeded'];
  SignupSucceeded: ResolverTypeWrapper<SignupSucceeded>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Todo: ResolverTypeWrapper<TodoMapped>;
  TodoConnection: ResolverTypeWrapper<Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Array<ResolversTypes['TodoEdge']>, nodes: Array<ResolversTypes['Todo']> }>;
  TodoEdge: ResolverTypeWrapper<Omit<TodoEdge, 'node'> & { node: ResolversTypes['Todo'] }>;
  TodoNotFoundError: ResolverTypeWrapper<TodoNotFoundError>;
  TodoOrder: TodoOrder;
  TodoOrderField: TodoOrderField;
  TodoStatus: TodoStatus;
  UncompleteTodoResult: ResolversTypes['TodoNotFoundError'] | ResolversTypes['UncompleteTodoSucceeded'];
  UncompleteTodoSucceeded: ResolverTypeWrapper<Omit<UncompleteTodoSucceeded, 'todo'> & { todo: ResolversTypes['Todo'] }>;
  UpdateMeInput: UpdateMeInput;
  UpdateMeResult: ResolversTypes['EmailAlreadyTakenError'] | ResolversTypes['UpdateMeSucceeded'];
  UpdateMeSucceeded: ResolverTypeWrapper<Omit<UpdateMeSucceeded, 'user'> & { user: ResolversTypes['User'] }>;
  UpdateTodoInput: UpdateTodoInput;
  UpdateTodoResult: ResolversTypes['TodoNotFoundError'] | ResolversTypes['UpdateTodoSucceeded'];
  UpdateTodoSucceeded: ResolverTypeWrapper<Omit<UpdateTodoSucceeded, 'todo'> & { todo: ResolversTypes['Todo'] }>;
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
  CompleteTodoResult: ResolversParentTypes['CompleteTodoSucceeded'] | ResolversParentTypes['TodoNotFoundError'];
  CompleteTodoSucceeded: Omit<CompleteTodoSucceeded, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  CreateTodoInput: CreateTodoInput;
  CreateTodoResult: ResolversParentTypes['CreateTodoSucceeded'];
  CreateTodoSucceeded: Omit<CreateTodoSucceeded, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  DateTime: Scalars['DateTime'];
  DeleteMeResult: ResolversParentTypes['DeleteMeSucceeded'];
  DeleteMeSucceeded: DeleteMeSucceeded;
  DeleteTodoResult: ResolversParentTypes['DeleteTodoSucceeded'] | ResolversParentTypes['TodoNotFoundError'];
  DeleteTodoSucceeded: DeleteTodoSucceeded;
  EmailAddress: Scalars['EmailAddress'];
  EmailAlreadyTakenError: EmailAlreadyTakenError;
  Error: ResolversParentTypes['EmailAlreadyTakenError'] | ResolversParentTypes['TodoNotFoundError'] | ResolversParentTypes['UserNotFoundError'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  LoginInput: LoginInput;
  LoginResult: ResolversParentTypes['LoginSucceeded'] | ResolversParentTypes['UserNotFoundError'];
  LoginSucceeded: Omit<LoginSucceeded, 'user'> & { user: ResolversParentTypes['User'] };
  LogoutResult: ResolversParentTypes['LogoutSucceeded'];
  LogoutSucceeded: Omit<LogoutSucceeded, 'user'> & { user: ResolversParentTypes['User'] };
  Mutation: {};
  Node: ResolversParentTypes['Todo'] | ResolversParentTypes['User'];
  NonEmptyString: Scalars['NonEmptyString'];
  PageInfo: PageInfo;
  Query: {};
  SignupInput: SignupInput;
  SignupResult: ResolversParentTypes['EmailAlreadyTakenError'] | ResolversParentTypes['SignupSucceeded'];
  SignupSucceeded: SignupSucceeded;
  String: Scalars['String'];
  Todo: TodoMapped;
  TodoConnection: Omit<TodoConnection, 'edges' | 'nodes'> & { edges: Array<ResolversParentTypes['TodoEdge']>, nodes: Array<ResolversParentTypes['Todo']> };
  TodoEdge: Omit<TodoEdge, 'node'> & { node: ResolversParentTypes['Todo'] };
  TodoNotFoundError: TodoNotFoundError;
  TodoOrder: TodoOrder;
  UncompleteTodoResult: ResolversParentTypes['TodoNotFoundError'] | ResolversParentTypes['UncompleteTodoSucceeded'];
  UncompleteTodoSucceeded: Omit<UncompleteTodoSucceeded, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  UpdateMeInput: UpdateMeInput;
  UpdateMeResult: ResolversParentTypes['EmailAlreadyTakenError'] | ResolversParentTypes['UpdateMeSucceeded'];
  UpdateMeSucceeded: Omit<UpdateMeSucceeded, 'user'> & { user: ResolversParentTypes['User'] };
  UpdateTodoInput: UpdateTodoInput;
  UpdateTodoResult: ResolversParentTypes['TodoNotFoundError'] | ResolversParentTypes['UpdateTodoSucceeded'];
  UpdateTodoSucceeded: Omit<UpdateTodoSucceeded, 'todo'> & { todo: ResolversParentTypes['Todo'] };
  User: UserMapped;
  UserConnection: Omit<UserConnection, 'edges' | 'nodes'> & { edges: Array<ResolversParentTypes['UserEdge']>, nodes: Array<ResolversParentTypes['User']> };
  UserEdge: Omit<UserEdge, 'node'> & { node: ResolversParentTypes['User'] };
  UserNotFoundError: UserNotFoundError;
  UserOrder: UserOrder;
}>;

export type CompleteTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CompleteTodoResult'] = ResolversParentTypes['CompleteTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CompleteTodoSucceeded' | 'TodoNotFoundError', ParentType, ContextType>;
}>;

export type CompleteTodoSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CompleteTodoSucceeded'] = ResolversParentTypes['CompleteTodoSucceeded']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTodoResult'] = ResolversParentTypes['CreateTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CreateTodoSucceeded', ParentType, ContextType>;
}>;

export type CreateTodoSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTodoSucceeded'] = ResolversParentTypes['CreateTodoSucceeded']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteMeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteMeResult'] = ResolversParentTypes['DeleteMeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeleteMeSucceeded', ParentType, ContextType>;
}>;

export type DeleteMeSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteMeSucceeded'] = ResolversParentTypes['DeleteMeSucceeded']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTodoResult'] = ResolversParentTypes['DeleteTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'DeleteTodoSucceeded' | 'TodoNotFoundError', ParentType, ContextType>;
}>;

export type DeleteTodoSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTodoSucceeded'] = ResolversParentTypes['DeleteTodoSucceeded']> = ResolversObject<{
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
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'TodoNotFoundError' | 'UserNotFoundError', ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type LoginResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginResult'] = ResolversParentTypes['LoginResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'LoginSucceeded' | 'UserNotFoundError', ParentType, ContextType>;
}>;

export type LoginSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginSucceeded'] = ResolversParentTypes['LoginSucceeded']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type LogoutResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LogoutResult'] = ResolversParentTypes['LogoutResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'LogoutSucceeded', ParentType, ContextType>;
}>;

export type LogoutSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LogoutSucceeded'] = ResolversParentTypes['LogoutSucceeded']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  completeTodo?: Resolver<Maybe<ResolversTypes['CompleteTodoResult']>, ParentType, ContextType, RequireFields<MutationCompleteTodoArgs, 'id'>>;
  createTodo?: Resolver<Maybe<ResolversTypes['CreateTodoResult']>, ParentType, ContextType, RequireFields<MutationCreateTodoArgs, 'input'>>;
  deleteMe?: Resolver<Maybe<ResolversTypes['DeleteMeResult']>, ParentType, ContextType>;
  deleteTodo?: Resolver<Maybe<ResolversTypes['DeleteTodoResult']>, ParentType, ContextType, RequireFields<MutationDeleteTodoArgs, 'id'>>;
  login?: Resolver<Maybe<ResolversTypes['LoginResult']>, ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  logout?: Resolver<Maybe<ResolversTypes['LogoutResult']>, ParentType, ContextType>;
  signup?: Resolver<Maybe<ResolversTypes['SignupResult']>, ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  uncompleteTodo?: Resolver<Maybe<ResolversTypes['UncompleteTodoResult']>, ParentType, ContextType, RequireFields<MutationUncompleteTodoArgs, 'id'>>;
  updateMe?: Resolver<Maybe<ResolversTypes['UpdateMeResult']>, ParentType, ContextType, RequireFields<MutationUpdateMeArgs, 'input'>>;
  updateTodo?: Resolver<Maybe<ResolversTypes['UpdateTodoResult']>, ParentType, ContextType, RequireFields<MutationUpdateTodoArgs, 'id' | 'input'>>;
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

export type SignupResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignupResult'] = ResolversParentTypes['SignupResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'SignupSucceeded', ParentType, ContextType>;
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

export type TodoNotFoundErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TodoNotFoundError'] = ResolversParentTypes['TodoNotFoundError']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UncompleteTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UncompleteTodoResult'] = ResolversParentTypes['UncompleteTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TodoNotFoundError' | 'UncompleteTodoSucceeded', ParentType, ContextType>;
}>;

export type UncompleteTodoSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UncompleteTodoSucceeded'] = ResolversParentTypes['UncompleteTodoSucceeded']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateMeResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateMeResult'] = ResolversParentTypes['UpdateMeResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EmailAlreadyTakenError' | 'UpdateMeSucceeded', ParentType, ContextType>;
}>;

export type UpdateMeSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateMeSucceeded'] = ResolversParentTypes['UpdateMeSucceeded']> = ResolversObject<{
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UpdateTodoResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTodoResult'] = ResolversParentTypes['UpdateTodoResult']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TodoNotFoundError' | 'UpdateTodoSucceeded', ParentType, ContextType>;
}>;

export type UpdateTodoSucceededResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTodoSucceeded'] = ResolversParentTypes['UpdateTodoSucceeded']> = ResolversObject<{
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType>;
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
  CompleteTodoResult?: CompleteTodoResultResolvers<ContextType>;
  CompleteTodoSucceeded?: CompleteTodoSucceededResolvers<ContextType>;
  CreateTodoResult?: CreateTodoResultResolvers<ContextType>;
  CreateTodoSucceeded?: CreateTodoSucceededResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteMeResult?: DeleteMeResultResolvers<ContextType>;
  DeleteMeSucceeded?: DeleteMeSucceededResolvers<ContextType>;
  DeleteTodoResult?: DeleteTodoResultResolvers<ContextType>;
  DeleteTodoSucceeded?: DeleteTodoSucceededResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  EmailAlreadyTakenError?: EmailAlreadyTakenErrorResolvers<ContextType>;
  Error?: ErrorResolvers<ContextType>;
  LoginResult?: LoginResultResolvers<ContextType>;
  LoginSucceeded?: LoginSucceededResolvers<ContextType>;
  LogoutResult?: LogoutResultResolvers<ContextType>;
  LogoutSucceeded?: LogoutSucceededResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  NonEmptyString?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SignupResult?: SignupResultResolvers<ContextType>;
  SignupSucceeded?: SignupSucceededResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  TodoConnection?: TodoConnectionResolvers<ContextType>;
  TodoEdge?: TodoEdgeResolvers<ContextType>;
  TodoNotFoundError?: TodoNotFoundErrorResolvers<ContextType>;
  UncompleteTodoResult?: UncompleteTodoResultResolvers<ContextType>;
  UncompleteTodoSucceeded?: UncompleteTodoSucceededResolvers<ContextType>;
  UpdateMeResult?: UpdateMeResultResolvers<ContextType>;
  UpdateMeSucceeded?: UpdateMeSucceededResolvers<ContextType>;
  UpdateTodoResult?: UpdateTodoResultResolvers<ContextType>;
  UpdateTodoSucceeded?: UpdateTodoSucceededResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  UserNotFoundError?: UserNotFoundErrorResolvers<ContextType>;
}>;

