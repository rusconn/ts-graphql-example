import process from "node:process";

import { App } from "uWebSockets.js";

import { maxBodyBytes, requestTimeoutMs } from "../config/http-security.ts";
import { endpoint, port } from "../config/url.ts";
import { kysely } from "../infrastructure/datasources/db/client.ts";
import { pino } from "../infrastructure/loggers/pino.ts";
import { yoga } from "./graphql/yoga.ts";
import { createBodyLimitHandler } from "./http/request-body-limit.ts";

const server = App().any(
  "/*",
  createBodyLimitHandler({
    maxBodyBytes,
    requestTimeoutMs,
    fetch: (url, init) => yoga.fetch(url, init, {}),
  }),
);

server.listen(port, () => {
  console.info(`Server is running on ${endpoint}`);
});

const shutdown = (signal: string) => async () => {
  console.log(`Shutdown started by ${signal}`);
  server.close();
  await yoga.dispose();
  await kysely.destroy();
  pino.flush();
  console.log("Shutdown completed");
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));
