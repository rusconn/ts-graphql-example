import * as RateLimit from "../../src/config/rate-limit.ts";
import { ErrorCode } from "../../src/presentation/graphql/schema/_types.ts";
import type { CostExtensions } from "../../src/presentation/graphql/yoga/plugins/rate-limit/helpers.ts";
import { graphql } from "./_shared/gql.ts";
import { SingleDeviceSignupDocument } from "./_shared/graphql.ts";
import { executeSingleResultOperation } from "./_shared/server.ts";

const signup = executeSingleResultOperation(SingleDeviceSignupDocument);

const viewer = executeSingleResultOperation(
  graphql(/* GraphQL */ `
    query RateLimitViewer {
      viewer {
        __typename
        id
        name
        email
        createdAt
        updatedAt
        todos(first: 50) {
          totalCount
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
          nodes {
            id
            title
            description
            status
            createdAt
            updatedAt
          }
        }
      }
    }
  `),
);

test("rate limit", async () => {
  const email = `rate-limit-${crypto.randomUUID()}@example.com`;

  let token;
  {
    const { data } = await signup({
      variables: { name: "rate-limit", email, password: "password" },
    });
    assert(
      data?.signup?.__typename === "SignupSuccess", //
      data?.signup?.__typename ?? "no __typename",
    );
    token = data.signup.token;
  }

  {
    const { status, data, extensions } = await viewer({ token });
    expect(status).toBe(200);
    assert(
      data?.viewer?.__typename === "User", //
      data?.viewer?.__typename ?? "no __typename",
    );
    const firstCost = extensions?.cost as CostExtensions | undefined;
    assert(firstCost != null, "no extensions.cost");
    expect(firstCost.requestedQueryCost).toBeGreaterThan(0);
    expect(firstCost.throttleStatus.maximumAvailable).toBe(RateLimit.capacity);
    expect(firstCost.throttleStatus.currentlyAvailable).toBeGreaterThan(0);
    expect(firstCost.throttleStatus.restoreRate).toBe(RateLimit.refillPerSecond);
  }

  for (let i = 0; i < 100; i++) {
    const { status, headers, errors, extensions } = await viewer({ token });

    if (status === 429) {
      assert(
        errors?.[0]?.extensions?.code === ErrorCode.RateLimited,
        (errors?.[0]?.extensions?.code as string | undefined) ?? "no code",
      );
      expect(headers.get("Retry-After")).toBeDefined();

      const cost = extensions?.cost as CostExtensions | undefined;
      assert(cost != null, "no extensions.cost");
      expect(cost.throttleStatus.maximumAvailable).toBe(RateLimit.capacity);
      expect(cost.throttleStatus.restoreRate).toBe(RateLimit.refillPerSecond);
      expect(cost.throttleStatus.currentlyAvailable).toBeLessThan(cost.requestedQueryCost);
      return;
    }
  }

  throw new Error("rate limit not triggered");
});
