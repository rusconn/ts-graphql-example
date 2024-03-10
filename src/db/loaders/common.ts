export const sort = <Id, Key extends { id: Id }, Value extends Key>(
  keys: readonly Key[],
  values: readonly Value[],
) => {
  const kv = new Map(values.map(value => [value.id, value]));

  return keys.map(key => kv.get(key.id));
};
