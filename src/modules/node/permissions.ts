import { isAuthenticated } from "../common/permissions";

export default {
  Query: {
    node: isAuthenticated,
  },
};
