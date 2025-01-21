export const colsSep = "|";

export const compositeCursor = (...cols: unknown[]) => {
  return cols.join(colsSep);
};
