import process from "node:process";

import { port } from "./config.ts";
import { logger } from "./logger.ts";
import { prisma } from "./prisma/mod.ts";
import { server } from "./server.ts";

server.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}/graphql`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  logger.flush();
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", shutdown);
}
