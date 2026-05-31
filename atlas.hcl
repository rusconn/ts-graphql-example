env "env" {
  src = "file://./db/schema.sql"
  url = getenv("DATABASE_URL")
  dev = "docker://postgres/18.2-alpine3.23"
}
