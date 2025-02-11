import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";

import { maxCost, maxDepth } from "../config/armor.ts";

export const armor = EnvelopArmorPlugin({
  maxDepth: {
    n: maxDepth,
    flattenFragments: true,
  },
  costLimit: {
    maxCost,
    objectCost: 3,
    scalarCost: 1,
    depthCostFactor: 2,
    flattenFragments: true,
  },
});
