import { parseEnvVars, makePrismaClient, makeServer } from "@/utils";

const envs = parseEnvVars(process.env);
const isDev = envs.nodeEnv === "development";
const prisma = makePrismaClient(isDev);
const server = makeServer({ ...envs, prisma });

server
  .listen()
  .then(({ url }) => console.log(`🚀  Server ready at ${url}`))
  .catch(console.error);
