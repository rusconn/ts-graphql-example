import type { OverrideProperties } from "type-fest";

import * as Domain from "../../../../../../domain/entities.ts";
import { domain } from "../../../../../_shared/test/data/domain/users.ts";
import type * as Graph from "../../../_types.ts";
import { userId } from "../../../User/id.ts";
import { type DateTimeISO, dateTimeISO } from "./_shared.ts";

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
    createdAt: DateTimeISO;
    updatedAt: DateTimeISO;
  }
>;

const node = (user: Domain.User.Type): GraphUser => {
  return {
    __typename: "User",
    id: userId(user.id),
    name: user.name,
    email: user.email,
    createdAt: dateTimeISO(user.createdAt),
    updatedAt: dateTimeISO(user.updatedAt),
  };
};

export const graph = {
  admin: node(domain.admin),
  alice: node(domain.alice),
};

export const dummyId = () => {
  return userId(Domain.User.Id.create());
};
