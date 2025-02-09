declare module "graphql-list-fields" {
  export default function getFieldNames(info: GraphQLResolveInfo, depth?: number): string[];
}
