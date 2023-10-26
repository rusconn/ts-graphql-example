import { isAuthenticated } from "../common/authorizers";

export const authorizers = {
  Query: {
    node: isAuthenticated,
  },
};
