import process from "node:process";

import { App } from "uWebSockets.js";

import { endpoint, port } from "./config.ts";
import { client } from "./db/client.ts";
import { logger } from "./logger.ts";
import { yoga } from "./yoga.ts";

const server = App().any("/*", yoga);

server.listen(port, () => {
  console.info(`Server is running on ${endpoint}`);
});

const shutdown = async () => {
  server.close();
  await client.destroy();
  logger.flush();
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
