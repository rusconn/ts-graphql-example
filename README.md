# ts-graphql-example

TypeScriptを使ってGraphQL APIを作る。

とりあえず簡単なTodoアプリのバックエンドを想定して作る。\
アプリのシップではなく、設計や実装のノウハウを手に入れることが目的。

## 事前準備

```shell
cp .env.example .env
docker compose up -d
pnpm install                        # requires global pnpm >= 10
node --run migrate -- reset --force # requires global Node.js
```

Node.jsは[package.json](./package.json)のenginesを満たすバージョンを自前で用意する。\
pnpmはv10以上を自前で用意し、[package.json](./package.json)のpackageManagerを自動参照させる。

## 起動方法

```shell
node --run dev
```

クエリの実行は [Webコンソール](http://localhost:4000/graphql)で。\
アクセストークンをAuthorizationヘッダへBearerでセットしておくこと。\
アクセストークンはWebコンソールでloginミューテーションを実行して手に入れる。\
ログインに必要な情報は [seedスクリプト](./prisma/seed.ts)から取得する。

## 設計記録

### フィールドのnullability

データの部分的な取得をサポートする為、基本的にnullableとした。\
取得できなかったフィールドに対するフォールバックはクライアントが決める。

- クライアントが部分取得を求めていないことがわかっている
- フィールドの欠けたデータが意味を成さない

等の場合はnon-nullableとしてもよい。

### APIサーバー ⇄ DB間におけるオーバーフェッチ

resolveInfoの解析によりDBからの取得列を絞れそうだが、コードの複雑化に対する恩恵が小さいと判断し、許容することにした。

### node interfaceとIDフォーマット

[RelayのGraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification/)を満たすため、node interfaceを用意した。

nodeリゾルバで後続のリゾルバを決定する必要があるため、IDへタイプを表すプレフィックスを付加することにした。

### DBのIDフォーマット

UUIDv4, UUIDv7, ULID, Cuid2, Nano ID, 連番が候補に挙がったが、

- 時系列の値であること
- 分散環境での衝突耐性があること
- 安定運用の実績があること
- 標準的であること

を重視し、UUIDv7を採用した。

時系列の値を求める理由はB+Treeインデックスのキャッシュヒット率を上げるため。\
参考: [MySQLでプライマリキーをUUIDにする前に知っておいて欲しいこと](https://techblog.raccoon.ne.jp/archives/1627262796.html)\
PostgreSQLのインデックスはクラスター化されていないが、B+Treeを扱う以上同じような問題は避けられないと考えた。

### createdAtの代用としてのID

DBにはcreatedAtを用意していない。代わりにIDに含まれるタイムスタンプを利用する。\
データサイズ、インデックスサイズ、データ転送量の削減が目的。

### クエリの複雑さ制限

サーバーを守るためにクエリの複雑さ(コスト)に上限を設けている。\
将来的にはレートリミットにも応用する予定。

#### 複雑さの目安

| フィールドの種類                         |     複雑さ |
| :--------------------------------------- | ---------: |
| DBアクセスを伴わないもの                 |          1 |
| DBアクセスを伴うもの                     |          3 |
| 通常のミューテーション                   |          5 |
| bcrypt等の重い計算を伴うミューテーション |        100 |
| connection                               | 3 \* count |

## 各技術への理解と所感

### GraphQL

APIへ柔軟性をもたらす技術。\
柔軟性と引き換えにクエリのバッチ化やセキュリティ対策、新しい観点での設計能力が要求される。\
Public APIでこそ真価を発揮すると思うのだが、[あるエキスパートはPublic APIには使わないと言っている](https://magiroux.com/eight-years-of-graphql)。\
Private APIの場合はPersisted Queriesオンリーにすることでいくらか実装の負担を軽減できる。\
ただ、ユースケースが判明しているのならRPCスタイルで十分な気もする。当然柔軟性は失われるのだが…。

### Prisma

データソースを扱うツール。\
Language-agnosticにスキーマを定義し、宣言的にマイグレーション出来る。\
TSであればスキーマ定義をもとに型付きのクライアントを生成出来る。\
別の言語向けに生成するサードパーティーライブラリもあるよう。

今回は下記理由によりクライアントの使用を避けた。

- SQLが汚い
- バッチ化の効率が悪い
- ライブラリのサイズが大きいのでデプロイ環境を選ぶ
- マルチに使える分APIがややわかりにくい

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

上記クエリをN+1を回避しつつ解決する場合は `prisma.foo.findUnique({ where: { id: fooId } }).bars({ limit: 20 })` のようにFluentAPIを利用することになるが、その場合各fooの **すべての** barを読み込んでオンメモリで件数を絞り込むよう。barの件数が多い場合、著しいオーバーヘッドが発生する。バージョン `5.4.2` 時点での話で、今でも同様かどうかは不明。
