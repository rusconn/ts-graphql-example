/* eslint-disable */
import * as types from './graphql.js';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    mutation LogoutLoginSignup($name: String!, $email: String!, $password: String!) {\n      signup(name: $name, email: $email, password: $password) {\n        __typename\n        ... on SignupSuccess {\n          token\n        }\n      }\n    }\n  ": typeof types.LogoutLoginSignupDocument,
    "\n    mutation LogoutLoginUserEmailChange($email: String!) {\n      userEmailChange(email: $email) {\n        __typename\n        ... on UserEmailChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": typeof types.LogoutLoginUserEmailChangeDocument,
    "\n    mutation LogoutLoginLoginPasswordChange($oldPassword: String!, $newPassword: String!) {\n      loginPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {\n        __typename\n        ... on LoginPasswordChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": typeof types.LogoutLoginLoginPasswordChangeDocument,
    "\n    mutation LogoutLoginLogout {\n      logout\n    }\n  ": typeof types.LogoutLoginLogoutDocument,
    "\n    mutation LogoutLoginLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          token\n        }\n      }\n    }\n  ": typeof types.LogoutLoginLoginDocument,
    "\n    query LogoutLoginViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.LogoutLoginViewerDocument,
    "\n  mutation MultiDeviceSignup($name: String!, $email: String!, $password: String!) {\n    signup(name: $name, email: $email, password: $password) {\n      __typename\n      ... on SignupSuccess {\n        token\n      }\n    }\n  }\n": typeof types.MultiDeviceSignupDocument,
    "\n    query MultiDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.MultiDeviceViewerDocument,
    "\n    mutation MultiDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": typeof types.MultiDeviceTodoCreateDocument,
    "\n  mutation MultiDeviceLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      __typename\n      ... on LoginSuccess {\n        token\n      }\n    }\n  }\n": typeof types.MultiDeviceLoginDocument,
    "\n    mutation MultiDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.MultiDeviceTodoUpdateDocument,
    "\n    mutation MultiDeviceTokenRefresh {\n      tokenRefresh {\n        __typename\n        ... on TokenRefreshSuccess {\n          token\n        }\n      }\n    }\n  ": typeof types.MultiDeviceTokenRefreshDocument,
    "\n    mutation MultiDeviceTodoDelete($id: ID!) {\n      todoDelete(id: $id) {\n        __typename\n        ... on TodoDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": typeof types.MultiDeviceTodoDeleteDocument,
    "\n  mutation SingleDeviceSignup($name: String!, $email: String!, $password: String!) {\n    signup(name: $name, email: $email, password: $password) {\n      __typename\n      ... on SignupSuccess {\n        token\n      }\n    }\n  }\n": typeof types.SingleDeviceSignupDocument,
    "\n    query SingleDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceViewerDocument,
    "\n    mutation SingleDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceTodoCreateDocument,
    "\n    mutation SingleDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceTodoUpdateDocument,
    "\n    mutation SingleDeviceTokenRefresh {\n      tokenRefresh {\n        __typename\n        ... on TokenRefreshSuccess {\n          token\n        }\n      }\n    }\n  ": typeof types.SingleDeviceTokenRefreshDocument,
    "\n    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {\n      todoStatusChange(id: $id, status: $status) {\n        __typename\n        ... on TodoStatusChangeSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": typeof types.SingleDeviceTodoStatusChangeDocument,
    "\n    query SingleDeviceAccountDeleteNode($id: ID!) {\n      node(id: $id) {\n        __typename\n        id\n      }\n    }\n  ": typeof types.SingleDeviceAccountDeleteNodeDocument,
    "\n    mutation SingleDeviceAccountDelete($password: String!) {\n      accountDelete(password: $password) {\n        __typename\n        ... on AccountDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": typeof types.SingleDeviceAccountDeleteDocument,
};
const documents: Documents = {
    "\n    mutation LogoutLoginSignup($name: String!, $email: String!, $password: String!) {\n      signup(name: $name, email: $email, password: $password) {\n        __typename\n        ... on SignupSuccess {\n          token\n        }\n      }\n    }\n  ": types.LogoutLoginSignupDocument,
    "\n    mutation LogoutLoginUserEmailChange($email: String!) {\n      userEmailChange(email: $email) {\n        __typename\n        ... on UserEmailChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": types.LogoutLoginUserEmailChangeDocument,
    "\n    mutation LogoutLoginLoginPasswordChange($oldPassword: String!, $newPassword: String!) {\n      loginPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {\n        __typename\n        ... on LoginPasswordChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  ": types.LogoutLoginLoginPasswordChangeDocument,
    "\n    mutation LogoutLoginLogout {\n      logout\n    }\n  ": types.LogoutLoginLogoutDocument,
    "\n    mutation LogoutLoginLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          token\n        }\n      }\n    }\n  ": types.LogoutLoginLoginDocument,
    "\n    query LogoutLoginViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.LogoutLoginViewerDocument,
    "\n  mutation MultiDeviceSignup($name: String!, $email: String!, $password: String!) {\n    signup(name: $name, email: $email, password: $password) {\n      __typename\n      ... on SignupSuccess {\n        token\n      }\n    }\n  }\n": types.MultiDeviceSignupDocument,
    "\n    query MultiDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.MultiDeviceViewerDocument,
    "\n    mutation MultiDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": types.MultiDeviceTodoCreateDocument,
    "\n  mutation MultiDeviceLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      __typename\n      ... on LoginSuccess {\n        token\n      }\n    }\n  }\n": types.MultiDeviceLoginDocument,
    "\n    mutation MultiDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.MultiDeviceTodoUpdateDocument,
    "\n    mutation MultiDeviceTokenRefresh {\n      tokenRefresh {\n        __typename\n        ... on TokenRefreshSuccess {\n          token\n        }\n      }\n    }\n  ": types.MultiDeviceTokenRefreshDocument,
    "\n    mutation MultiDeviceTodoDelete($id: ID!) {\n      todoDelete(id: $id) {\n        __typename\n        ... on TodoDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": types.MultiDeviceTodoDeleteDocument,
    "\n  mutation SingleDeviceSignup($name: String!, $email: String!, $password: String!) {\n    signup(name: $name, email: $email, password: $password) {\n      __typename\n      ... on SignupSuccess {\n        token\n      }\n    }\n  }\n": types.SingleDeviceSignupDocument,
    "\n    query SingleDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceViewerDocument,
    "\n    mutation SingleDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceTodoCreateDocument,
    "\n    mutation SingleDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceTodoUpdateDocument,
    "\n    mutation SingleDeviceTokenRefresh {\n      tokenRefresh {\n        __typename\n        ... on TokenRefreshSuccess {\n          token\n        }\n      }\n    }\n  ": types.SingleDeviceTokenRefreshDocument,
    "\n    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {\n      todoStatusChange(id: $id, status: $status) {\n        __typename\n        ... on TodoStatusChangeSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  ": types.SingleDeviceTodoStatusChangeDocument,
    "\n    query SingleDeviceAccountDeleteNode($id: ID!) {\n      node(id: $id) {\n        __typename\n        id\n      }\n    }\n  ": types.SingleDeviceAccountDeleteNodeDocument,
    "\n    mutation SingleDeviceAccountDelete($password: String!) {\n      accountDelete(password: $password) {\n        __typename\n        ... on AccountDeleteSuccess {\n          id\n        }\n      }\n    }\n  ": types.SingleDeviceAccountDeleteDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginSignup($name: String!, $email: String!, $password: String!) {\n      signup(name: $name, email: $email, password: $password) {\n        __typename\n        ... on SignupSuccess {\n          token\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginSignupDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginUserEmailChange($email: String!) {\n      userEmailChange(email: $email) {\n        __typename\n        ... on UserEmailChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginUserEmailChangeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginLoginPasswordChange($oldPassword: String!, $newPassword: String!) {\n      loginPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {\n        __typename\n        ... on LoginPasswordChangeSuccess {\n          user {\n            id\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginLoginPasswordChangeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginLogout {\n      logout\n    }\n  "): typeof import('./graphql.js').LogoutLoginLogoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogoutLoginLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        __typename\n        ... on LoginSuccess {\n          token\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query LogoutLoginViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').LogoutLoginViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MultiDeviceSignup($name: String!, $email: String!, $password: String!) {\n    signup(name: $name, email: $email, password: $password) {\n      __typename\n      ... on SignupSuccess {\n        token\n      }\n    }\n  }\n"): typeof import('./graphql.js').MultiDeviceSignupDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MultiDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceTodoCreateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MultiDeviceLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      __typename\n      ... on LoginSuccess {\n        token\n      }\n    }\n  }\n"): typeof import('./graphql.js').MultiDeviceLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceTodoUpdateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceTokenRefresh {\n      tokenRefresh {\n        __typename\n        ... on TokenRefreshSuccess {\n          token\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceTokenRefreshDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MultiDeviceTodoDelete($id: ID!) {\n      todoDelete(id: $id) {\n        __typename\n        ... on TodoDeleteSuccess {\n          id\n        }\n      }\n    }\n  "): typeof import('./graphql.js').MultiDeviceTodoDeleteDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SingleDeviceSignup($name: String!, $email: String!, $password: String!) {\n    signup(name: $name, email: $email, password: $password) {\n      __typename\n      ... on SignupSuccess {\n        token\n      }\n    }\n  }\n"): typeof import('./graphql.js').SingleDeviceSignupDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SingleDeviceViewer {\n      viewer {\n        id\n        name\n        email\n        createdAt\n        updatedAt\n        todos(first: 10) {\n          totalCount\n          pageInfo {\n            hasNextPage\n            hasPreviousPage\n            startCursor\n            endCursor\n          }\n          nodes {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceViewerDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceTodoCreate($title: String, $description: String) {\n      todoCreate(title: $title, description: $description) {\n        __typename\n        ... on TodoCreateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceTodoCreateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceTodoUpdate(\n      $id: ID!\n      $title: String\n      $description: String\n      $status: TodoStatus\n    ) {\n      todoUpdate(id: $id, title: $title, description: $description, status: $status) {\n        __typename\n        ... on TodoUpdateSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceTodoUpdateDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceTokenRefresh {\n      tokenRefresh {\n        __typename\n        ... on TokenRefreshSuccess {\n          token\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceTokenRefreshDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {\n      todoStatusChange(id: $id, status: $status) {\n        __typename\n        ... on TodoStatusChangeSuccess {\n          todo {\n            id\n            title\n            description\n            status\n            createdAt\n            updatedAt\n          }\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceTodoStatusChangeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SingleDeviceAccountDeleteNode($id: ID!) {\n      node(id: $id) {\n        __typename\n        id\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceAccountDeleteNodeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SingleDeviceAccountDelete($password: String!) {\n      accountDelete(password: $password) {\n        __typename\n        ... on AccountDeleteSuccess {\n          id\n        }\n      }\n    }\n  "): typeof import('./graphql.js').SingleDeviceAccountDeleteDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
