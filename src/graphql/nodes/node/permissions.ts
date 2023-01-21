import { isAuthenticated } from "@/graphql/utils";

export const permissions = {
  Query: {
    node: isAuthenticated,
  },
};
