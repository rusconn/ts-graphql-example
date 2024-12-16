# ts-graphql-example

TypeScript を使って GraphQL API を作る。

とりあえず簡単な Todo アプリのバックエンドを想定して作る。\
アプリのシップではなく、設計や実装のノウハウを手に入れることが目的。

## 事前準備

```shell
cp .env.example .env
docker compose up -d
corepack enable
pnpm install
node --run migrate -- reset --force
```

## 起動方法

```shell
node --run dev
```

クエリの実行は [Web コンソール](http://localhost:4000/graphql) で。\
token を Authorization ヘッダへ Bearer でセットしておくこと。\
token は [seed スクリプト](./prisma/seed.ts) から取得する。

## 設計記録

### フィールドの nullability

データの部分的な取得をサポートする為、基本的に nullable とした。\
取得できなかったフィールドに対するフォールバックはクライアントが決める。

- クライアントが部分取得を求めていないことがわかっている
- フィールドの欠けたデータが意味を成さない

等の場合は non-nullable としてもよい。

### API サーバー ⇄ DB 間におけるオーバーフェッチ

resolveInfo の解析により DB からの取得列を絞れそうだが、コードの複雑化に対する恩恵が小さいと判断し、許容することにした。

### node interface と ID フォーマット

[Relay の GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification/) を満たすため、node interface を用意した。

node リゾルバで後続のリゾルバを決定する必要があるため、ID へタイプを表すプレフィックスを付加することにした。

### DB の ID フォーマット

UUIDv4, UUIDv7, ULID, Cuid2, Nano ID, 連番が候補に挙がったが、

- 時系列の値であること
- 分散環境での衝突耐性があること
- 安定運用の実績があること
- 標準的であること

を重視し、UUIDv7 を採用した。

時系列の値を求める理由は btree インデックスのキャッシュヒット率を上げるため。\
参考: [MySQL でプライマリキーを UUID にする前に知っておいて欲しいこと](https://techblog.raccoon.ne.jp/archives/1627262796.html)\
PostgreSQL でも同様と考えた。

### createdAt の代用としての ID

DB には createdAt を用意していない。代わりに ID に含まれるタイムスタンプを利用する。\
データサイズ、インデックスサイズ、データ転送量の削減が目的。

## 各技術への理解と所感

### GraphQL

いくらかのパフォーマンスと引き換えに、API へ柔軟性をもたらす技術という認識。\
スキーマ設計やリゾルバの実装、周辺ツールの利用などなにかと習熟が必要だが、それに見合う価値はあると思う。

ところで nullable という概念に optional と null の意味が混在しているのは扱いにくいと思う。

### Prisma

データソースを扱うツール。\
Language agnostic にスキーマを定義し、マイグレーション出来る。\
TS であればスキーマ定義をもとに型付きのクライアントを生成出来る。\
別の言語向けに生成するサードパーティーライブラリもあるよう。

今回は下記理由によりクライアントの使用を避けた。

- SQL が汚い
- バッチ化の自由度が低い
- ライブラリのサイズが大きいのでデプロイ環境を選ぶ
- マルチに使える分 API がややわかりにくい

特にバッチ化の自由度が低いのは致命的で、

```graphql
{
  users(first: 30) {
    nodes {
      todos(first: 50) {
        nodes {
          id
        }
      }
    }
  }
}
```

上記クエリを N+1 を回避しつつ解決する場合は FluentAPI を利用することになるが、その場合各 User の **すべての** Todo を読み込んでオンメモリで件数を絞り込むよう。各 User の Todo の件数が大きい場合、著しいオーバーヘッドが発生する。効率的に読み込むには、各 User の Todo を first 件数分だけ取得する SELECT 文を UNION によって結合する必要がある。

今回は DB クライアントに kysely を使ったが、集合演算の設計がおかしく意図した結果が得られないようなので @prisma/client と状況は変わらない。残念です…。
