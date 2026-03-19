/* eslint-disable */

type Listed<T> = T extends string | number
  ? T extends `${infer _}` | number
    ? T
    : never
  : never;

type Unlisted<T> = Exclude<T, Listed<T>>;

export type OverridableValue<Base, Overrides = unknown> =
  | {
      [K in keyof Overrides]: Overrides[K] extends true ? K : never;
    }[keyof Overrides]
  | Exclude<
      Listed<Base>,
      keyof {
        [K in keyof Overrides as Overrides[K] extends false ? K : never]: any;
      }
    >
  | (Overrides extends { UNLISTED: false } ? never : Unlisted<Base>);
