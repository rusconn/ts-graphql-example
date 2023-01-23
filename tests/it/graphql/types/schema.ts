import type { DateTime } from '@/graphql/types/scalars';
import type { EmailAddress } from '@/graphql/types/scalars';
import type { NonEmptyString } from '@/graphql/types/scalars';
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

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type SignupInput = {
  /** 100文字まで、既に存在する場合はエラー */
  email: Scalars['EmailAddress'];
  /** 100文字まで */
  name: Scalars['NonEmptyString'];
  /** 8文字以上、50文字まで */
  password: Scalars['NonEmptyString'];
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


export type NodeQuery = { node?: { title?: NonEmptyString | null, id: string } | { name: NonEmptyString, id: string } | null };

export type CompleteMyTodoMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type CompleteMyTodoMutation = { completeMyTodo?: { id: string, updatedAt: DateTime, title?: NonEmptyString | null, description?: string | null, status?: TodoStatus | null } | null };

export type CreateMyTodoMutationVariables = Exact<{
  input: CreateMyTodoInput;
}>;


export type CreateMyTodoMutation = { createMyTodo?: { id: string, title?: NonEmptyString | null, description?: string | null, status?: TodoStatus | null } | null };

export type DeleteMyTodoMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteMyTodoMutation = { deleteMyTodo?: string | null };

export type MyTodoQueryVariables = Exact<{
  id: Scalars['ID'];
  includeUser?: InputMaybe<Scalars['Boolean']>;
}>;


export type MyTodoQuery = { myTodo?: { id: string, createdAt: DateTime, updatedAt: DateTime, title?: NonEmptyString | null, description?: string | null, status?: TodoStatus | null, user?: { id: string, createdAt: DateTime, updatedAt: DateTime, name: NonEmptyString, email?: EmailAddress | null, token?: NonEmptyString | null } | null } | null };

export type MyTodosQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  before?: InputMaybe<Scalars['String']>;
  orderBy?: InputMaybe<TodoOrder>;
}>;


export type MyTodosQuery = { myTodos?: { totalCount: number, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges: Array<{ cursor: string, node: { id: string, title?: NonEmptyString | null } }> } | null };

export type UncompleteMyTodoMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UncompleteMyTodoMutation = { uncompleteMyTodo?: { id: string, updatedAt: DateTime, title?: NonEmptyString | null, description?: string | null, status?: TodoStatus | null } | null };

export type UpdateMyTodoMutationVariables = Exact<{
  id: Scalars['ID'];
  input: UpdateMyTodoInput;
}>;


export type UpdateMyTodoMutation = { updateMyTodo?: { id: string, updatedAt: DateTime, title?: NonEmptyString | null, description?: string | null, status?: TodoStatus | null } | null };

export type DeleteMeMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteMeMutation = { deleteMe?: string | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login?: { id: string, name: NonEmptyString, email?: EmailAddress | null, token?: NonEmptyString | null } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout?: { id: string, name: NonEmptyString, email?: EmailAddress | null, token?: NonEmptyString | null } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me?: { id: string } | null };

export type SignupMutationVariables = Exact<{
  input: SignupInput;
}>;


export type SignupMutation = { signup?: { id: string, name: NonEmptyString } | null };

export type UpdateMeMutationVariables = Exact<{
  input: UpdateMeInput;
}>;


export type UpdateMeMutation = { updateMe?: { id: string, name: NonEmptyString, email?: EmailAddress | null, updatedAt: DateTime } | null };

export type UserQueryVariables = Exact<{
  id: Scalars['ID'];
  includeEmail?: InputMaybe<Scalars['Boolean']>;
  includeToken?: InputMaybe<Scalars['Boolean']>;
  includeTodos?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  before?: InputMaybe<Scalars['String']>;
  orderBy?: InputMaybe<TodoOrder>;
}>;


export type UserQuery = { user?: { id: string, createdAt: DateTime, updatedAt: DateTime, name: NonEmptyString, email?: EmailAddress | null, token?: NonEmptyString | null, todos?: { totalCount: number, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges: Array<{ cursor: string, node: { id: string, title?: NonEmptyString | null, status?: TodoStatus | null } }> } | null } | null };

export type UsersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  before?: InputMaybe<Scalars['String']>;
  orderBy?: InputMaybe<UserOrder>;
}>;


export type UsersQuery = { users?: { totalCount: number, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges: Array<{ cursor: string, node: { id: string } }> } | null };
