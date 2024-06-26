import { DatabaseState, FinalTxInfo, HashAndHeight, HotTxInfo } from './interfaces';
import { Store } from './store';
import { DbConnectionParams } from './config';
export type IsolationLevel = 'SERIALIZABLE' | 'READ COMMITTED' | 'REPEATABLE READ';
export interface TypeormDatabaseOptions {
    supportHotBlocks?: boolean;
    isolationLevel?: IsolationLevel;
    stateSchema?: string;
    projectDir?: string;
    connectionParams?: DbConnectionParams;
}
export declare class TypeormDatabase {
    private statusSchema;
    private isolationLevel;
    private con?;
    private projectDir;
    private connectionParams;
    readonly supportsHotBlocks: boolean;
    constructor(options?: TypeormDatabaseOptions);
    connect(): Promise<DatabaseState>;
    disconnect(): Promise<void>;
    private initTransaction;
    private getState;
    transact(info: FinalTxInfo, cb: (store: Store) => Promise<void>): Promise<void>;
    transactHot(info: HotTxInfo, cb: (store: Store, block: HashAndHeight) => Promise<void>): Promise<void>;
    transactHot2(info: HotTxInfo, cb: (store: Store, sliceBeg: number, sliceEnd: number) => Promise<void>): Promise<void>;
    private deleteHotBlocks;
    private insertHotBlock;
    private updateStatus;
    private performUpdates;
    private submit;
    private escapedSchema;
}
//# sourceMappingURL=database.d.ts.map