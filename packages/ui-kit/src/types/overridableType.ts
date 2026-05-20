export type OverridableType<
  BaseProps,
  Overrides,
  Keys extends keyof BaseProps,
> = Omit<BaseProps, Keys> & {
  [K in Keys]: K extends keyof Overrides ? Overrides[K] : BaseProps[K];
};
