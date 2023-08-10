import type { CodegenConfig } from "@graphql-codegen/cli";

const scalars = {
  ID: {
    input: "string",
    output: "string",
  },
  DateTime: "@/modules/scalar/adapters#DateTime",
  EmailAddress: "@/modules/scalar/adapters#EmailAddress",
  NonEmptyString: "@/modules/scalar/adapters#NonEmptyString",
};

const typescript = {
  avoidOptionals: {
    defaultValue: true,
  },
  scalars,
  useTypeImports: true,
};

const typescriptResolvers = {
  useIndexSignature: true,
  contextType: "@/modules/common/resolvers#Context",
  mapperTypeSuffix: "Mapper",
  mappers: {
    User: "@/modules/user/resolvers#User",
    Todo: "@/modules/todo/resolvers#Todo",
  },
  resolversNonOptionalTypename: {
    unionMember: true,
  },
};

const typescriptOperations = {
  onlyOperationTypes: true,
  skipTypename: true,
};

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  generates: {
    "src/modules/common/schema.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        ...typescript,
        ...typescriptResolvers,
      },
    },
    "tests/it/modules/schema.ts": {
      documents: "tests/it/modules/**/*.ts",
      plugins: ["typescript", "typescript-operations"],
      config: {
        ...typescript,
        ...typescriptOperations,
      },
    },
  },
};

export default config;
