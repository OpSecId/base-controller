/**
 * Redis config: support either REDIS_URI (single URL) or separate
 * REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB.
 */

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
}

/** Options for ioredis: either url string or { host, port, password, db } */
export type RedisConnectionOptions =
  | { url: string }
  | { host: string; port: number; password: string; db: number };

/** Parse redis://[:password@]host[:port][/db] into components */
export function parseRedisUri(uri: string): RedisConfig {
  const url = new URL(uri);
  if (url.protocol !== 'redis:' && url.protocol !== 'rediss:') {
    throw new Error(`Invalid Redis URI protocol: ${url.protocol}`);
  }
  const port = url.port ? parseInt(url.port, 10) : 6379;
  const pathDb = url.pathname?.replace(/^\//, '').trim();
  const db = pathDb ? parseInt(pathDb, 10) || 0 : 0;
  return {
    host: url.hostname,
    port,
    password: decodeURIComponent(url.password || ''),
    db,
  };
}

export function getRedisOptions(configService: {
  get: (key: string) => string | undefined;
}): RedisConnectionOptions {
  const uri = configService.get('REDIS_URI');
  if (uri?.trim()) {
    return { url: uri.trim() };
  }
  const host = configService.get('REDIS_HOST') ?? 'localhost';
  const port = parseInt(configService.get('REDIS_PORT') ?? '6379', 10);
  const password = configService.get('REDIS_PASSWORD') ?? '';
  const db = parseInt(configService.get('REDIS_DB') ?? '0', 10);
  return { host, port, password, db };
}
