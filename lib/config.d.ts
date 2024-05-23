import type { DataSourceOptions as OrmConfig } from 'typeorm';
export interface DbConnectionParams {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}
export interface OrmOptions {
    projectDir?: string;
    connectionParams: DbConnectionParams;
}
export declare const MIGRATIONS_DIR = "db/migrations";
export declare function createOrmConfig(options?: OrmOptions): OrmConfig;
//# sourceMappingURL=config.d.ts.map