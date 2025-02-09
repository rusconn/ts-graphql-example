import type { GraphQLResolveInfo } from "graphql";
import getFieldNames from "graphql-list-fields";

export const columnsUnchecked =
  <Field extends string, Column>(map: Record<Field, Column | null>) =>
  (info: GraphQLResolveInfo) => {
    const fields = getFieldNames(info, 1) as Field[];
    return columns(fields, map);
  };

// FIXME: edges.cursor への対応。SomeNode.cursor と edges.cursor を混同してはいけない。
// cursorColumns が中間テーブルにある可能性も考慮する必要がありそう？
export const connectionColumnsUnchecked =
  <Field extends string, Column>(map: Record<Field, Column | null>, cursorColumns: Column[]) =>
  (info: GraphQLResolveInfo) => {
    const allFields = getFieldNames(info, 3);
    const fields = allFields
      .filter((field) => field !== "totalCount" && !field.startsWith("pageInfo."))
      .map((field) =>
        field
          .replace("edges.", "")
          .replace("node.", "")
          .replace("nodes.", "")
          .replace(".edges", "")
          .replace(".nodes", ""),
      ) as Field[];
    return columns(fields, map);
  };

const columns = <Field extends string, Column>(
  fields: Field[],
  map: Record<Field, Column | null>,
) => {
  const columns = fields.map((field) => map[field]).filter((column) => column != null);
  return new Set(columns);
};
