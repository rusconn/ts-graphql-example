CREATE TYPE todo_status AS ENUM ('done', 'pending');

CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TABLE users (
  id uuid PRIMARY KEY,
  name varchar(100) NOT NULL,
  email varchar(100) NOT NULL UNIQUE,
  role user_role NOT NULL,
  updated_at timestamptz (3) NOT NULL
);

CREATE INDEX ON users (updated_at, id);

CREATE TABLE todos (
  id uuid PRIMARY KEY,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  status todo_status NOT NULL,
  user_id uuid NOT NULL REFERENCES users ON UPDATE CASCADE ON DELETE CASCADE,
  updated_at timestamptz (3) NOT NULL
);

CREATE INDEX ON todos (user_id, id);

CREATE INDEX ON todos (user_id, updated_at, id);

CREATE TABLE user_credentials (
  user_id uuid PRIMARY KEY REFERENCES users ON UPDATE CASCADE ON DELETE CASCADE,
  password varchar(60) NOT NULL
);

CREATE TABLE user_tokens (
  user_id uuid PRIMARY KEY REFERENCES users ON UPDATE CASCADE ON DELETE CASCADE,
  token varchar(60) UNIQUE NOT NULL
);
