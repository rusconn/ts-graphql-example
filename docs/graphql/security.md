# GraphQL Security

Private APIであればPersisted Queriesを利用することでセキュリティ対策はほぼ不要になるのだが、今回は学習のために利用しなかった(そもそも仕様が決まっていないのもある)。

## クエリの制限

[GraphQL Armor](https://escape.tech/graphql-armor/)と[graphql-query-complexity](https://github.com/slicknode/graphql-query-complexity)を組み合わせている。

GraphQL Armorは基本的なセキュリティを提供してくれるが、クエリの複雑さを考慮したものは提供しないので、graphql-query-complexityで補っている。

### クエリの複雑さ目安

根拠なし。感覚で決めた。

| フィールドの種類                         |     複雑さ |
| :--------------------------------------- | ---------: |
| DBアクセスを伴わないもの                 |          1 |
| DBアクセスを伴うもの                     |          3 |
| 通常のミューテーション                   |          5 |
| bcrypt等の重い計算を伴うミューテーション |        100 |
| connection                               | 3 \* count |

## 本番環境でのイントロスペクション無効化

[@graphql-yoga/plugin-disable-introspection](https://the-guild.dev/graphql/yoga-server/docs/features/introspection)

## レートリミット

未実装。トークンバケット方式で、complexity分のトークンを消費していく形を考えている。
