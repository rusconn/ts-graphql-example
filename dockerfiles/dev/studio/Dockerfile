# prismaを使いたい
FROM apollo-prisma-test-dev-app:1.0.0

# アプリコンテナの起動を待つのに必要
RUN apt-get update \
  && apt-get install -y wait-for-it \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
