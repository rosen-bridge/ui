type Slots = Record<string, object | undefined>;

/**
 * Merges `slots` from the lowest to the highest priority source, one level deep,
 * so each slot keeps the props given by every source instead of being replaced as a whole
 */
export const mergeSlots = (...sources: (Slots | undefined)[]): Slots | undefined => {
  if (sources.every((source) => !source)) return;

  const result: Slots = {};

  for (const source of sources) {
    if (!source) continue;

    for (const [name, props] of Object.entries(source)) {
      if (!props) continue;

      result[name] = { ...result[name], ...props };
    }
  }

  return result;
};
