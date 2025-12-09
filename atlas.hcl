env "env" {
  src = "file://./db/schema.sql"
  url = getenv("DATABASE_URL")
  dev = getenv("ATLAS_DEV_URL")
}
