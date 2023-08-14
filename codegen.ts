import type { CodegenConfig } from "@graphql-codegen/cli";
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript";
import type { TypeScriptResolversPluginConfig } from "@graphql-codegen/typescript-resolvers";
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations";

const typescript: TypeScriptPluginConfig = {
  avoidOptionals: {
    defaultValue: true,
  },
  scalars: {
    ID: "string",
    DateTime: "@/modules/scalar/adapters#DateTime",
    EmailAddress: "@/modules/scalar/adapters#EmailAddress",
    NonEmptyString: "@/modules/scalar/adapters#NonEmptyString",
  },
  useTypeImports: true,
};

const typescriptResolvers: TypeScriptResolversPluginConfig = {
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

const typescriptOperations: TypeScriptDocumentsPluginConfig = {
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
