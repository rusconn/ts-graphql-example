export const colsSep = "|";

export const junctionCursor = (...cols: unknown[]) => {
  return cols.join(colsSep);
};
