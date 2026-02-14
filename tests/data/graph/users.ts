import type { OverrideProperties } from "type-fest";

import * as Domain from "../../../src/domain/entities.ts";
import type * as Graph from "../../../src/graphql/_schema.ts";
import { userId } from "../../../src/graphql/User/id.ts";
import { dateTime, type DateTime } from "./_shared.ts";
import { domain } from "../domain/users.ts";

type GraphUser = OverrideProperties<
  Required<
    Pick<
      Graph.User,
      | "__typename" //
      | "id"
      | "name"
      | "email"
      | "createdAt"
      | "updatedAt"
    >
  >,
  {
    createdAt: DateTime;
    updatedAt: DateTime;
  }
>;

const node = (user: Domain.User.Type): GraphUser => {
  return {
    __typename: "User",
    id: userId(user.id),
    name: user.name,
    email: user.email,
    createdAt: dateTime(user.createdAt),
    updatedAt: dateTime(user.updatedAt),
  };
};

export const graph = {
  admin: node(domain.admin),
  alice: node(domain.alice),
};

export const dummyId = () => {
  return userId(Domain.User.Id.create());
};
