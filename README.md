# ts-graphql-example

TypeScriptによるGraphQL APIの実装例。学習用です。

## セットアップ

```sh
cp .env.example .env
pnpm install                # requires global pnpm >= 11
docker compose up --wait
node --run migrate -- apply # requires global Node.js and Atlas(https://atlasgo.io/)
node --run seed
```

Node.jsは[package.json](./package.json)のenginesを満たすバージョンを自前で用意する。\
pnpmはv11以上を自前で用意し、[package.json](./package.json)のdevEngines.packageManagerを自動参照させる。

## devサーバー起動

```sh
node --run dev
```

クエリの実行は [Webコンソール](http://localhost:4000/graphql)で。\
アクセストークンをAuthorizationヘッダへBearerでセットしておくこと。\
アクセストークンはWebコンソールでloginミューテーションを実行して手に入れる。\
ログインに必要な情報は [seedスクリプト](./db/seed.ts)から取得する。
