import type { OverrideProperties } from "type-fest";

import * as Domain from "../../../../domain/entities.ts";
import type * as Graph from "../../../../graphql/_schema.ts";
import { userId } from "../../../../graphql/User/id.ts";
import { domain } from "../domain/users.ts";
import { type DateTime, dateTime } from "./_shared.ts";

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
