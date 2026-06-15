const excludes = ['id']; // , 'insertedAt', 'updatedAt'];

export const compare = <T extends object>(r1: T, r2: T) => {
  for (const exclude of excludes) {
    // @ts-ignore
    delete r1[exclude];
    // @ts-ignore
    delete r2[exclude];
  }
  return JSON.stringify(r1) === JSON.stringify(r2);
};
