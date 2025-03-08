import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";

import { maxDepth } from "../config/security.ts";

export const armor = EnvelopArmorPlugin({
  maxDepth: {
    n: maxDepth,
    flattenFragments: true,
  },
  costLimit: {
    enabled: false, // complexity plugin で対応する
  },
});
