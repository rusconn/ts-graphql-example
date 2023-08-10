# apollo prisma test

Apollo Server と Prisma を使って GraphQL API を作る。

## 起動方法

```shell
cp .env.example .env
docker compose up -d
pnpm run setup && pnpm dev
```

クエリの実行は [Web コンソール](http://localhost:4000) で。  
token を Authorization ヘッダへ Bearer でセットしておくこと。  
token は [Prisma Studio](http://localhost:5555) で取得する。  
Prisma Studio は `pnpm studio` で起動しておくこと。

## 各技術への理解と所感

### GraphQL

クエリ言語

- クライアントが API から取得するデータを指定出来る
  - これが GraphQL 最大のセールスポイント
  - リソース指向の汎用的な API(実装が楽)とユースケースに応じたデータ取得を両立出来る
- グラフの理解がある程度必要
  - ノード: id を持つ Object type
  - エッジ: ノード 間の関係
  - 有向: 一方向の関係
  - 無向: 双方向の関係
  - 無向にしておくとクエリの柔軟性が高い
- 複雑なクエリへの対処が必要
  - 深さに対してデータ量(≒ サーバ負荷)が指数的に増加する
  - 閉路に対してはいくらでもクエリを深くできる
- nullable という概念に、「フィールド不在」と「フィールドの値が null になり得る」の意味が混ざっている
  - 設計ミスでは？
- Relay の仕様を学んでおくと良さそうに感じた
  - ベストプラクティス感がある
- update 系 mutation の入力は nullable 推奨
  - non-nullable だと後からフィールドを追加しにくい

### Apollo Server

GraphQL サーバ実装

- resolver chain により、必要なフィールドだけ解決できる
  - GraphQL サーバを名乗るなら当然必須
  - 実行回数が N+1 になり得るがパフォーマンス的に大丈夫か？
- context が resolver のパラメータ扱いなのが関数型文化っぽい
  - 出力を左右するものはパラメータとする
  - ReaderT Env IO パターンのような感じ
- デフォルトでキャッシュが付属している
  - Redis 等の外部キャッシュを指定するのも容易そう
- Apollo Federation で GraphQL API を束ねることができるらしい
  - BFF を簡単に実現できる

### Prisma

ORM

- 型が自動生成されて便利
  - スキーマを定義するだけで型付きのクライアントが手に入る
- バッチリクエストをサポートしている
  - GraphQL の文脈で頻出の N+1 問題を解決する

## 設計記録

### node interface と ID フォーマット

[Relay の GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification/) を満たすため、node interface を用意した。

node interface は他のクエリとは異なり、どのタイプを返すべきなのかが分からない。  
無工夫だと全タイプの可能性を考慮したデータ取得をする必要があり、データソースによっては非効率となる。  
これを避ける為、ID へタイプを表すプレフィックスを付加することにした。

### データフェッチ戦略

[GraphQL Resolvers: Best Practices](https://medium.com/paypal-tech/graphql-resolvers-best-practices-cd36fdbcef55) を参考にデザインした。

グラフのエントリポイント(Query や Mutation 直下のフィールド)ではなく、葉である Scalar type のフィールドでデータをフェッチする。\
クエリが重複するのでバッチ化が事実上必須となる。

他の戦略としては、エントリポイントで resolveInfo を解析し、必要なデータを予め取得してしまうアプローチが考えられる。これはクエリのバッチ化を必要としないが、

- resolveInfo の解析が難しそうであること
- エントリポイントの数だけクエリのコードが必要になること
- 取得したデータが権限エラー等で無駄になり得ること
- GraphQL way から外れている気がすること

等を考慮して採用しなかった。

### API サーバー ⇄ DB 間におけるオーバーフェッチの防止

Prisma の select オプションを利用した。\
select オプションの値を作成するのに [Prisma select](https://paljs.com/plugins/select) を利用した。\
ただし Union type であるフィールドには使わなかった。どうやら[サポートしていない](https://github.com/paljs/prisma-tools/issues/249)よう。\
柔軟性に欠くので上記ライブラリは廃止するかもしれない。

### src ディレクトリの構成

好みの問題でバレルはほとんど作成しなかった。

```text
src
├── datasources - 各種データソース
├── generic     - 他のプロジェクトでも使えそうな汎用ユーティリティ
└── modules     - スキーマの主要なタイプのモジュール群
    ├── common      - 複数のタイプで使うユーティリティ
    └── todo        - Todo タイプのモジュール
        ├── adapters.ts    - 各フィールドの型や値をスキーマのものへ変換
        ├── parsers.ts     - 各フィールドの引数の検証・変換
        ├── permissions.ts - 各フィールドの取得権限
        ├── resolvers.ts   - 各フィールドのリゾルバ
        └── typeDefs.ts    - スキーマ
    └── user        - User タイプのモジュール
```
