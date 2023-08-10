export type Newtype<Brand extends string, T> = T & {
  readonly __brand: Brand;
};
