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
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: string; output: Date; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: string; output: string; }
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
export const UserSortKeys = {
  CreatedAt: 'CREATED_AT',
  UpdatedAt: 'UPDATED_AT'
} as const;

export type UserSortKeys = typeof UserSortKeys[keyof typeof UserSortKeys];
export type AccountDeleteMutationVariables = Exact<{ [key: string]: never; }>;


export type AccountDeleteMutation = { accountDelete?: { __typename: 'AccountDeleteSuccess', id: string } | null };

export type AccountUpdateMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type AccountUpdateMutation = { accountUpdate?: { __typename: 'AccountUpdateSuccess', user: { id: string, name?: string | null, email?: string | null, updatedAt?: Date | null } } | { __typename: 'InvalidInputErrors' } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { login?: { __typename: 'InvalidInputErrors' } | { __typename: 'LoginFailedError' } | { __typename: 'LoginSuccess', token: string } | null };

export type LoginPasswordChangeMutationVariables = Exact<{
  oldPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type LoginPasswordChangeMutation = { loginPasswordChange?: { __typename: 'IncorrectOldPasswordError' } | { __typename: 'InvalidInputErrors' } | { __typename: 'LoginPasswordChangeSuccess', id: string } | { __typename: 'SamePasswordsError' } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout?: { __typename: 'LogoutSuccess', id: string } | null };

export type SignupMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type SignupMutation = { signup?: { __typename: 'EmailAlreadyTakenError' } | { __typename: 'InvalidInputErrors' } | { __typename: 'SignupSuccess', token: string } | null };

export type TodoCreateMutationVariables = Exact<{
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type TodoCreateMutation = { todoCreate?: { __typename: 'InvalidInputErrors' } | { __typename: 'ResourceLimitExceededError' } | { __typename: 'TodoCreateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null } } | null };

export type TodoDeleteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoDeleteMutation = { todoDelete?: { __typename: 'ResourceNotFoundError' } | { __typename: 'TodoDeleteSuccess', id: string } | null };

export type TodoStatusChangeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: TodoStatus;
}>;


export type TodoStatusChangeMutation = { todoStatusChange?: { __typename: 'ResourceNotFoundError' } | { __typename: 'TodoStatusChangeSuccess', todo: { id: string, updatedAt?: Date | null, title?: string | null, description?: string | null, status?: TodoStatus | null } } | null };

export type TodoUpdateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TodoStatus>;
}>;


export type TodoUpdateMutation = { todoUpdate?: { __typename: 'InvalidInputErrors' } | { __typename: 'ResourceNotFoundError' } | { __typename: 'TodoUpdateSuccess', todo: { id: string, updatedAt?: Date | null, title?: string | null, description?: string | null, status?: TodoStatus | null } } | null };

export type TokenRefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type TokenRefreshMutation = { tokenRefresh?: { __typename: 'InvalidRefreshTokenError' } | { __typename: 'TokenRefreshSuccess', token: string } | null };

export type UserEmailChangeMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type UserEmailChangeMutation = { userEmailChange?: { __typename: 'EmailAlreadyTakenError' } | { __typename: 'InvalidInputErrors' } | { __typename: 'UserEmailChangeSuccess', user: { id: string } } | null };

export type NodeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type NodeQuery = { node?: { id: string } | { id: string } | null };

export type UserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserQuery = { user?: { id: string } | null };

export type UsersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  reverse?: InputMaybe<Scalars['Boolean']['input']>;
  sortKey?: InputMaybe<UserSortKeys>;
}>;


export type UsersQuery = { users?: { totalCount?: number | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges?: Array<{ cursor: string, node?: { id: string } | null } | null> | null } | null };

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
  reverse?: InputMaybe<Scalars['Boolean']['input']>;
  sortKey?: InputMaybe<TodoSortKeys>;
  status?: InputMaybe<TodoStatus>;
}>;


export type UserTodosQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', todos?: { totalCount?: number | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges?: Array<{ cursor: string, node?: { id: string } | null } | null> | null } | null } | null };

export type UserUpdatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserUpdatedAtQuery = { node?: { __typename: 'Todo' } | { __typename: 'User', updatedAt?: Date | null } | null };
