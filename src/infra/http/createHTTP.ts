type HttpConfig = { baseUrl: string; defaultHeaders?: Record<string, string> };

type HttpError = { status: number; message: string; url: string; cause?: unknown };

function withTimeout(signal: AbortSignal | undefined, ms: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const composite = new AbortController();
    function onAbort() { controller.abort(); }
    if (signal) signal.addEventListener('abort', onAbort);
    return {
        signal: mergeSignals([controller.signal, signal]),
        cleanup: () => { clearTimeout(timer); if (signal) signal.removeEventListener('abort', onAbort); },
    };
}

function mergeSignals(signals: (AbortSignal | undefined)[]): AbortSignal | undefined {
    const active = signals.filter(Boolean) as AbortSignal[];
    if (active.length === 0) return undefined;
    const controller = new AbortController();
    active.forEach(s => s.addEventListener('abort', () => controller.abort()));
    return controller.signal;
}

export function createHttp(config: HttpConfig) {
    const { baseUrl, defaultHeaders } = config;

    async function request<T>(path: string, init: RequestInit & { timeoutMs?: number } = {}, signal?: AbortSignal): Promise<T> {
        const url = baseUrl + path;
        const { timeoutMs = 15000, headers, ...rest } = init;
        const { signal: sig, cleanup } = withTimeout(signal, timeoutMs);
        try {
            const res = await fetch(url, { ...rest, headers: { 'Accept': 'application/json', ...defaultHeaders, ...headers }, signal: sig });
            if (!res.ok) {
                const text = await res.text();
                const err: HttpError = { status: res.status, message: text || res.statusText, url };
                throw err;
            }
            return (await res.json()) as T;
        } catch (e: any) {
            if (e?.name === 'AbortError') {
                throw { status: 499, message: 'Request aborted/timeout', url } as HttpError;
            }
            throw e;
        } finally {
            cleanup();
        }
    }

    function get<T>(path: string, params?: Record<string, string | number | boolean>, init?: Omit<RequestInit, 'method'> & { timeoutMs?: number }, signal?: AbortSignal) {
        const qs = params ? '?' + new URLSearchParams(Object.entries(params).reduce((acc, [k, v]) => { acc[k] = String(v); return acc; }, {} as Record<string, string>)).toString() : '';
        return request<T>(path + qs, { ...init, method: 'GET' }, signal);
    }

    return { get };
}