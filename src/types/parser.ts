export type ParseResult<T> =
  | { ok: true;  data: T;      warnings: string[] }
  | { ok: false; error: string; warnings: string[] }

export interface ParserOptions {
  maxLines?: number       // safety cap for large files; default 2_000_000
  skipComments?: boolean  // default true
}
