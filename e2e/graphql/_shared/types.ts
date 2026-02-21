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
  DateTime: { input: string; output: string; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: string; output: string; }
  /** Represents NULL values */
  Void: { input: void; output: void; }
};

export const ErrorCode = {
  AccessTokenExpired: 'ACCESS_TOKEN_EXPIRED',
  AuthenticationError: 'AUTHENTICATION_ERROR',
  BadUserInput: 'BAD_USER_INPUT',
  Forbidden: 'FORBIDDEN',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  QueryTooComplex: 'QUERY_TOO_COMPLEX'
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
export type LogoutLoginSignupMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LogoutLoginSignupMutation = { signup?:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'SignupSuccess', token: string }
   | null };

export type LogoutLoginUserEmailChangeMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type LogoutLoginUserEmailChangeMutation = { userEmailChange?:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'UserEmailChangeSuccess', user: { id: string } }
   | null };

export type LogoutLoginLoginPasswordChangeMutationVariables = Exact<{
  oldPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type LogoutLoginLoginPasswordChangeMutation = { loginPasswordChange?:
    | { __typename: 'IncorrectOldPasswordError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'LoginPasswordChangeSuccess', user: { id: string } }
    | { __typename: 'SamePasswordsError' }
   | null };

export type LogoutLoginLogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutLoginLogoutMutation = { logout?: void | null };

export type LogoutLoginLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LogoutLoginLoginMutation = { login?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'LoginFailedError' }
    | { __typename: 'LoginSuccess', token: string }
   | null };

export type LogoutLoginViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type LogoutLoginViewerQuery = { viewer?: { id: string, name?: string | null, email?: string | null, createdAt?: string | null, updatedAt?: string | null, todos?: { totalCount?: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } | null> | null } | null } | null };

export type MultiDeviceSignupMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type MultiDeviceSignupMutation = { signup?:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'SignupSuccess', token: string }
   | null };

export type MultiDeviceViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type MultiDeviceViewerQuery = { viewer?: { id: string, name?: string | null, email?: string | null, createdAt?: string | null, updatedAt?: string | null, todos?: { totalCount?: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } | null> | null } | null } | null };

export type MultiDeviceTodoCreateMutationVariables = Exact<{
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type MultiDeviceTodoCreateMutation = { todoCreate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceLimitExceededError' }
    | { __typename: 'TodoCreateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null } }
   | null };

export type MultiDeviceLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type MultiDeviceLoginMutation = { login?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'LoginFailedError' }
    | { __typename: 'LoginSuccess', token: string }
   | null };

export type MultiDeviceTodoUpdateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TodoStatus>;
}>;


export type MultiDeviceTodoUpdateMutation = { todoUpdate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoUpdateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } }
   | null };

export type MultiDeviceTokenRefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type MultiDeviceTokenRefreshMutation = { tokenRefresh?:
    | { __typename: 'InvalidRefreshTokenError' }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'TokenRefreshSuccess', token: string }
   | null };

export type MultiDeviceTodoDeleteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MultiDeviceTodoDeleteMutation = { todoDelete?:
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoDeleteSuccess', id: string }
   | null };

export type NodeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type NodeQuery = { node?:
    | { id: string }
    | { id: string }
   | null };

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


export type TodoCreatedAtQuery = { node?:
    | { __typename: 'Todo', createdAt?: string | null }
    | { __typename: 'User' }
   | null };

export type TodoDescriptionQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoDescriptionQuery = { node?:
    | { __typename: 'Todo', description?: string | null }
    | { __typename: 'User' }
   | null };

export type TodoIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoIdQuery = { node?:
    | { __typename: 'Todo', id: string }
    | { __typename: 'User', id: string }
   | null };

export type TodoStatusQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoStatusQuery = { node?:
    | { __typename: 'Todo', status?: TodoStatus | null }
    | { __typename: 'User' }
   | null };

export type TodoTitleQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoTitleQuery = { node?:
    | { __typename: 'Todo', title?: string | null }
    | { __typename: 'User' }
   | null };

