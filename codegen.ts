import type { CodegenConfig } from "@graphql-codegen/cli";
import type { TypeScriptPluginConfig } from "@graphql-codegen/typescript";
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

const config: CodegenConfig = {
  schema: "schema.graphql",
  generates: {
    "e2e/graphql/_shared/": {
      documents: "e2e/graphql/**/*.ts",
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: "string",
        enumsAsConst: true,
        scalars: {
          ID: "string",
          DateTimeISO: "string",
          EmailAddress: "string",
          Void: "void",
        },
        skipTypename: true,
        useTypeImports: true,
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
