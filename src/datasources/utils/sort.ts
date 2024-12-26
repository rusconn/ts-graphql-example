export const sort = <Key extends string | number | bigint, Value>(
  keys: readonly Key[],
  values: readonly Value[],
  toKey: (value: Value) => Key,
) => {
  const kv = new Map(values.map((value) => [toKey(value), value]));
  return keys.map((key) => kv.get(key));
};
