export const sort = <Key extends string | number | bigint, Value, Default = undefined>(
  keys: readonly Key[],
  values: readonly Value[],
  toKey: (value: Value) => Key,
  defaultValue?: Default,
) => {
  const kv = new Map(values.map((value) => [toKey(value), value]));
  return keys.map((key) => kv.get(key) ?? defaultValue) as Default extends undefined
    ? (Value | undefined)[]
    : (Value | Default)[];
};
