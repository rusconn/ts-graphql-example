CREATE DOMAIN uuidv7 AS uuid
CHECK (value IS NULL OR uuid_extract_version(value) = 7);

CREATE TYPE todo_status AS ENUM ('done', 'pending');

CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TABLE users (
  id uuidv7 PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  role user_role NOT NULL,
  created_at timestamptz (3) NOT NULL,
  updated_at timestamptz (3) NOT NULL
);

CREATE INDEX ON users (created_at, id);

CREATE INDEX ON users (updated_at, id);

CREATE TABLE credentials (
  user_id uuidv7 PRIMARY KEY REFERENCES users ON UPDATE RESTRICT ON DELETE CASCADE,
  password varchar(60) NOT NULL
);

CREATE TABLE refresh_tokens (
  token varchar(60) PRIMARY KEY,
  user_id uuidv7 NOT NULL REFERENCES users ON UPDATE RESTRICT ON DELETE RESTRICT,
  expires_at timestamptz (3) NOT NULL,
  created_at timestamptz (3) NOT NULL
);

CREATE INDEX ON refresh_tokens (user_id, created_at);

CREATE TABLE todos (
  id uuidv7 PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  status todo_status NOT NULL,
  user_id uuidv7 NOT NULL REFERENCES users ON UPDATE RESTRICT ON DELETE RESTRICT,
  created_at timestamptz (3) NOT NULL,
  updated_at timestamptz (3) NOT NULL
);

CREATE INDEX ON todos (user_id, created_at, id);

CREATE INDEX ON todos (user_id, updated_at, id);

-- 過剰かもしれないが、学習のため
CREATE INDEX todos_title_bigm ON todos
USING gin (LOWER(title) gin_bigm_ops);

-- 過剰かもしれないが、学習のため
CREATE INDEX todos_description_bigm ON todos
USING gin (LOWER(description) gin_bigm_ops);
