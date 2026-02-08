env "env" {
  src = "file://./db/schema.sql"
  url = getenv("DATABASE_URL")
  dev = "docker://postgres/17.4-alpine3.21/dev"
}
