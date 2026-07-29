# ts-graphql-example

TypeScriptによるGraphQL APIの実装例。学習用です。

## 必要なツール

- [mise](https://mise.jdx.dev/)
  - pnpm
  - Node.js
- [pgschema](https://www.pgschema.com/)
- Docker

mise管理のツールは自動でインストールされる。

## 初回セットアップ

```sh
mise run setup
```

## devサーバー起動

```sh
mise run dev
```

クエリの実行は[Webコンソール](http://localhost:4000/graphql)で。\
アクセストークンをAuthorizationヘッダへBearerでセットしておくこと。\
アクセストークンはWebコンソールでloginミューテーションを実行して手に入れる。\
ログインに必要な情報は[seedスクリプト](./db/seed.minimal.ts)から取得する。
