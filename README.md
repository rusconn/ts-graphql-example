# ts-graphql-example

TypeScript を使って GraphQL API を作る。

とりあえず簡単な Todo アプリのバックエンドを想定して作る。\
アプリのシップではなく、設計や実装のノウハウを手に入れることが目的。

## 事前準備

```shell
corepack enable
```

## 起動方法

```shell
cp .env.example .env
docker compose up -d
pnpm run setup && pnpm dev
```

クエリの実行は [Web コンソール](http://localhost:4000/graphql) で。  
token を Authorization ヘッダへ Bearer でセットしておくこと。  
token は [seed スクリプト](./prisma/seed.ts) から取得する。
Prisma Studio は `pnpm studio` で起動しておくこと。

## 設計記録

### フィールドの nullability

データの部分的な取得をサポートする為、基本的に nullable とした。\
取得できなかったフィールドに対するフォールバックはクライアントが決める。

- クライアントが部分取得を求めていないことがわかっている
- フィールドの欠けたデータが意味を成さない

等の場合は non-nullable とする。

### データフェッチ戦略

[GraphQL Resolvers: Best Practices](https://medium.com/paypal-tech/graphql-resolvers-best-practices-cd36fdbcef55) を参考にデザインした。

上記記事における top-heavy なリゾルバは避け、データが本当に必要になるレベルで初めてデータをフェッチする。\
ただし `{ me { id name } }` のような単純なクエリでもデータフェッチが重複するようになるので、dedup が事実上必須となる。

他の戦略としては、エントリポイントで resolveInfo を解析して必要なデータを予め取得してしまう方法が考えられる。これは dedup を必要としないが、

- エントリポイントの数だけデータフェッチロジックが必要になること
- フィールドに対するデータの出所がわかりにくくなりそうなこと
- GraphQL way から外れている気がすること

等を考慮して採用しなかった。

### API サーバー ⇄ DB 間におけるオーバーフェッチ

resolveInfo の解析により DB からの取得列を絞れそうだが、難易度やコードの複雑化に対する恩恵が小さいと判断し、許容することにした: [Prisma 公式のパフォーマンスに関する見解](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance#using-select-to-limit-number-of-columns-returned)

なお [Prisma select](https://paljs.com/plugins/select) を使えば簡単に実現できそうだが、どうやら [Union types をサポートしていない](https://github.com/paljs/prisma-tools/issues/249)ようなので採用しなかった。GraphQL のスキーマと DB のスキーマが密結合してしまうという問題もあった。

### node interface と ID フォーマット

[Relay の GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification/) を満たすため、node interface を用意した。

node リゾルバで後続のリゾルバを決定する必要があるため、ID へタイプを表すプレフィックスを付加することにした。

### DB の ID フォーマット

UUIDv4, UUIDv7, ULID, Cuid2, Nano ID, 連番が候補に挙がったが、

- 時系列の値であること
- 分散環境での衝突耐性があること
- 安定運用の実績があること

を重視し、ULID を採用した。

時系列の値を求める理由は btree インデックスのキャッシュヒット率を上げるため。\
参考: [MySQL でプライマリキーを UUID にする前に知っておいて欲しいこと](https://techblog.raccoon.ne.jp/archives/1627262796.html)\
PostgreSQL でも同様と考えた。

UUIDv7 は正式リリース&安定運用されたら採用可能。\
連番は衝突の心配がない環境なら採用可能。

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

複数のデータソースを統一して扱うというビジョンがあるようだが、本当に実現できるのかちょっと疑っている。
