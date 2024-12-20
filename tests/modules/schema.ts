export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: Date; }
  EmailAddress: { input: string; output: string; }
  NonEmptyString: { input: string; output: string; }
};

export enum ErrorCode {
  AuthenticationError = 'AUTHENTICATION_ERROR',
  BadUserInput = 'BAD_USER_INPUT',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND'
}

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
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

export type UserOrder = {
  direction: OrderDirection;
  field: UserOrderField;
};

export enum UserOrderField {
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT'
}

export type NodeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type NodeQuery = { node?: { id: string } | { id: string } | null };

export type CompleteTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CompleteTodoMutation = { completeTodo?: { __typename: 'CompleteTodoSuccess', todo: { id: string, updatedAt?: Date | null, title?: string | null, description?: string | null, status?: TodoStatus | null } } | { __typename: 'InvalidInputError' } | { __typename: 'ResourceNotFoundError' } | null };

export type CreateTodoMutationVariables = Exact<{
  title: Scalars['NonEmptyString']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateTodoMutation = { createTodo?: { __typename: 'CreateTodoSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null } } | { __typename: 'InvalidInputError' } | { __typename: 'ResourceLimitExceededError' } | null };

export type DeleteTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTodoMutation = { deleteTodo?: { __typename: 'DeleteTodoSuccess', id: string } | { __typename: 'InvalidInputError' } | { __typename: 'ResourceNotFoundError' } | null };

export type UncompleteTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UncompleteTodoMutation = { uncompleteTodo?: { __typename: 'InvalidInputError' } | { __typename: 'ResourceNotFoundError' } | { __typename: 'UncompleteTodoSuccess', todo: { id: string, updatedAt?: Date | null, title?: string | null, description?: string | null, status?: TodoStatus | null } } | null };

export type UpdateTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['NonEmptyString']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TodoStatus>;
}>;


export type UpdateTodoMutation = { updateTodo?: { __typename: 'InvalidInputError' } | { __typename: 'ResourceNotFoundError' } | { __typename: 'UpdateTodoSuccess', todo: { id: string, updatedAt?: Date | null, title?: string | null, description?: string | null, status?: TodoStatus | null } } | null };

export type TodoCreatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoCreatedAtQuery = { node?: { __typename: 'Todo', createdAt?: Date | null } | { __typename: 'User' } | null };

export type TodoDescriptionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoDescriptionQuery = { node?: { __typename: 'Todo', description?: string | null } | { __typename: 'User' } | null };

export type TodoIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoIdQuery = { node?: { __typename: 'Todo', id: string } | { __typename: 'User', id: string } | null };

export type TodoStatusQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoStatusQuery = { node?: { __typename: 'Todo', status?: TodoStatus | null } | { __typename: 'User' } | null };

export type TodoTitleQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoTitleQuery = { node?: { __typename: 'Todo', title?: string | null } | { __typename: 'User' } | null };

export type TodoUpdatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoUpdatedAtQuery = { node?: { __typename: 'Todo', updatedAt?: Date | null } | { __typename: 'User' } | null };

export type TodoUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoUserQuery = { node?: { __typename: 'Todo', user?: { id: string } | null } | { __typename: 'User' } | null };

export type UserTodoQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  todoId: Scalars['ID']['input'];
}>;


export type UserTodoQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', todo?: { id: string } | null } | null };

export type UserTodosQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<TodoOrder>;
  status?: InputMaybe<TodoStatus>;
}>;


export type UserTodosQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', todos?: { totalCount?: number | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges?: Array<{ cursor: string, node?: { id: string } | null } | null> | null } | null } | null };

export type DeleteMeMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteMeMutation = { deleteMe?: { __typename: 'DeleteMeSuccess', id: string } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
}>;


export type LoginMutation = { login?: { __typename: 'InvalidInputError' } | { __typename: 'LoginSuccess', token: string } | { __typename: 'UserNotFoundError' } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout?: { __typename: 'LogoutSuccess', user: { id: string, name?: string | null, email?: string | null } } | null };

export type SignupMutationVariables = Exact<{
  name: Scalars['NonEmptyString']['input'];
  email: Scalars['NonEmptyString']['input'];
  password: Scalars['NonEmptyString']['input'];
}>;


export type SignupMutation = { signup?: { __typename: 'EmailAlreadyTakenError' } | { __typename: 'InvalidInputError' } | { __typename: 'SignupSuccess', token: string } | null };

export type UpdateMeMutationVariables = Exact<{
  name?: InputMaybe<Scalars['NonEmptyString']['input']>;
  email?: InputMaybe<Scalars['NonEmptyString']['input']>;
  password?: InputMaybe<Scalars['NonEmptyString']['input']>;
}>;


export type UpdateMeMutation = { updateMe?: { __typename: 'EmailAlreadyTakenError' } | { __typename: 'InvalidInputError' } | { __typename: 'UpdateMeSuccess', user: { id: string, name?: string | null, email?: string | null, updatedAt?: Date | null } } | null };

export type UserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserQuery = { user?: { id: string } | null };

export type UsersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  orderBy?: InputMaybe<UserOrder>;
}>;


export type UsersQuery = { users?: { totalCount?: number | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges?: Array<{ cursor: string, node?: { id: string } | null } | null> | null } | null };

export type UserCreatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserCreatedAtQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', createdAt?: Date | null } | null };

export type UserEmailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserEmailQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', email?: string | null } | null };

export type UserIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserIdQuery = { node?: { __typename: 'Todo', id: string } | { __typename: 'User', id: string } | null };

export type UserNameQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserNameQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', name?: string | null } | null };

export type UserUpdatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserUpdatedAtQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', updatedAt?: Date | null } | null };
