import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";

import { maxCost, maxDepth } from "../config/armor.ts";

export const armor = EnvelopArmorPlugin({
  costLimit: { maxCost },
  maxDepth: { n: maxDepth },
});
