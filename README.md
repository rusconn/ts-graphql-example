# ts-graphql-example

TypeScriptによるGraphQL APIの実装例。学習用です。

## 必要なツール

- pnpm
- Node.js
- [pgschema](https://www.pgschema.com/)
- Docker

pnpmとNode.jsは[package.json](./package.json)のdevEnginesを満たすバージョンが必要。

## セットアップ

```sh
cp .env.example .env
pnpm install
docker compose up --wait
node --run db:schema -- apply --file db/schema.sql --auto-approve
node --run seed
```

## devサーバー起動

```sh
node --run dev
```

クエリの実行は[Webコンソール](http://localhost:4000/graphql)で。\
アクセストークンをAuthorizationヘッダへBearerでセットしておくこと。\
アクセストークンはWebコンソールでloginミューテーションを実行して手に入れる。\
ログインに必要な情報は[seedスクリプト](./db/seed.ts)から取得する。
