import { setTimeout as sleep } from "node:timers/promises";

import { getValkey } from "../../datasources/valkey/client.ts";
import { RateLimitBucketRepo } from "./buckets.ts";

const repo = new RateLimitBucketRepo();

beforeEach(async () => {
  const client = await getValkey();
  await client.flushdb();
});

describe("RateLimitBucketRepo", () => {
  it("initializes a full bucket and deducts the cost", async () => {
    const result = await repo.consume({
      subject: "user:1",
      cost: 3,
      capacity: 10,
      refillPerSecond: 1,
      ttlSeconds: 60,
    });

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(7);
  });

  it("rejects when the cost exceeds the remaining tokens", async () => {
    const consume = () =>
      repo.consume({
        subject: "user:2",
        cost: 4,
        capacity: 10,
        refillPerSecond: 1,
        ttlSeconds: 60,
      });

    for (let i = 0; i < 2; i++) {
      const result = await consume();
      expect(result.ok).toBe(true);
    }

    const result = await consume();

    expect(result.ok).toBe(false);
    expect(result.remaining).toBeGreaterThanOrEqual(2);
    expect(result.remaining).toBeLessThan(4);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("does not deduct tokens for rejected requests", async () => {
    const consume = () =>
      repo.consume({
        subject: "user:3",
        cost: 4,
        capacity: 10,
        refillPerSecond: 10,
        ttlSeconds: 60,
      });

    const first = await consume();
    expect(first.ok).toBe(true);
    expect(first.remaining).toBe(6);

    const second = await consume();
    expect(second.ok).toBe(true);
    expect(second.remaining).toBeLessThan(6);

    const rejected = await consume();
    expect(rejected.ok).toBe(false);
    expect(rejected.remaining).toBeGreaterThanOrEqual(second.remaining);
    expect(rejected.remaining).toBeLessThan(4);
  });

  it("refills tokens over time and caps at the capacity", async () => {
    const consume = () =>
      repo.consume({
        subject: "user:4",
        cost: 1,
        capacity: 10,
        refillPerSecond: 1000,
        ttlSeconds: 60,
      });

    const first = await consume();
    expect(first.ok).toBe(true);
    expect(first.remaining).toBe(9);

    await sleep(3);

    const result = await consume();
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("isolates buckets per subject", async () => {
    await repo.consume({
      subject: "user:5",
      cost: 10,
      capacity: 10,
      refillPerSecond: 1,
      ttlSeconds: 60,
    });

    const result = await repo.consume({
      subject: "user:6",
      cost: 10,
      capacity: 10,
      refillPerSecond: 1,
      ttlSeconds: 60,
    });

    expect(result.ok).toBe(true);
  });
});
