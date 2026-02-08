import process from "node:process";

import { App } from "uWebSockets.js";

import { endpoint, port } from "./config/url.ts";
import { kysely } from "./infra/datasources/db/client.ts";
import { logger } from "./server/logger.ts";
import { yoga } from "./server/yoga.ts";

const server = App().any("/*", yoga);

server.listen(port, () => {
  console.info(`Server is running on ${endpoint}`);
});

const shutdown = async () => {
  server.close();
  await kysely.destroy();
  logger.flush();
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
