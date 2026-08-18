const isCSSColor = (input: string): boolean => {
  const option = new Option();

  option.style.color = input;

  return option.style.color !== '';
};

export const toCSSColor = (input?: string): string | undefined => {
  if (!input) return;

  if (isCSSColor(input)) return input;

  return `var(--rosen-palette-${input})`;
};
