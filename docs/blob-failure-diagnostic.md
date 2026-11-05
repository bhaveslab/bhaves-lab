# Blob failure diagnostic only

**Actual provider cause: UNRESOLVED. No real-provider mutation probe was rerun. No safety assertion was weakened.** Continued from PR #9 / `cab464a`.

The prior Preview run admitted exactly one successful conditional writer out of eight, then stopped because at least one rejection was not an instance of `BlobPreconditionFailedError`. Its assertion retained neither the rejected class nor the provider status/code/message. The existing evidence cannot identify that rejection as a valid conflict, transient provider failure or SDK difference. The real safety gate remains FAILED; later stale-write/restart/reservation assertions remain unverified.

## Read-only SDK and assertion inspection

Installed `@vercel/blob` is **2.8.2**, with `undici` **6.29.1**. No dependency or installed SDK code was changed. Relevant installed SDK source is `dist/chunk-XKVPKJPO.js`, SHA-256 `280b861da0a277acfbd87694a231b6c4a3ebe8f3781368ff110b37f1f49a26bb`.

- `createPutHeaders` (around lines 927–949) sends `ifMatch` as `x-if-match`. With `ifMatch` present and `allowOverwrite` omitted, it sets `x-allow-overwrite: 1`. Explicit `allowOverwrite:false` with `ifMatch` is rejected locally as contradictory. The original competing writes omit `allowOverwrite` and include the same original etag; the inspected code is using the SDK's conditional overwrite path. It is not falling back to an unconditional write.
- `getBlobError` (around lines 659–739) parses `response.error.code` and selects the SDK error class. `precondition_failed` maps to `BlobPreconditionFailedError`; `rate_limited` to `BlobServiceRateLimited`; `service_unavailable` to `BlobServiceNotAvailable`; `forbidden` to `BlobAccessError`; unknown/unrecognized codes to `BlobUnknownError`. HTTP 412 by itself does **not** select the precondition class.
- `requestApi` (around lines 824–829) receives `{code,error}`, then throws/bails with the error object. The raw HTTP status and original provider code are not attached to the resulting SDK error. Inspecting only `error.status`/`error.code` therefore often yields no evidence. SDK retry policy was inspected but is not changed by the instrumentation.
- The Blob classes extend a base `BlobError` which does not set `this.name`; `.name` remains `Error`. `.constructor.name` distinguishes their class names in this installed build. A name-only acceptance rule would not fix the failed safety gate and has not been introduced.
- `put` and `BlobPreconditionFailedError` in the original probe are imported together from the same ESM package entry. One Blob package version is installed. There is no evidence that the prior failure was caused by duplicate SDK copies. An offline demonstration shows CJS and ESM constructors can differ in identity, but that demonstrates a possible diagnostic pattern, **not the cause of the actual ESM probe failure**.
- The production reservation adapter still converts only an actual `instanceof BlobPreconditionFailedError` to an optimistic-concurrency conflict. All other errors propagate and fail closed. That adapter and its retry rules are unchanged.

## Instrumentation prepared, not executed against the provider

`scripts/lib/blob-probe-diagnostics.mjs` adds a temporary Undici dispatcher observer around the existing SDK transport, scoped by `AsyncLocalStorage` to fixed per-operation labels. It forwards request options, body and callbacks to the existing dispatcher. It does not add retries, alter headers, suppress errors, serialize concurrent writes or change acceptance criteria.

The next separately authorized disposable run will record **all eight outcomes before the single-winner and exact-class assertions execute**, including:

- SDK constructor class, inherited name, SDK code if exposed, SDK-reported HTTP status if exposed, sanitized message, optional cause code and retry-after;
- actual HTTP status, original provider JSON error code and sanitized provider message, captured from the response because the SDK discards them;
- per-request response history, preserving retry evidence and correlation across concurrent operations;
- informational classification and whether the exact expected SDK class matched.

Only allowlisted scalar response/error fields are emitted. No authorization/request headers, request bodies, full response bodies, URLs, stack traces, etags, tokens or successful response values are logged. Current credential environment values and common key/JWT/bearer patterns are redacted, along with email addresses and URLs. Error JSON capture is limited to 8 KiB; oversized or non-JSON bodies are omitted. Responses are bounded to 64 per operation and text fields to 1,024 characters. Successful private PDF/body data is not copied. The observer is restored after disposable cleanup.

The same diagnostic wrappers cover seed/read, contention, stale-write, injected commit interruption, reservation fixture/competition and cleanup stages. The separate restart process continues to emit only synthetic revision/record data, not credentials.

## Interpretation rules — not authorization rules

| Observed evidence in a future authorized run | Diagnostic interpretation | Safety treatment |
| --- | --- | --- |
| Exact `BlobPreconditionFailedError` | Expected SDK conditional-conflict path | Existing exact-class assertion still applies |
| HTTP 412 + `precondition_failed`, but different constructor identity | Conditional response with SDK mapping/identity difference to investigate | FAIL; no name/status-only fallback |
| HTTP 429, 5xx, rate-limit/service-unavailable class | Transient-provider-failure signal; persistence/cause not established | FAIL; no automatic probe rerun or policy change |
| HTTP 401/403 | Authorization failure signal | FAIL |
| Other code/status, no response, or missing evidence | Unresolved | FAIL |

A status code, message substring, or matching class name alone never authorizes a retry, marks a slot reserved, confirms payment, or changes the probe pass criteria. Even expected conflicts do not replace the single-winner, stale-write, restart and reservation assertions.

## Offline validation performed

Command: `node --test tests/blob-probe-diagnostics.test.mjs` — **11 passed, zero skipped**.

These execute the **installed SDK** with Undici MockAgent interceptors and `disableNetConnect()`. No real network request can leave that test process. Cases cover 412/expected and unknown codes, 429, 503, 403, CJS/ESM class identity, concurrent label correlation, successful-body omission, oversized-body omission and secret/field redaction. These are diagnostic unit tests, not Blob provider tests. Syntax and whitespace checks pass.

The real mutation script, one-off build override and permanent initialization/ingestion scripts were **not run** during this diagnostic task. No permanent ledger, retail PDFs, additional database, production credential configuration, payment activation, merge or production deployment.

## Next gate

A **separately owner-authorized controlled disposable Preview rerun is necessary** to recover the missing provider evidence. It must use the existing store and exact strict criteria; collect the new sanitized report; clean up only its random probe object; and stop again if any requirement fails. Until that authorization and evidence exist, the cause remains unresolved and booking remains disabled.
