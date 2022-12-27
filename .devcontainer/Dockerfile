FROM apollo-prisma-test-dev-app:1.0.0

RUN apt-get update \
  && apt-get install --no-install-recommends -y git ca-certificates fish \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
