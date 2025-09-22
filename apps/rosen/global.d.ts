type IconKeys = Exclude<keyof typeof import('@rosen-bridge/icons'), `${string}Raw`>;

type KebabCase<S extends string> = S extends `${infer T}${infer U}` ? U extends Uncapitalize<U> ? `${Lowercase<T>}${KebabCase<U>}` : `${Lowercase<T>}-${KebabCase<U>}` : S;

type IconOverrides = {
  [K in IconKeys as KebabCase<string & K>]: true;
};

declare module '@rosen-bridge/ui-kit' {
  interface MyComponentProp3Overrides extends IconOverrides {
    value1: false;
    value2: false;
  }
}

export {};
