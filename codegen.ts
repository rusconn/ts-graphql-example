import type { CodegenConfig } from "@graphql-codegen/cli";

const scalars = {
  ID: {
    input: "string",
    output: "string",
  },
  DateTime: "@/graphql/types/scalars#DateTime",
  EmailAddress: "@/graphql/types/scalars#EmailAddress",
  NonEmptyString: "@/graphql/types/scalars#NonEmptyString",
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
  contextType: "@/types#Context",
  mapperTypeSuffix: "Mapper",
  mappers: {
    User: "@/graphql/types/mappers#User",
    Todo: "@/graphql/types/mappers#Todo",
  },
};

const typescriptOperations = {
  onlyOperationTypes: true,
  skipTypename: true,
};

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  generates: {
    "src/graphql/types/schema.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        ...typescript,
        ...typescriptResolvers,
      },
    },
    "tests/it/graphql/types/schema.ts": {
      documents: "tests/it/graphql/**/*.ts",
      plugins: ["typescript", "typescript-operations"],
      config: {
        ...typescript,
        ...typescriptOperations,
      },
    },
  },
};

export default config;
