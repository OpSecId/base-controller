/**
 * Database config: support either WORKFLOW_DB_URI (single URL) or separate
 * WORKFLOW_DB_HOST, WORKFLOW_DB_PORT, WORKFLOW_DB_USER, WORKFLOW_DB_PASSWORD, WORKFLOW_DB_NAME.
 */

export interface WorkflowDbConfig {
  host: string;
  port: number;
  user: string;
  username: string;
  password: string;
  database: string;
}

/** Parse postgresql://user:password@host:port/database into components */
export function parseDatabaseUri(uri: string): WorkflowDbConfig {
  const url = new URL(uri);
  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error(`Invalid database URI protocol: ${url.protocol}`);
  }
  const port = url.port ? parseInt(url.port, 10) : 5432;
  const database = url.pathname ? url.pathname.replace(/^\//, '').replace(/%2F/g, '/') : 'postgres';
  return {
    host: url.hostname,
    port,
    user: decodeURIComponent(url.username || 'postgres'),
    username: decodeURIComponent(url.username || 'postgres'),
    password: decodeURIComponent(url.password || ''),
    database: decodeURIComponent(database),
  };
}

export function getWorkflowDbConfig(configService: {
  get: (key: string) => string | undefined;
}): WorkflowDbConfig {
  const uri = configService.get('WORKFLOW_DB_URI');
  if (uri?.trim()) {
    return parseDatabaseUri(uri.trim());
  }
  return {
    host: configService.get('WORKFLOW_DB_HOST') ?? 'localhost',
    port: parseInt(configService.get('WORKFLOW_DB_PORT') ?? '5432', 10),
    user: configService.get('WORKFLOW_DB_USER') ?? 'postgres',
    username: configService.get('WORKFLOW_DB_USER') ?? 'postgres',
    password: configService.get('WORKFLOW_DB_PASSWORD') ?? '',
    database: configService.get('WORKFLOW_DB_NAME') ?? 'postgres',
  };
}

/** Get TypeORM options: either { url } or { host, port, username, password, database } */
export function getTypeOrmOptions(configService: {
  get: (key: string) => string | undefined;
}): { type: 'postgres'; url?: string; host?: string; port?: number; username?: string; password?: string; database?: string } {
  const uri = configService.get('WORKFLOW_DB_URI');
  if (uri?.trim()) {
    return { type: 'postgres', url: uri.trim() };
  }
  const c = getWorkflowDbConfig(configService);
  return {
    type: 'postgres',
    host: c.host,
    port: c.port,
    username: c.username,
    password: c.password,
    database: c.database,
  };
}

/** Get pg.Pool config: either { connectionString } or { host, port, user, password, database } */
export function getPgPoolConfig(configService: {
  get: (key: string) => string | undefined;
}): { connectionString?: string; host?: string; port?: number; user?: string; password?: string; database?: string } {
  const uri = configService.get('WORKFLOW_DB_URI');
  if (uri?.trim()) {
    return { connectionString: uri.trim() };
  }
  const c = getWorkflowDbConfig(configService);
  return {
    host: c.host,
    port: c.port,
    user: c.user,
    password: c.password,
    database: c.database,
  };
}
