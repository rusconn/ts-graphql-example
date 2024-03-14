export const randInt = (minInclusive: number, maxInclusive: number) => {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1) + minInclusive);
};
