# Engineering Changes Applied

## AI streaming and speed
- `/api/chat` now streams directly from Ollama using NDJSON and `X-Accel-Buffering: no`.
- User message persistence no longer blocks the first token.
- Assistant messages are saved after stream completion.
- `request.signal` is passed to Ollama so Stop cancels backend generation.
- Ollama `keep_alive` is enabled to reduce repeated model loading delay.
- Message history sent to Ollama is limited to the latest 12 messages for faster prompts.

## Model routing
- Text model defaults to `qwen2.5:14b`.
- Image analysis automatically routes to `llava:latest`.
- Data URL image payloads are cleaned before being sent to Ollama.

## UI and UX
- Chat UI rebuilt in a cleaner ChatGPT-like layout.
- Arabic responses start RTL; English responses start LTR using automatic direction detection.
- Images are resized in-browser before upload for faster analysis.
- Text files such as txt, md, csv, json, sql, js, ts, html, css can be attached and sent for explanation.

## History and analytics
- History API now returns normalized lower-case fields.
- Assistant answers are saved, so old conversations show complete threads.
- Analytics counts user questions and assistant answers separately.
- SQL connection pool is reused instead of closed after every request.

## Build
- `next.config.ts` was fixed to use one valid export.
- NextAuth typing was added.
- Production build passes.
