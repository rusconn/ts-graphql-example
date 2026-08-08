import { createServer, request as httpRequest } from "node:http";
import type { IncomingMessage, IncomingHttpHeaders, RequestListener, Server } from "node:http";
import type { AddressInfo } from "node:net";
import { Readable } from "node:stream";

const tooLargeStatus = 413;
const tooLargeBody = JSON.stringify({ errors: [{ message: "Request body too large" }] });
const timeoutStatus = 503;
const timeoutBody = JSON.stringify({ errors: [{ message: "Request timeout" }] });

export function createBodyLimitHandler({
  maxBodyBytes,
  requestTimeoutMs,
  requestListener,
}: {
  maxBodyBytes: number;
  requestTimeoutMs: number;
  requestListener: RequestListener;
}): RequestListener {
  return (req, res) => {
    const contentLength = Number(req.headers["content-length"] ?? 0);
    if (contentLength > maxBodyBytes) {
      respondJson(res, tooLargeStatus, tooLargeBody);
      return;
    }

    // ボディをBufferへ蓄積し、上限超過時は受信を止めて413を返す
    let overLimit = false;
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBodyBytes) {
        overLimit = true;
        req.pause();
        respondJson(res, tooLargeStatus, tooLargeBody);
        return;
      }
      chunks.push(chunk);
    });
    req.on("error", () => {});
    req.on("end", () => {
      if (overLimit) {
        return;
      }

      // 実行タイムアウト: 503を返す。接続を破棄するとrequestListener側の切断検知が発火し、進行中の処理も中断される
      const timeoutId = setTimeout(() => {
        if (!res.writableEnded && !res.destroyed) {
          respondJson(res, timeoutStatus, timeoutBody);
          res.destroy();
        }
      }, requestTimeoutMs);
      res.on("finish", () => clearTimeout(timeoutId));
      res.on("close", () => clearTimeout(timeoutId));

      // 上限チェックのため実reqは読み終えている。蓄積したボディを流し直したreqへ差し替えて委譲する
      // (requestListenerはreqをダックタイピングで受けるため、method/url/headersを付けたReadableで足りる)
      requestListener(
        Object.assign(Readable.from([Buffer.concat(chunks)]), {
          method: req.method,
          url: req.url,
          headers: req.headers,
        }) as unknown as IncomingMessage,
        res,
      );
    });
  };
}

function respondJson(res: Parameters<RequestListener>[1], status: number, body: string) {
  res.writeHead(status, { "content-type": "application/json", connection: "close" });
  res.end(body);
}

if (import.meta.vitest) {
  const defaultMaxBodyBytes = 100;

  const startServer = async ({
    maxBodyBytes = defaultMaxBodyBytes,
    requestTimeoutMs = 10_000,
    requestListener,
  }: {
    maxBodyBytes?: number;
    requestTimeoutMs?: number;
    requestListener?: RequestListener;
  } = {}) => {
    const calls: Array<{
      method: string;
      url: string;
      headers: IncomingHttpHeaders;
      body: string;
    }> = [];
    const server = createServer(
      createBodyLimitHandler({
        maxBodyBytes,
        requestTimeoutMs,
        requestListener:
          requestListener ??
          (async (req, res) => {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            calls.push({
              method: req.method ?? "",
              url: req.url ?? "",
              headers: req.headers,
              body: Buffer.concat(chunks).toString(),
            });
            res.writeHead(200, { "content-type": "text/plain" });
            res.end("ok");
          }),
      }),
    );
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    const url = (path: string) => `http://127.0.0.1:${address.port}${path}`;
    return { server, calls, url, port: address.port };
  };

  const stopServer = async (server: Server) => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  };

  const postRaw = (
    port: number,
    path: string,
    body: Buffer,
    headers: Record<string, string> = {},
  ) =>
    new Promise<{ status: number; body: string }>((resolve, reject) => {
      const client = httpRequest(
        { host: "127.0.0.1", port, path, method: "POST", headers },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () =>
            resolve({ status: response.statusCode ?? 0, body: Buffer.concat(chunks).toString() }),
          );
        },
      );
      client.on("error", reject);
      client.end(body);
    });

  describe("createBodyLimitHandler", () => {
    it("rejects by content-length before reading the body", async () => {
      const { server, port, calls } = await startServer();
      try {
        const res = await postRaw(port, "/graphql", Buffer.alloc(101), {
          "content-length": "101",
        });
        expect(res.status).toBe(413);
        expect(res.body).toBe(tooLargeBody);
        expect(calls).toHaveLength(0);
      } finally {
        await stopServer(server);
      }
    });

    it("rejects when the uploaded body exceeds the limit", async () => {
      const { server, port, calls } = await startServer();
      try {
        const res = await postRaw(port, "/graphql", Buffer.alloc(101));
        expect(res.status).toBe(413);
        expect(res.body).toBe(tooLargeBody);
        expect(calls).toHaveLength(0);
      } finally {
        await stopServer(server);
      }
    });

    it("forwards the body to the request listener", async () => {
      const { server, port, calls } = await startServer();
      try {
        const body = "x".repeat(50);
        const res = await postRaw(port, "/graphql", Buffer.from(body), {
          "content-type": "application/json",
        });
        expect(res.status).toBe(200);
        expect(calls).toHaveLength(1);
        expect(calls[0]?.url).toContain("/graphql");
        expect(calls[0]?.method).toBe("POST");
        expect(calls[0]?.body).toBe(body);
        expect(calls[0]?.headers["content-type"]).toBe("application/json");
      } finally {
        await stopServer(server);
      }
    });

    it("forwards get requests without a body", async () => {
      const { server, url, calls } = await startServer();
      try {
        const res = await fetch(url("/graphql"));
        expect(res.status).toBe(200);
        expect(calls).toHaveLength(1);
        expect(calls[0]?.method).toBe("GET");
        expect(calls[0]?.body).toBe("");
      } finally {
        await stopServer(server);
      }
    });

    it("responds 503 when the request execution exceeds the timeout", async () => {
      const { server, port } = await startServer({
        requestTimeoutMs: 10,
        requestListener: () => new Promise<void>(() => {}),
      });
      try {
        const res = await postRaw(port, "/graphql", Buffer.from("x".repeat(10)));
        expect(res.status).toBe(503);
        expect(res.body).toBe(timeoutBody);
      } finally {
        await stopServer(server);
      }
    });
  });
}
