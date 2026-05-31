# GraphQL Schema

## GraphQL Server Specificationへの準拠

[GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification/)を満たすよう設計している。

## トップレベルフィールドの回避

できる限り、Query直下にフィールドを追加するのではなく既存のNodeへ関係としてのフィールドを追加するようにしている。`Query.todos(userId: ID!, ...)`ではなく、`User.todos(...)`、`Query.todoOwner(todoId: ID!)`ではなく`Todo.owner`といった具合。積極的にグラフ(Node間の関係)を表現し、文脈を活用することでより自然な構造を実現できる。

## フィールドのnullability

データの部分的な取得をサポートする為、基本的にnullableとしている。\
取得できなかったフィールドに対するフォールバックはクライアントが決める。

- クライアントが部分取得を求めていないことがわかっている
- フィールドの欠けたデータが意味を成さない

等の場合はnon-nullableとしてもよい。

## フィールド定義のコロケーション

巨大なスキーマファイルを1つ用意するのではなく、各リゾルバー実装と同じモジュールに対応するフィールド定義を配置している。

## スキーマの統合

Relay等のクライアントが要求する場合へ備え、[../../schemagen.ts](../../schemagen.ts)により統合されたスキーマファイルを生成するようにしている。

## TypeScript型生成

TypeScript型の生成には[GraphQL Code Generator](https://the-guild.dev/graphql/codegen)を利用している。このツールにこだわる理由はなく、より良いと思われるツールがあれば移行するかもしれない。
