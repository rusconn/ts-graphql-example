# ts-graphql-example

TypeScript を使って GraphQL API を作る。

Twitter ライクな SNS アプリの Public API を想定して作る。\
設計や実装のノウハウを手に入れることが目的なので、アプリのシップはしない。

## 事前準備

```shell
cp .env.example .env
docker compose up -d
pnpm install                        # requires global pnpm >= 10
node --run migrate -- reset --force # requires global Node.js
```

Node.js は [package.json](./package.json) の engines を満たすバージョンを自前で用意する。\
pnpm は v10 以上を自前で用意し、[package.json](./package.json) の packageManager を自動参照させる。

## 起動方法

```shell
node --run dev
```

クエリの実行は [Web コンソール](http://localhost:4000/graphql) で。\
token を Authorization ヘッダへ Bearer でセットしておくこと。\
token は [seed スクリプト](./prisma/seed.ts) から取得する。

## DB へのログイン方法

```shell
docker compose exec db bash -c "psql -U postgres postgres"
```

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

時系列の値を求める理由は B+Tree インデックスのキャッシュヒット率を上げるため。\
参考: [MySQL でプライマリキーを UUID にする前に知っておいて欲しいこと](https://techblog.raccoon.ne.jp/archives/1627262796.html)\
PostgreSQL のインデックスはクラスター化されていないが、B+Tree を扱う以上同じような問題は避けられないと考えた。

### createdAt の代用としての ID

DB には createdAt を用意していない。代わりに ID に含まれるタイムスタンプを利用する。\
データサイズ、インデックスサイズ、データ転送量の削減が目的。

## 各技術への理解と所感

### GraphQL

API へ柔軟性をもたらす技術。\
柔軟性と引き換えにクエリのバッチ化やセキュリティ対策、新しい観点での設計能力が要求される。\
Public API でこそ真価を発揮すると思うのだが、[あるエキスパートは Public API には使わないと言っている](https://magiroux.com/eight-years-of-graphql)。\
Private API の場合は Persisted Queries オンリーにすることでいくらか実装の負担を軽減できる。\
ただ、ユースケースが判明しているのなら RPC スタイルで十分な気もする。当然柔軟性は失われるのだが…。

### Prisma

データソースを扱うツール。\
Language-agnostic にスキーマを定義し、宣言的にマイグレーション出来る。\
TS であればスキーマ定義をもとに型付きのクライアントを生成出来る。\
別の言語向けに生成するサードパーティーライブラリもあるよう。

今回は下記理由によりクライアントの使用を避けた。

- SQL が汚い
- バッチ化の効率が悪い
- ライブラリのサイズが大きいのでデプロイ環境を選ぶ
- マルチに使える分 API がややわかりにくい

特にバッチ化の効率が悪いのは致命的で、

```graphql
{
  foos(first: 10) {
    nodes {
      bars(first: 20) {
        nodes {
          id
        }
      }
    }
  }
}
```

上記クエリを N+1 を回避しつつ解決する場合は `prisma.foo.findUnique({ where: { id: fooId } }).bars({ limit: 20 })` のように FluentAPI を利用することになるが、その場合各 foo の **すべての** bar を読み込んでオンメモリで件数を絞り込むよう。bar の件数が多い場合、著しいオーバーヘッドが発生する。バージョン `5.4.2` 時点での話で、今でも同様かどうかは不明。
