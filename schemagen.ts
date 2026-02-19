/**
 * クライアントにカスタムディレクティブ付きの SDL ファイルを共有するために用意した
 * イントロスペクションではメタ情報は欠落してしまう
 * @see https://github.com/graphql/graphql-spec/issues/300
 */

import fs from "node:fs";

import { printSchemaWithDirectives } from "@graphql-tools/utils";

import { yoga } from "./src/presentation/graphql/yoga.ts";

const { schema } = yoga.getEnveloped();
const sdl = printSchemaWithDirectives(schema);

fs.writeFileSync("./schema.graphql", sdl, "utf-8");
