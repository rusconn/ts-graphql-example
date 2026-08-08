import { createServer } from "node:http";
import process from "node:process";

import { maxBodyBytes, requestTimeoutMs } from "../config/http-security.ts";
import { endpoint, port } from "../config/url.ts";
import { kysely } from "../infrastructure/datasources/db/client.ts";
import { disconnectValkey } from "../infrastructure/datasources/valkey/client.ts";
import { pino } from "../infrastructure/loggers/pino.ts";
import { yoga } from "./graphql/yoga.ts";
import { createBodyLimitHandler } from "./http/request-body-limit.ts";

const server = createServer(
  createBodyLimitHandler({
    maxBodyBytes,
    requestTimeoutMs,
    requestListener: yoga.requestListener,
  }),
);
server.headersTimeout = 10_000;
server.requestTimeout = 10_000;

server.listen(port, () => {
  console.info(`Server is running on ${endpoint}`);
});

const shutdown = (signal: string) => async () => {
  console.log(`Shutdown started by ${signal}`);
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await yoga.dispose();
  await kysely.destroy();
  await disconnectValkey();
  pino.flush();
  console.log("Shutdown completed");
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));
