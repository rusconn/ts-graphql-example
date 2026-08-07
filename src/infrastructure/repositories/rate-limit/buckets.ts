import type { ExpressionBuilder, Kysely } from "kysely";

import type { DB } from "../../datasources/db/types.ts";

type ConsumeResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export class RateLimitBucketRepo {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  async consume(input: {
    subject: string;
    cost: number;
    capacity: number;
    refillPerSecond: number;
  }): Promise<ConsumeResult> {
    const { subject, cost, capacity, refillPerSecond } = input;

    // 承認される場合のみcostを引く
    const updated = await this.#db
      .updateTable("rateLimitBuckets")
      .set((eb) => {
        const available = refilled(eb, refillPerSecond, capacity);
        return {
          tokens: eb
            .case()
            .when(eb(available, ">=", eb.val(cost)))
            .then(eb(available, "-", eb.val(cost)))
            .else(available)
            .end(),
          updatedAt: eb.fn("clock_timestamp", []),
        };
      })
      .where("subject", "=", subject)
      .where((eb) => eb(refilled(eb, refillPerSecond, capacity), ">=", eb.val(cost)))
      .returning("tokens")
      .executeTakeFirst();

    if (updated != null) {
      return { ok: true, remaining: updated.tokens, retryAfterSeconds: 0 };
    }

    // 行がまだ無い場合のみINSERT
    const inserted = await this.#db
      .insertInto("rateLimitBuckets")
      .values((eb) => ({
        subject,
        tokens: capacity - cost,
        createdAt: eb.fn("clock_timestamp", []),
        updatedAt: eb.fn("clock_timestamp", []),
      }))
      .onConflict((oc) => oc.column("subject").doNothing())
      .returning("tokens")
      .executeTakeFirst();

    if (inserted != null) {
      return { ok: true, remaining: inserted.tokens, retryAfterSeconds: 0 };
    }

    // 行はあるが不足でreject。補充後の残量をDB時計基準で読み取って報告する
    const row = await this.#db
      .selectFrom("rateLimitBuckets")
      .select((eb) => refilled(eb, refillPerSecond, capacity).as("available"))
      .where("subject", "=", subject)
      .executeTakeFirstOrThrow();

    const available = row.available;
    const retryAfterSeconds = Math.ceil((cost - available) / refillPerSecond);

    return { ok: false, remaining: available, retryAfterSeconds };
  }
}

// 補充後の利用可能トークン
function refilled(
  eb: ExpressionBuilder<DB, "rateLimitBuckets">,
  refillPerSecond: number,
  capacity: number,
) {
  const elapsedSeconds = eb.fn<number>("date_part", [
    eb.val("epoch"),
    eb(eb.fn("clock_timestamp", []), "-", eb.ref("rateLimitBuckets.updatedAt")),
  ]);
  return eb.fn<number>("LEAST", [
    eb(eb.ref("rateLimitBuckets.tokens"), "+", eb(elapsedSeconds, "*", eb.val(refillPerSecond))),
    eb.val(capacity),
  ]);
}
