# Database Schema

## IDのフォーマット

UUIDv4, UUIDv7, ULID, Cuid2, Nano ID, 連番が候補に挙がったが、

- 時系列の値であること
- 分散環境での衝突耐性があること
- 安定運用の実績があること
- 標準的であること

を重視し、UUIDv7を採用した。

時系列の値を求める理由はB+Treeインデックスのキャッシュヒット率を上げるため。\
参考: [MySQLでプライマリキーをUUIDにする前に知っておいて欲しいこと](https://techblog.raccoon.ne.jp/archives/1627262796.html)\
PostgreSQLのインデックスはクラスター化されていないが、B+Tree(正確にはB-Link Tree)を扱う以上同じような問題は避けられないと考えた。

## マイグレーション管理

[pgschema](https://www.pgschema.com/)を利用している。

pgschemaはPostgreSQL専用だが、

- 宣言的マイグレーションにより履歴管理から解放される
- スキーマ定義に使い慣れたSQLを利用できる
- PostgreSQLの細かい機能を利用できる
- マイグレーション実行が速い

等のメリットがある。

### 対抗ツール

#### Prisma

部分インデックス等の一部機能をSDLで表現できないことや、SDLのクセが気になった。

#### Atlas

宣言的マイグレーションに対応しているが、[一部機能はPro版でないと利用できない](https://atlasgo.io/features#database-features)。また、マイグレーションの実行がやや遅いのが気になった。
