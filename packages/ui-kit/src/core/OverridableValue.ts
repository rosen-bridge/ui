export type OverridableValue<Base, Overrides> =
  | Exclude<
    Base,
    { [K in keyof Overrides]: Overrides[K] extends false ? K : never }[keyof Overrides]
  >
  | { [K in keyof Overrides]: Overrides[K] extends true ? K : never }[keyof Overrides];
