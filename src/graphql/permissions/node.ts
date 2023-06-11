import { isAuthenticated } from "@/graphql/utils";

export default {
  Query: {
    node: isAuthenticated,
  },
};
