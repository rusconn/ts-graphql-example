CREATE TYPE "TodoStatus" AS ENUM ('DONE', 'PENDING');

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

CREATE TABLE "User" (
  id uuid PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  role "UserRole" NOT NULL,
  "updatedAt" timestamptz (3) NOT NULL
);

CREATE INDEX ON "User" ("updatedAt", id);

CREATE TABLE "Todo" (
  id uuid PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  status "TodoStatus" NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User" ON UPDATE CASCADE ON DELETE CASCADE,
  "updatedAt" timestamptz (3) NOT NULL
);

CREATE INDEX ON "Todo" ("userId", id);

CREATE INDEX ON "Todo" ("userId", "updatedAt", id);

CREATE TABLE "UserCredential" (
  "userId" uuid PRIMARY KEY REFERENCES "User" ON UPDATE CASCADE ON DELETE CASCADE,
  password char(60) NOT NULL,
  "updatedAt" timestamptz (3) NOT NULL
);

CREATE TABLE "UserToken" (
  "userId" uuid PRIMARY KEY REFERENCES "User" ON UPDATE CASCADE ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  "updatedAt" timestamptz (3) NOT NULL
);
