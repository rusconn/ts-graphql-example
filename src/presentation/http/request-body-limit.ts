import { createFetch } from "@whatwg-node/fetch";
import { sendResponseToUwsOpts } from "@whatwg-node/server";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

const fetchAPI = createFetch();

const tooLargeStatus = "413 Payload Too Large";
const tooLargeBody = JSON.stringify({ errors: [{ message: "Request body too large" }] });
const timeoutStatus = "503 Service Unavailable";
const timeoutBody = JSON.stringify({ errors: [{ message: "Request timeout" }] });

export type BodyLimitedFetch = (url: string, init: RequestInit) => Response | Promise<Response>;

export function createBodyLimitHandler({
  maxBodyBytes,
  requestTimeoutMs,
  fetch,
}: {
  maxBodyBytes: number;
  requestTimeoutMs: number;
  fetch: BodyLimitedFetch;
}) {
  return (res: HttpResponse, req: HttpRequest): void => {
    const method = req.getMethod();
    const url = `http://localhost${req.getUrl()}${req.getQuery() ? `?${req.getQuery()}` : ""}`;

    const headers = new Headers();
    req.forEach((key, value) => headers.append(key, value));

    const contentLength = headers.get("content-length");
    if (contentLength != null && Number(contentLength) > maxBodyBytes) {
      respondTooLarge(res);
      return;
    }

    const controller = new AbortController();
    res.onAborted(() => controller.abort());

    if (method === "get" || method === "head") {
      void respond(res, fetch, url, method, headers, null, controller, requestTimeoutMs);
      return;
    }

    // 蓄積完了で fullBody、maxSize超過で nullが渡される。null時はコネクションを閉じて受信を打ち切る
    res.collectBody(maxBodyBytes, (fullBody) => {
      if (fullBody == null) {
        respondTooLarge(res);
        return;
      }

      // uWSのArrayBufferはコールバック返却後に破棄され、参照を渡すだけでは受信バッファ再利用時に壊れるため実コピーを渡す
      const body = fullBody.slice(0);
      void respond(res, fetch, url, method, headers, body, controller, requestTimeoutMs);
    });
  };
}

function respondTooLarge(res: HttpResponse) {
  res.writeStatus(tooLargeStatus);
  res.end(tooLargeBody, true);
}

function respondTimeout(res: HttpResponse) {
  res.writeStatus(timeoutStatus);
  res.end(timeoutBody, true);
}

async function respond(
  res: HttpResponse,
  fetch: BodyLimitedFetch,
  url: string,
  method: string,
  headers: Headers,
  body: ArrayBuffer | null,
  controller: AbortController,
  requestTimeoutMs: number,
) {
  // タイムアウトでsignalをabortし、fetchをrejectさせる
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, requestTimeoutMs);

  try {
    const init: RequestInit = { method, headers, signal: controller.signal };
    if (body != null) {
      init.body = body;
    }

    const response = await fetch(url, init);
    await sendResponseToUwsOpts(res, response, controller, fetchAPI);
  } catch (error) {
    if (controller.signal.aborted) {
      if (timedOut) {
        respondTimeout(res);
      }
      return;
    }

    console.error(error);
    res.writeStatus("500 Internal Server Error");
    res.end();
  } finally {
    clearTimeout(timeoutId);
  }
}

