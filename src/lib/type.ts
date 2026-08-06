import type { TaggedUnion } from "type-fest";

export type DiscriminatedUnion<
  Fields extends Record<string, Record<string, unknown>>,
  Key extends string = "type",
> = TaggedUnion<Key, Fields>;
