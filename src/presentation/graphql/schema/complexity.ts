export const typeDef = /* GraphQL */ `
  directive @complexity(
    value: Int!

    multipliers: [String!]

    """
    trueなら直近のmultipliersではスケールせず、それより上のmultipliersでのみスケールする(totalCount, pageInfo等)。
    サブフィールドにも波及する。
    """
    perInstance: Boolean! = false
  ) on FIELD_DEFINITION
`;
