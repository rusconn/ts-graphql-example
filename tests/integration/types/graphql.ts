import type { DateTime } from '@/types';
import type { NonEmptyString } from '@/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: DateTime;
  /** A string that cannot be passed as an empty value */
  NonEmptyString: NonEmptyString;
};

export type CreateTodoInput = {
  /** 5000文字まで */
  description: Scalars['String'];
  /** 100文字まで */
  title: Scalars['NonEmptyString'];
};

export type CreateUserInput = {
  /** 100文字まで */
  name: Scalars['NonEmptyString'];
};

export enum ErrorCode {
  AuthenticationError = 'AUTHENTICATION_ERROR',
  BadUserInput = 'BAD_USER_INPUT',
  Forbidden = 'FORBIDDEN',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  NotFound = 'NOT_FOUND'
}

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum Role {
  Admin = 'ADMIN',
  Guest = 'GUEST',
  User = 'USER'
}

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

export type UpdateTodoInput = {
  /** 5000文字まで、null は入力エラー */
  description?: InputMaybe<Scalars['String']>;
  /** null は入力エラー */
  status?: InputMaybe<TodoStatus>;
  /** 100文字まで、null は入力エラー */
  title?: InputMaybe<Scalars['NonEmptyString']>;
};

export type UpdateUserInput = {
  /** 100文字まで、null は入力エラー */
  name?: InputMaybe<Scalars['NonEmptyString']>;
};

export type UserOrder = {
  direction: OrderDirection;
  field: UserOrderField;
};

export enum UserOrderField {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export type NodeQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type NodeQuery = { node?: { title: NonEmptyString, id: string } | { name: NonEmptyString, id: string } | null | undefined };

export type CompleteTodoMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CompleteTodoMutation = { completeTodo?: { id: string, updatedAt: DateTime, title: NonEmptyString, description: string, status: TodoStatus } | null | undefined };

export type CreateTodoMutationVariables = Exact<{
  userId: Scalars['ID'];
  input: CreateTodoInput;
}>;


export type CreateTodoMutation = { createTodo?: { id: string, title: NonEmptyString, description: string, status: TodoStatus } | null | undefined };

export type DeleteTodoMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteTodoMutation = { deleteTodo?: { id: string } | null | undefined };

export type TodoQueryVariables = Exact<{
  id: Scalars['ID'];
  includeUser?: InputMaybe<Scalars['Boolean']>;
}>;


export type TodoQuery = { todo?: { id: string, createdAt: DateTime, updatedAt: DateTime, title: NonEmptyString, description: string, status: TodoStatus, user?: { id: string, createdAt: DateTime, updatedAt: DateTime, name: NonEmptyString, role: Role, token: NonEmptyString } } | null | undefined };

export type TodosQueryVariables = Exact<{
  userId: Scalars['ID'];
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  before?: InputMaybe<Scalars['String']>;
  orderBy?: InputMaybe<TodoOrder>;
}>;


export type TodosQuery = { todos?: { totalCount: number, pageInfo: { startCursor?: string | null | undefined, endCursor?: string | null | undefined, hasNextPage: boolean, hasPreviousPage: boolean }, edges: Array<{ cursor: string, node: { id: string, title: NonEmptyString } }> } | null | undefined };

export type UncompleteTodoMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UncompleteTodoMutation = { uncompleteTodo?: { id: string, updatedAt: DateTime, title: NonEmptyString, description: string, status: TodoStatus } | null | undefined };

export type UpdateTodoMutationVariables = Exact<{
  id: Scalars['ID'];
  input: UpdateTodoInput;
}>;


export type UpdateTodoMutation = { updateTodo?: { id: string, updatedAt: DateTime, title: NonEmptyString, description: string, status: TodoStatus } | null | undefined };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { createUser?: { id: string, name: NonEmptyString } | null | undefined };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteUserMutation = { deleteUser?: { id: string } | null | undefined };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser?: { id: string, name: NonEmptyString, updatedAt: DateTime } | null | undefined };

export type UserQueryVariables = Exact<{
  id: Scalars['ID'];
  includeToken?: InputMaybe<Scalars['Boolean']>;
  includeRole?: InputMaybe<Scalars['Boolean']>;
  includeTodos?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  before?: InputMaybe<Scalars['String']>;
  orderBy?: InputMaybe<TodoOrder>;
}>;


export type UserQuery = { user?: { id: string, createdAt: DateTime, updatedAt: DateTime, name: NonEmptyString, token?: NonEmptyString, role?: Role, todos?: { totalCount: number, pageInfo: { startCursor?: string | null | undefined, endCursor?: string | null | undefined, hasNextPage: boolean, hasPreviousPage: boolean }, edges: Array<{ cursor: string, node: { id: string, title: NonEmptyString, status: TodoStatus } }> } } | null | undefined };

export type UsersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  before?: InputMaybe<Scalars['String']>;
  orderBy?: InputMaybe<UserOrder>;
}>;


export type UsersQuery = { users: { totalCount: number, pageInfo: { startCursor?: string | null | undefined, endCursor?: string | null | undefined, hasNextPage: boolean, hasPreviousPage: boolean }, edges: Array<{ cursor: string, node: { id: string } }> } };

export type ViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerQuery = { viewer: { id: string } };
