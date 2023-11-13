import type { CodegenConfig } from "@graphql-codegen/cli";
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript";
import type { TypeScriptResolversPluginConfig } from "@graphql-codegen/typescript-resolvers";
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations";

const typescript: TypeScriptPluginConfig = {
  avoidOptionals: {
    defaultValue: true,
  },
  scalars: {
    ID: {
      input: "string",
      output: "@/modules/scalar/mod.js#ID",
    },
    DateTime: {
      input: "@/modules/scalar/mod.js#DateTime",
      output: "Date | DateTime", // DateTime リゾルバーが Date -> DateTime する
    },
    EmailAddress: {
      input: "@/modules/scalar/mod.js#EmailAddress",
      output: "string",
    },
    NonEmptyString: {
      input: "@/modules/scalar/mod.js#NonEmptyString",
      output: "string",
    },
  },
  useTypeImports: true,
};

const typescriptResolvers: TypeScriptResolversPluginConfig = {
  useIndexSignature: true,
  contextType: "@/modules/common/resolvers.js#Context",
  mapperTypeSuffix: "Mapper",
  mappers: {
    Node: "@/modules/node/common/resolver.js#Node",
    Todo: "@/modules/todo/common/resolver.js#Todo",
    User: "@/modules/user/common/resolver.js#User",
  },
  resolversNonOptionalTypename: {
    unionMember: true,
  },
};

const typescriptOperations: TypeScriptDocumentsPluginConfig = {
  onlyOperationTypes: true,
  scalars: {
    ID: "string",
    DateTime: {
      input: "string",
      output: "Date",
    },
    EmailAddress: "string",
    NonEmptyString: "string",
  },
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
    "tests/modules/schema.ts": {
      documents: "tests/modules/**/*.ts",
      plugins: ["typescript", "typescript-operations"],
      config: {
        ...typescript,
        ...typescriptOperations,
      },
    },
  },
  emitLegacyCommonJSImports: false,
};

export default config;
