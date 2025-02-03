export const sortGroup = <Key extends string | number | bigint, Value>(
  keys: readonly Key[],
  values: readonly Value[],
  toKey: (value: Value) => Key,
) => {
  const kv = Map.groupBy(values, (value) => toKey(value));
  return keys.map((key) => kv.get(key) ?? []);
};
