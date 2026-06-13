-- dev db(postgres)
CREATE EXTENSION pg_bigm SCHEMA public;

-- plan db
CREATE DATABASE pgschema_plan;
\c pgschema_plan;
CREATE EXTENSION pg_bigm SCHEMA public;

-- test db
CREATE DATABASE test;
\c test;
CREATE EXTENSION pg_bigm SCHEMA public;
