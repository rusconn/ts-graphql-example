FROM node:16.16.0-bullseye-slim

# prismaの動作に必要
RUN apt-get update \
  && apt-get install -y openssl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
