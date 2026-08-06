# HTTP Security

- TLS終端は前段任せ
- idleタイムアウトはuWS標準(10秒)(スローロリス対策)
- リクエストボディサイズを制限している
- CORSはしていない
- CSRF対策としてrefresh token cookieへ`SameSite=Lax`を設定
  - CORSするなら設定を緩くし、別で対策する
