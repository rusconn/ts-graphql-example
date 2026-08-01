export const typeDef = /* GraphQL */ `
  directive @auth(policy: AuthPolicy!) on FIELD_DEFINITION

  enum AuthPolicy {
    ADMIN
    AUTHENTICATED
    GUEST
    ADMIN_OR_TODO_OWNER
    ADMIN_OR_USER_OWNER
    TODO_OWNER
  }
`;
