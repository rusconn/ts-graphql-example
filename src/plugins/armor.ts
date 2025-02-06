import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";

import { MAX_COST, MAX_DEPTH } from "../config.ts";

export const armor = EnvelopArmorPlugin({
  costLimit: { maxCost: MAX_COST },
  maxDepth: { n: MAX_DEPTH },
});
