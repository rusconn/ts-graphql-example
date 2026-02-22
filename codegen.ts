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
    DateTimeISO: "Date",
    EmailAddress: "./EmailAddress.ts#EmailAddress",
    Void: "void",
  },
  useTypeImports: true,
};

const typescriptResolvers: TypeScriptResolversPluginConfig = {
  makeResolverTypeCallable: true,
  optionalInfoArgument: true,
  resolverTypeWrapperSignature: "T",
  useIndexSignature: true,
  contextType: "../yoga/context.ts#Context",
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
    DateTimeISO: {
      input: "string",
      output: "string",
    },
    EmailAddress: "string",
    Void: "void",
  },
  skipTypename: true,
};

const config: CodegenConfig = {
  schema: "schema.graphql",
  generates: {
    "e2e/graphql/_shared/types.ts": {
      documents: "e2e/graphql/**/*.ts",
      plugins: ["typescript", "typescript-operations"],
      config: {
        ...typescript,
        ...typescriptOperations,
      },
    },
    "src/presentation/graphql/schema/_types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        ...typescript,
        ...typescriptResolvers,
      },
    },
  },
  emitLegacyCommonJSImports: false,
};

export default config;
