import type { CodegenConfig } from "@graphql-codegen/cli";
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript";
import type { TypeScriptDocumentsPluginConfig } from "@graphql-codegen/typescript-operations";
import type { TypeScriptResolversPluginConfig } from "@graphql-codegen/typescript-resolvers";

const typescript: TypeScriptPluginConfig = {
  avoidOptionals: {
    defaultValue: true,
  },
  scalars: {
    ID: {
      input: "string",
      output: "./modules/scalar/_mod.ts#ID",
    },
    DateTime: {
      input: "./modules/scalar/_mod.ts#DateTime",
      output: "Date | DateTime", // DateTime リゾルバーが Date -> DateTime する
    },
    EmailAddress: {
      input: "./modules/scalar/_mod.ts#EmailAddress",
      output: "string",
    },
    NonEmptyString: {
      input: "./modules/scalar/_mod.ts#NonEmptyString",
      output: "string",
    },
  },
  useTypeImports: true,
};

const typescriptResolvers: TypeScriptResolversPluginConfig = {
  useIndexSignature: true,
  contextType: "./context.ts#Context",
  optionalInfoArgument: true,
  mapperTypeSuffix: "Mapper",
  mappers: {
    Node: "./modules/node/Node/_mapper.ts#Node",
    Todo: "./modules/todo/Todo/_mapper.ts#Todo",
    User: "./modules/user/User/_mapper.ts#User",
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
    "src/schema.ts": {
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
