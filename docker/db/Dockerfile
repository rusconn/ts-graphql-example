FROM postgres:18.2-alpine3.23

RUN apk add --no-cache --virtual .build-deps \
    build-base \
    git \
    postgresql-dev \
    clang19 \
    llvm19 \
  && git clone --depth 1 https://github.com/pgbigm/pg_bigm.git /tmp/pg_bigm \
  && cd /tmp/pg_bigm \
  && make USE_PGXS=1 \
  && make USE_PGXS=1 install \
  && rm -rf /tmp/pg_bigm \
  && apk del .build-deps
