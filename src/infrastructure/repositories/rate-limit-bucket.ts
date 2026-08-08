import { Script, type GlideReturnType } from "@valkey/valkey-glide";

import { getValkey } from "../datasources/valkey/client.ts";

// KEYS[1]: バケットキー
// ARGV[1]: cost
// ARGV[2]: capacity
// ARGV[3]: refillPerSecond
// ARGV[4]: ttlSeconds
const consumeScript = new Script(`
  local t = redis.call("TIME")
  local now = tonumber(t[1]) + tonumber(t[2]) / 1e6
  local cost = tonumber(ARGV[1])
  local capacity = tonumber(ARGV[2])
  local refillPerSecond = tonumber(ARGV[3])
  local ttl = tonumber(ARGV[4])

  local data = redis.call("HMGET", KEYS[1], "tokens", "updatedAt")
  local tokens = tonumber(data[1]) or capacity
  local updatedAt = tonumber(data[2]) or now
  local available = math.min(capacity, tokens + math.max(0, now - updatedAt) * refillPerSecond)

  if available >= cost then
    redis.call("HSET", KEYS[1], "tokens", available - cost, "updatedAt", now)
    redis.call("EXPIRE", KEYS[1], ttl)
    return { 1, available - cost, 0 }
  end

  redis.call("EXPIRE", KEYS[1], ttl)
  local retryAfterSeconds = math.ceil((cost - available) / refillPerSecond)
  return { 0, available, retryAfterSeconds }
`);

export class RateLimitBucketRepo {
  async consume(input: {
    subject: string;
    cost: number;
    capacity: number;
    refillPerSecond: number;
    ttlSeconds: number;
  }): Promise<RateLimitScriptResult> {
    const { subject, cost, capacity, refillPerSecond, ttlSeconds } = input;

    const client = await getValkey();
    const result = await client.invokeScript(consumeScript, {
      keys: [`rate_limit:${subject}`],
      args: [String(cost), String(capacity), String(refillPerSecond), String(ttlSeconds)],
    });

    return parseRateLimitScriptResult(result);
  }
}

type RateLimitScriptResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function parseRateLimitScriptResult(result: GlideReturnType): RateLimitScriptResult {
  if (!Array.isArray(result) || result.length !== 3) {
    throw new Error("unexpected rate limit script result");
  }

  const [ok, remaining, retryAfterSeconds] = result;
  return {
    ok: Number(ok) === 1,
    remaining: Number(remaining),
    retryAfterSeconds: Number(retryAfterSeconds),
  };
}

if (import.meta.vitest) {
  describe("parseRateLimitScriptResult", () => {
    it("parses an approved consumption", () => {
      expect(parseRateLimitScriptResult([1, 7, 0])).toEqual({
        ok: true,
        remaining: 7,
        retryAfterSeconds: 0,
      });
    });

    it("parses a rejected consumption whose remaining is a fractional string", () => {
      expect(parseRateLimitScriptResult([0, "2.5", 2])).toEqual({
        ok: false,
        remaining: 2.5,
        retryAfterSeconds: 2,
      });
    });

    it("throws when the result is not a 3-element array", () => {
      expect(() => parseRateLimitScriptResult([1, 2])).toThrow();
      expect(() => parseRateLimitScriptResult("unexpected")).toThrow();
      expect(() => parseRateLimitScriptResult(null)).toThrow();
    });
  });
}
