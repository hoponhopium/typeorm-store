import { EntityManager } from 'typeorm';
export declare const db_config: {
    host: string;
    port: number;
    user: any;
    password: any;
    database: any;
};
export declare function databaseInit(sql: string[]): Promise<void>;
export declare function databaseDelete(): Promise<void>;
export declare function useDatabase(sql: string[]): void;
export declare function getEntityManager(): Promise<EntityManager>;
//# sourceMappingURL=util.d.ts.map