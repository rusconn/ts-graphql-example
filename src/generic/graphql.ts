// より正確そうな方法があるがクエリのパースが必要になる
// https://github.com/justinlevi/typorm-issue/blob/eb92b31a581f963707abdea26c49c9893fdb9a86/src/plugins/apolloServerRequestLogger.ts#L6
export const isIntrospectionQuery = (query: string) => {
  return query.includes("__schema") || query.includes("__type");
};
