import { GlideClient } from "@valkey/valkey-glide";

import { host, port, useTLS } from "../../../config/valkey.ts";

/** Node.js 環境下ではモジュールキャッシュにより singleton */
let clientPromise: Promise<GlideClient> | undefined;

export function getValkey(): Promise<GlideClient> {
  if (clientPromise == null) {
    clientPromise = GlideClient.createClient({
      addresses: [{ host, port }],
      useTLS,
      requestTimeout: 1000,
      advancedConfiguration: {
        connectionTimeout: 1000,
      },
      clientName: "ts-graphql-example",
    });
    // 次回呼び出しで再試行できるようキャッシュを破棄する
    clientPromise.catch(() => {
      clientPromise = undefined;
    });
  }
  return clientPromise;
}

export async function disconnectValkey() {
  if (clientPromise == null) {
    return;
  }
  const client = await clientPromise.catch(() => null);
  client?.close();
  clientPromise = undefined;
}
