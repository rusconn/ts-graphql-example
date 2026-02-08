import type { CodegenConfig } from "@graphql-codegen/cli";
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript";
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations";
import type { TypeScriptResolversPluginConfig } from "@graphql-codegen/typescript-resolvers";

const typescript: TypeScriptPluginConfig = {
  avoidOptionals: {
    defaultValue: true,
    query: true,
    mutation: true,
    subscription: true,
  },
  enumsAsConst: true,
  scalars: {
    ID: {
      input: "string",
      output: "./ID.ts#ID",
    },
    DateTime: {
      input: "./DateTime.ts#DateTime",
      output: "Date | DateTime", // レスポンス時にJSON.stringifyされるのでDateを許容可能
    },
    EmailAddress: {
      input: "./EmailAddress.ts#EmailAddress",
      output: "./EmailAddress.ts#EmailAddress",
    },
  },
  useTypeImports: true,
};

const typescriptResolvers: TypeScriptResolversPluginConfig = {
  useIndexSignature: true,
  contextType: "../server/context.ts#Context",
  mapperTypeSuffix: "Mapper",
  mappers: {
    Node: "./Node/_mapper.ts#Node",
    Todo: "./Todo/_mapper.ts#Todo",
    User: "./User/_mapper.ts#User",
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
      output: "string",
    },
    EmailAddress: "string",
  },
  skipTypename: true,
};

const config: CodegenConfig = {
  schema: "schema.graphql",
  generates: {
    "src/graphql/_schema.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        ...typescript,
        ...typescriptResolvers,
      },
    },
    "tests/graphql/_schema.ts": {
      documents: "tests/graphql/**/*.ts",
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
