import type { ExecutionResult } from "graphql";
import { isAsyncIterable, type Plugin } from "graphql-yoga";

import { isProd } from "../../../../config/exec-env.ts";
import { capacity, refillPerSecond } from "../../../../config/rate-limit.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { RateLimitBucketRepo } from "../../../../infrastructure/repositories/rate-limit/buckets.ts";
import { rateLimitedError } from "../../schema/_errors/global/rate-limited.ts";
import type { Context } from "../context.ts";
import { buildCostExtensions, parseClientIp, type CostExtensions } from "./rate-limit/helpers.ts";

const repo = new RateLimitBucketRepo(kysely);

type ServerContext = {
  rateLimit?: {
    cost: CostExtensions;
    retryAfterSeconds?: number;
  };
};

type UserContext = ServerContext;

export const rateLimit: Plugin<{}, ServerContext, UserContext> = {
  async onExecute({ args, setResultAndStopExecution, extendContext }) {
    const context = args.contextValue as Context;

    if (context.queryComplexity == null) {
      context.logger.error({ message: "queryComplexity not set" }, "plugin-error");
      throw new Error("queryComplexity not set");
    }

    const requestedQueryCost = context.queryComplexity;
    if (requestedQueryCost <= 0) {
      return;
    }

    let subject: string;
    if (context.user != null) {
      subject = `user:${context.user.id}`;
    } else {
      const clientIp = isProd ? parseClientIp(context.request.headers) : "1.2.3.4";
      if (clientIp == null) {
        context.logger.warn({ message: "no client ip address found" }, "rate-limit-warn");
        return;
      }
      // TODO: NATやIPv6の/64グルーピング等を考慮する
      subject = `guest:${clientIp}`;
    }

    let result;
    try {
      result = await repo.consume({
        subject,
        cost: requestedQueryCost,
        capacity,
        refillPerSecond,
      });
    } catch (e) {
      context.logger.error(e, "token-consuming-error");
      return;
    }

    const cost = buildCostExtensions({
      requestedQueryCost,
      capacity,
      currentlyAvailable: result.remaining,
      refillPerSecond,
    });

    extendContext({
      rateLimit: {
        cost,
        ...(result.retryAfterSeconds > 0 && {
          retryAfterSeconds: result.retryAfterSeconds,
        }),
      },
    });

    if (!result.ok) {
      context.logger.warn(
        {
          rateLimit: {
            subject,
            cost: requestedQueryCost,
            currentlyAvailable: result.remaining,
            retryAfterSeconds: result.retryAfterSeconds,
          },
        },
        "rate-limited",
      );
      setResultAndStopExecution({
        errors: [rateLimitedError(cost)],
        extensions: { cost },
      });
      return;
    }

    return {
      onExecuteDone: ({
        result,
        setResult,
      }: {
        result: ExecutionResult | AsyncIterableIterator<ExecutionResult>;
        setResult: (newResult: ExecutionResult | AsyncIterableIterator<ExecutionResult>) => void;
      }) => {
        if (!isAsyncIterable(result)) {
          setResult({ ...result, extensions: { ...result.extensions, cost } });
        }
      },
    };
  },
  onResponse({ response, serverContext }) {
    const retryAfterSeconds = serverContext?.rateLimit?.retryAfterSeconds;
    if (retryAfterSeconds != null) {
      response.headers.set("Retry-After", String(retryAfterSeconds));
    }
  },
};