if (import.meta.vitest) {
  type FakeRes = {
    status: string | null;
    endBody: unknown;
    closeConnection: boolean | null;
    collectBodyMaxSize: number | null;
    collectBodyCb: ((fullBody: ArrayBuffer | null) => void) | null;
    onAbortedCb: (() => void) | null;
    pause(): void;
    resume(): void;
    writeStatus(status: string): void;
    writeHeader(key: string, value: string): void;
    write(chunk: unknown): boolean;
    end(body?: unknown, closeConnection?: boolean): void;
    endWithoutBody(): void;
    tryEnd(): readonly [boolean, boolean];
    close(): void;
    getWriteOffset(): number;
    onWritable(handler: (offset: number) => boolean): void;
    onAborted(handler: () => void): void;
    collectBody(maxSize: number, handler: (fullBody: ArrayBuffer | null) => void): void;
    cork(cb: () => void): void;
  };

  const createFakeRes = (): FakeRes => {
    return {
      status: null,
      endBody: null,
      closeConnection: null,
      collectBodyMaxSize: null,
      collectBodyCb: null,
      onAbortedCb: null,
      pause() {},
      resume() {},
      writeStatus(status: string) {
        this.status = status;
      },
      writeHeader() {},
      write() {
        return true;
      },
      end(body?: unknown, closeConnection?: boolean) {
        this.endBody = body;
        this.closeConnection = closeConnection ?? null;
      },
      endWithoutBody() {},
      tryEnd() {
        return [true, true] as const;
      },
      close() {},
      getWriteOffset() {
        return 0;
      },
      onWritable() {
        return true;
      },
      onAborted(cb: () => void) {
        this.onAbortedCb = cb;
      },
      collectBody(maxSize: number, handler: (fullBody: ArrayBuffer | null) => void) {
        this.collectBodyMaxSize = maxSize;
        this.collectBodyCb = handler;
      },
      cork(cb: () => void) {
        cb();
      },
    };
  };

  const createFakeReq = ({
    method = "post",
    headers = {},
  }: {
    method?: string;
    headers?: Record<string, string>;
  } = {}) => {
    return {
      getMethod: () => method,
      getUrl: () => "/graphql",
      getQuery: () => "",
      getHeader: () => undefined,
      forEach(cb: (key: string, value: string) => void) {
        for (const [key, value] of Object.entries(headers)) {
          cb(key, value);
        }
      },
      setYield() {},
    };
  };

  const bytes = (length: number) => {
    const arrayBuffer = new ArrayBuffer(length);
    new Uint8Array(arrayBuffer).fill(1);
    return arrayBuffer;
  };

  const makeFetcher = () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetch = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(null, { status: 200 });
    };
    return { calls, fetch };
  };

  const flush = () => {
    return new Promise((resolve) => setImmediate(resolve));
  };

  describe("createBodyLimitHandler", () => {
    it("rejects by content-length before reading the body", () => {
      const res = createFakeRes();
      const { calls, fetch } = makeFetcher();
      const handler = createBodyLimitHandler({ maxBodyBytes: 100, requestTimeoutMs: 10000, fetch });

      handler(
        res as unknown as HttpResponse,
        createFakeReq({ headers: { "content-length": "200" } }) as unknown as HttpRequest,
      );

      expect(res.status).toBe(tooLargeStatus);
      expect(res.endBody).toBe(tooLargeBody);
      expect(res.closeConnection).toBe(true);
      expect(res.collectBodyCb).toBeNull();
      expect(calls).toHaveLength(0);
    });

    it("rejects when collectBody reports the body exceeds the limit", () => {
      const res = createFakeRes();
      const { calls, fetch } = makeFetcher();
      const handler = createBodyLimitHandler({ maxBodyBytes: 100, requestTimeoutMs: 10000, fetch });

      handler(res as unknown as HttpResponse, createFakeReq() as unknown as HttpRequest);
      res.collectBodyCb?.(null);

      expect(res.status).toBe(tooLargeStatus);
      expect(res.endBody).toBe(tooLargeBody);
      expect(res.closeConnection).toBe(true);
      expect(calls).toHaveLength(0);
    });

    it("forwards the body when it is within the limit", async () => {
      const res = createFakeRes();
      const { calls, fetch } = makeFetcher();
      const handler = createBodyLimitHandler({ maxBodyBytes: 100, requestTimeoutMs: 10000, fetch });

      handler(res as unknown as HttpResponse, createFakeReq() as unknown as HttpRequest);
      expect(res.collectBodyMaxSize).toBe(100);

      const received = bytes(100);
      res.collectBodyCb?.(received);
      await flush();

      expect(calls).toHaveLength(1);
      const body = calls[0]?.init.body as ArrayBuffer;
      expect(body.byteLength).toBe(100);
      // コールバック返却後に無効化されるため、fetchへはコピーが渡されること
      expect(body).not.toBe(received);
      expect(new Uint8Array(body)).toEqual(new Uint8Array(received));
    });

    it("forwards get requests without a body", async () => {
      const res = createFakeRes();
      const { calls, fetch } = makeFetcher();
      const handler = createBodyLimitHandler({ maxBodyBytes: 100, requestTimeoutMs: 10000, fetch });

      handler(
        res as unknown as HttpResponse,
        createFakeReq({ method: "get" }) as unknown as HttpRequest,
      );
      await flush();

      expect(calls).toHaveLength(1);
      expect(calls[0]?.init.method).toBe("get");
      expect(calls[0]?.init.body).toBeUndefined();
      expect(res.collectBodyCb).toBeNull();
    });

    it("responds 503 when the request execution exceeds the timeout", async () => {
      const res = createFakeRes();
      const fetch = (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        });
      const handler = createBodyLimitHandler({ maxBodyBytes: 100, requestTimeoutMs: 10, fetch });

      handler(res as unknown as HttpResponse, createFakeReq() as unknown as HttpRequest);
      res.collectBodyCb?.(bytes(10));
      await new Promise((resolve) => setTimeout(resolve, 30));

      expect(res.status).toBe(timeoutStatus);
      expect(res.endBody).toBe(timeoutBody);
      expect(res.closeConnection).toBe(true);
    });
  });
}
