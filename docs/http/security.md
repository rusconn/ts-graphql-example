# HTTP Security

- TLS終端は前段任せ
- 実行タイムアウトは10秒
- headersTimeout/requestTimeoutを10秒に設定(スローロリス対策)
- リクエストボディサイズを制限している
- CORSはしていない
- CSRF対策としてrefresh token cookieへ`SameSite=Lax`を設定
  - CORSするなら設定を緩くし、別で対策する
