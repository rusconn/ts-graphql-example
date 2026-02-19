import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";

import { isProd } from "../../../../config/exec-env.ts";

export const introspection = useDisableIntrospection({
  isDisabled: () => isProd,
});
