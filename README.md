# apollo prisma test

Apollo Server と Prisma を使って GraphQL API を作る。

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

## その他

ちょいちょいライブラリのバグを踏んだ

- [GraphQL Code Generator の avoidOptionals 問題](https://github.com/dotansimha/graphql-code-generator/issues/7005)
- [Prisma の FluentAPI non-null 問題](https://github.com/prisma/prisma/issues/10687)
- [Yup の文字数カウントおかしい問題](https://github.com/jquense/yup/issues/1409)