export type TodoUpdatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoUpdatedAtQuery = { node?:
    | { __typename: 'Todo', updatedAt?: string | null }
    | { __typename: 'User' }
   | null };

export type TodoUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TodoUserQuery = { node?:
    | { __typename: 'Todo', user?: { id: string } | null }
    | { __typename: 'User' }
   | null };

export type UserCreatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserCreatedAtQuery = { node?:
    | { __typename: 'Todo' }
    | { __typename: 'User', createdAt?: string | null }
   | null };

export type UserEmailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserEmailQuery = { node?:
    | { __typename: 'Todo' }
    | { __typename: 'User', email?: string | null }
   | null };

export type UserIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserIdQuery = { node?:
    | { __typename: 'Todo', id: string }
    | { __typename: 'User', id: string }
   | null };

export type UserNameQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserNameQuery = { node?:
    | { __typename: 'Todo' }
    | { __typename: 'User', name?: string | null }
   | null };

export type UserTodoQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  todoId: Scalars['ID']['input'];
}>;


export type UserTodoQuery = { node?:
    | { __typename: 'Todo' }
    | { __typename: 'User', todo?: { id: string } | null }
   | null };

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


export type UserTodosQuery = { node?:
    | { __typename: 'Todo' }
    | { __typename: 'User', todos?: { totalCount?: number | null, pageInfo: { startCursor?: string | null, endCursor?: string | null, hasNextPage: boolean, hasPreviousPage: boolean }, edges?: Array<{ cursor: string, node?: { id: string } | null } | null> | null } | null }
   | null };

export type UserUpdatedAtQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UserUpdatedAtQuery = { node?:
    | { __typename: 'Todo' }
    | { __typename: 'User', updatedAt?: string | null }
   | null };

export type SingleDeviceSignupMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type SingleDeviceSignupMutation = { signup?:
    | { __typename: 'EmailAlreadyTakenError' }
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'SignupSuccess', token: string }
   | null };

export type SingleDeviceViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type SingleDeviceViewerQuery = { viewer?: { id: string, name?: string | null, email?: string | null, createdAt?: string | null, updatedAt?: string | null, todos?: { totalCount?: number | null, pageInfo: { hasNextPage: boolean, hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null }, nodes?: Array<{ id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } | null> | null } | null } | null };

export type SingleDeviceTodoCreateMutationVariables = Exact<{
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type SingleDeviceTodoCreateMutation = { todoCreate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceLimitExceededError' }
    | { __typename: 'TodoCreateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null } }
   | null };

export type SingleDeviceTodoUpdateMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TodoStatus>;
}>;


export type SingleDeviceTodoUpdateMutation = { todoUpdate?:
    | { __typename: 'InvalidInputErrors' }
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoUpdateSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } }
   | null };

export type SingleDeviceTokenRefreshMutationVariables = Exact<{ [key: string]: never; }>;


export type SingleDeviceTokenRefreshMutation = { tokenRefresh?:
    | { __typename: 'InvalidRefreshTokenError' }
    | { __typename: 'RefreshTokenExpiredError' }
    | { __typename: 'TokenRefreshSuccess', token: string }
   | null };

export type SingleDeviceTodoStatusChangeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: TodoStatus;
}>;


export type SingleDeviceTodoStatusChangeMutation = { todoStatusChange?:
    | { __typename: 'ResourceNotFoundError' }
    | { __typename: 'TodoStatusChangeSuccess', todo: { id: string, title?: string | null, description?: string | null, status?: TodoStatus | null, createdAt?: string | null, updatedAt?: string | null } }
   | null };

export type SingleDeviceAccountDeleteNodeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SingleDeviceAccountDeleteNodeQuery = { node?:
    | { __typename: 'Todo', id: string }
    | { __typename: 'User', id: string }
   | null };

export type SingleDeviceAccountDeleteMutationVariables = Exact<{
  password: Scalars['String']['input'];
}>;


export type SingleDeviceAccountDeleteMutation = { accountDelete?:
    | { __typename: 'AccountDeleteSuccess', id: string }
    | { __typename: 'IncorrectPasswordError' }
    | { __typename: 'InvalidInputErrors' }
   | null };
