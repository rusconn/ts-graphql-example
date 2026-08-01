/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
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
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: string; output: string; }
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: string; output: string; }
  /** Represents NULL values */
  Void: { input: void; output: void; }
};

export type AccountDeleteResult = AccountDeleteSuccess | IncorrectPasswordError | InvalidInputErrors;

export type AccountDeleteSuccess = {
  id: Scalars['ID']['output'];
};

export type AccountUpdateResult = AccountUpdateSuccess | InvalidInputErrors;

export type AccountUpdateSuccess = {
  user: User;
};

export const AuthPolicy = {
  Admin: 'ADMIN',
  AdminOrTodoOwner: 'ADMIN_OR_TODO_OWNER',
  AdminOrUserOwner: 'ADMIN_OR_USER_OWNER',
  Authenticated: 'AUTHENTICATED',
  Guest: 'GUEST',
  TodoOwner: 'TODO_OWNER'
} as const;

export type AuthPolicy = typeof AuthPolicy[keyof typeof AuthPolicy];
export type EmailAlreadyTakenError = Error & {
  message: Scalars['String']['output'];
};

export type Error = {
  message: Scalars['String']['output'];
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
export type IncorrectOldPasswordError = Error & {
  message: Scalars['String']['output'];
};

export type IncorrectPasswordError = Error & {
  message: Scalars['String']['output'];
};

export type InvalidInputError = Error & {
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type InvalidInputErrors = {
  errors: Array<InvalidInputError>;
};

export type InvalidRefreshTokenError = Error & {
  message: Scalars['String']['output'];
};

export type LoginFailedError = Error & {
  message: Scalars['String']['output'];
};

export type LoginPasswordChangeResult = IncorrectOldPasswordError | InvalidInputErrors | LoginPasswordChangeSuccess | SamePasswordsError;

export type LoginPasswordChangeSuccess = {
  user: User;
};

export type LoginResult = InvalidInputErrors | LoginFailedError | LoginSuccess;

export type LoginSuccess = {
  token: Scalars['String']['output'];
};

export type Mutation = {
  /** 紐づくリソースは全て削除される */
  accountDelete?: Maybe<AccountDeleteResult>;
  accountUpdate?: Maybe<AccountUpdateResult>;
  login?: Maybe<LoginResult>;
  loginPasswordChange?: Maybe<LoginPasswordChangeResult>;
  logout?: Maybe<Scalars['Void']['output']>;
  signup?: Maybe<SignupResult>;
  /** 10000件まで */
  todoCreate?: Maybe<TodoCreateResult>;
  todoDelete?: Maybe<TodoDeleteResult>;
  todoStatusChange?: Maybe<TodoStatusChangeResult>;
  todoUpdate?: Maybe<TodoUpdateResult>;
  tokenRefresh?: Maybe<TokenRefreshResult>;
  userEmailChange?: Maybe<UserEmailChangeResult>;
};


export type MutationAccountDeleteArgs = {
  password: Scalars['String']['input'];
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
  description?: Scalars['String']['input'];
  title?: Scalars['String']['input'];
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
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
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
  reverse?: Scalars['Boolean']['input'];
  sortKey?: UserSortKeys;
};

export type RefreshTokenExpiredError = Error & {
  message: Scalars['String']['output'];
};

export type ResourceLimitExceededError = Error & {
  message: Scalars['String']['output'];
};

export type ResourceNotFoundError = Error & {
  message: Scalars['String']['output'];
};

export type SamePasswordsError = Error & {
  message: Scalars['String']['output'];
};

export type SignupResult = EmailAlreadyTakenError | InvalidInputErrors | SignupSuccess;

export type SignupSuccess = {
  token: Scalars['String']['output'];
};

export type Todo = Node & {
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  status?: Maybe<TodoStatus>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  user?: Maybe<User>;
};

export type TodoConnection = {
  edges?: Maybe<Array<Maybe<TodoEdge>>>;
  nodes?: Maybe<Array<Maybe<Todo>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TodoCreateResult = InvalidInputErrors | ResourceLimitExceededError | TodoCreateSuccess;

export type TodoCreateSuccess = {
  todo: Todo;
  todoEdge: TodoEdge;
};

export type TodoDeleteResult = ResourceNotFoundError | TodoDeleteSuccess;

export type TodoDeleteSuccess = {
  id: Scalars['ID']['output'];
};

export type TodoEdge = {
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
  todo: Todo;
};

export type TodoUpdateResult = InvalidInputErrors | ResourceNotFoundError | TodoUpdateSuccess;

export type TodoUpdateSuccess = {
  todo: Todo;
};

export type TokenRefreshResult = InvalidRefreshTokenError | RefreshTokenExpiredError | TokenRefreshSuccess;

export type TokenRefreshSuccess = {
  token: Scalars['String']['output'];
};

export type User = Node & {
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  email?: Maybe<Scalars['EmailAddress']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  todo?: Maybe<Todo>;
  todos?: Maybe<TodoConnection>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};


export type UserTodoArgs = {
  id: Scalars['ID']['input'];
};


export type UserTodosArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  reverse?: Scalars['Boolean']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortKey?: TodoSortKeys;
  status?: InputMaybe<TodoStatus>;
};

export type UserConnection = {
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  nodes?: Maybe<Array<Maybe<User>>>;
  pageInfo: PageInfo;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type UserEdge = {
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export type UserEmailChangeResult = EmailAlreadyTakenError | InvalidInputErrors | UserEmailChangeSuccess;

export type UserEmailChangeSuccess = {
  user: User;
};

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

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const LogoutLoginSignupDocument = new TypedDocumentString(`
    mutation LogoutLoginSignup($name: String!, $email: String!, $password: String!) {
  signup(name: $name, email: $email, password: $password) {
    __typename
    ... on SignupSuccess {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginSignupMutation, LogoutLoginSignupMutationVariables>;
export const LogoutLoginUserEmailChangeDocument = new TypedDocumentString(`
    mutation LogoutLoginUserEmailChange($email: String!) {
  userEmailChange(email: $email) {
    __typename
    ... on UserEmailChangeSuccess {
      user {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginUserEmailChangeMutation, LogoutLoginUserEmailChangeMutationVariables>;
export const LogoutLoginLoginPasswordChangeDocument = new TypedDocumentString(`
    mutation LogoutLoginLoginPasswordChange($oldPassword: String!, $newPassword: String!) {
  loginPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {
    __typename
    ... on LoginPasswordChangeSuccess {
      user {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginLoginPasswordChangeMutation, LogoutLoginLoginPasswordChangeMutationVariables>;
export const LogoutLoginLogoutDocument = new TypedDocumentString(`
    mutation LogoutLoginLogout {
  logout
}
    `) as unknown as TypedDocumentString<LogoutLoginLogoutMutation, LogoutLoginLogoutMutationVariables>;
export const LogoutLoginLoginDocument = new TypedDocumentString(`
    mutation LogoutLoginLogin($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    __typename
    ... on LoginSuccess {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginLoginMutation, LogoutLoginLoginMutationVariables>;
export const LogoutLoginViewerDocument = new TypedDocumentString(`
    query LogoutLoginViewer {
  viewer {
    id
    name
    email
    createdAt
    updatedAt
    todos(first: 10) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LogoutLoginViewerQuery, LogoutLoginViewerQueryVariables>;
export const MultiDeviceSignupDocument = new TypedDocumentString(`
    mutation MultiDeviceSignup($name: String!, $email: String!, $password: String!) {
  signup(name: $name, email: $email, password: $password) {
    __typename
    ... on SignupSuccess {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceSignupMutation, MultiDeviceSignupMutationVariables>;
export const MultiDeviceViewerDocument = new TypedDocumentString(`
    query MultiDeviceViewer {
  viewer {
    id
    name
    email
    createdAt
    updatedAt
    todos(first: 10) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceViewerQuery, MultiDeviceViewerQueryVariables>;
export const MultiDeviceTodoCreateDocument = new TypedDocumentString(`
    mutation MultiDeviceTodoCreate($title: String, $description: String) {
  todoCreate(title: $title, description: $description) {
    __typename
    ... on TodoCreateSuccess {
      todo {
        id
        title
        description
        status
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceTodoCreateMutation, MultiDeviceTodoCreateMutationVariables>;
export const MultiDeviceLoginDocument = new TypedDocumentString(`
    mutation MultiDeviceLogin($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    __typename
    ... on LoginSuccess {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceLoginMutation, MultiDeviceLoginMutationVariables>;
export const MultiDeviceTodoUpdateDocument = new TypedDocumentString(`
    mutation MultiDeviceTodoUpdate($id: ID!, $title: String, $description: String, $status: TodoStatus) {
  todoUpdate(id: $id, title: $title, description: $description, status: $status) {
    __typename
    ... on TodoUpdateSuccess {
      todo {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceTodoUpdateMutation, MultiDeviceTodoUpdateMutationVariables>;
export const MultiDeviceTokenRefreshDocument = new TypedDocumentString(`
    mutation MultiDeviceTokenRefresh {
  tokenRefresh {
    __typename
    ... on TokenRefreshSuccess {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceTokenRefreshMutation, MultiDeviceTokenRefreshMutationVariables>;
export const MultiDeviceTodoDeleteDocument = new TypedDocumentString(`
    mutation MultiDeviceTodoDelete($id: ID!) {
  todoDelete(id: $id) {
    __typename
    ... on TodoDeleteSuccess {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<MultiDeviceTodoDeleteMutation, MultiDeviceTodoDeleteMutationVariables>;
export const SingleDeviceSignupDocument = new TypedDocumentString(`
    mutation SingleDeviceSignup($name: String!, $email: String!, $password: String!) {
  signup(name: $name, email: $email, password: $password) {
    __typename
    ... on SignupSuccess {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceSignupMutation, SingleDeviceSignupMutationVariables>;
export const SingleDeviceViewerDocument = new TypedDocumentString(`
    query SingleDeviceViewer {
  viewer {
    id
    name
    email
    createdAt
    updatedAt
    todos(first: 10) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceViewerQuery, SingleDeviceViewerQueryVariables>;
export const SingleDeviceTodoCreateDocument = new TypedDocumentString(`
    mutation SingleDeviceTodoCreate($title: String, $description: String) {
  todoCreate(title: $title, description: $description) {
    __typename
    ... on TodoCreateSuccess {
      todo {
        id
        title
        description
        status
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceTodoCreateMutation, SingleDeviceTodoCreateMutationVariables>;
export const SingleDeviceTodoUpdateDocument = new TypedDocumentString(`
    mutation SingleDeviceTodoUpdate($id: ID!, $title: String, $description: String, $status: TodoStatus) {
  todoUpdate(id: $id, title: $title, description: $description, status: $status) {
    __typename
    ... on TodoUpdateSuccess {
      todo {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceTodoUpdateMutation, SingleDeviceTodoUpdateMutationVariables>;
export const SingleDeviceTokenRefreshDocument = new TypedDocumentString(`
    mutation SingleDeviceTokenRefresh {
  tokenRefresh {
    __typename
    ... on TokenRefreshSuccess {
      token
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceTokenRefreshMutation, SingleDeviceTokenRefreshMutationVariables>;
export const SingleDeviceTodoStatusChangeDocument = new TypedDocumentString(`
    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {
  todoStatusChange(id: $id, status: $status) {
    __typename
    ... on TodoStatusChangeSuccess {
      todo {
        id
        title
        description
        status
        createdAt
        updatedAt
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceTodoStatusChangeMutation, SingleDeviceTodoStatusChangeMutationVariables>;
export const SingleDeviceAccountDeleteNodeDocument = new TypedDocumentString(`
    query SingleDeviceAccountDeleteNode($id: ID!) {
  node(id: $id) {
    __typename
    id
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceAccountDeleteNodeQuery, SingleDeviceAccountDeleteNodeQueryVariables>;
export const SingleDeviceAccountDeleteDocument = new TypedDocumentString(`
    mutation SingleDeviceAccountDelete($password: String!) {
  accountDelete(password: $password) {
    __typename
    ... on AccountDeleteSuccess {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<SingleDeviceAccountDeleteMutation, SingleDeviceAccountDeleteMutationVariables>;