"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeormDatabase = void 0;
const util_internal_1 = require("@subsquid/util-internal");
const assert_1 = __importDefault(require("assert"));
const typeorm_1 = require("typeorm");
const hot_1 = require("./hot");
const store_1 = require("./store");
const config_1 = require("./config");
class TypeormDatabase {
    constructor(options) {
        this.statusSchema = options?.stateSchema || 'squid_processor';
        this.isolationLevel = options?.isolationLevel || 'SERIALIZABLE';
        this.supportsHotBlocks = options?.supportHotBlocks !== false;
        this.projectDir = options?.projectDir || process.cwd();
        this.connectionParams = options?.connectionParams || { host: 'localhost', port: 5432, database: 'postgres', username: 'postgres', password: 'password' };
    }
    async connect() {
        (0, assert_1.default)(this.con == null, 'already connected');
        let cfg = (0, config_1.createOrmConfig)(this.connectionParams, { projectDir: this.projectDir });
        this.con = new typeorm_1.DataSource(cfg);
        await this.con.initialize();
        try {
            return await this.con.transaction('SERIALIZABLE', em => this.initTransaction(em));
        }
        catch (e) {
            await this.con.destroy().catch(() => { }); // ignore error
            this.con = undefined;
            throw e;
        }
    }
    async disconnect() {
        await this.con?.destroy().finally(() => this.con = undefined);
    }
    async initTransaction(em) {
        let schema = this.escapedSchema();
        await em.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
        await em.query(`CREATE TABLE IF NOT EXISTS ${schema}.status (` +
            `id int4 primary key, ` +
            `height int4 not null, ` +
            `hash text DEFAULT '0x', ` +
            `nonce int4 DEFAULT 0` +
            `)`);
        await em.query(// for databases created by prev version of typeorm store
        `ALTER TABLE ${schema}.status ADD COLUMN IF NOT EXISTS hash text DEFAULT '0x'`);
        await em.query(// for databases created by prev version of typeorm store
        `ALTER TABLE ${schema}.status ADD COLUMN IF NOT EXISTS nonce int DEFAULT 0`);
        await em.query(`CREATE TABLE IF NOT EXISTS ${schema}.hot_block (height int4 primary key, hash text not null)`);
        await em.query(`CREATE TABLE IF NOT EXISTS ${schema}.hot_change_log (` +
            `block_height int4 not null references ${schema}.hot_block on delete cascade, ` +
            `index int4 not null, ` +
            `change jsonb not null, ` +
            `PRIMARY KEY (block_height, index)` +
            `)`);
        let status = await em.query(`SELECT height, hash, nonce FROM ${schema}.status WHERE id = 0`);
        if (status.length == 0) {
            await em.query(`INSERT INTO ${schema}.status (id, height, hash) VALUES (0, -1, '0x')`);
            status.push({ height: -1, hash: '0x', nonce: 0 });
        }
        let top = await em.query(`SELECT height, hash FROM ${schema}.hot_block ORDER BY height`);
        return assertStateInvariants({ ...status[0], top });
    }
    async getState(em) {
        let schema = this.escapedSchema();
        let status = await em.query(`SELECT height, hash, nonce FROM ${schema}.status WHERE id = 0`);
        (0, assert_1.default)(status.length == 1);
        let top = await em.query(`SELECT hash, height FROM ${schema}.hot_block ORDER BY height`);
        return assertStateInvariants({ ...status[0], top });
    }
    transact(info, cb) {
        return this.submit(async (em) => {
            let state = await this.getState(em);
            let { prevHead: prev, nextHead: next } = info;
            (0, assert_1.default)(state.hash === info.prevHead.hash, RACE_MSG);
            (0, assert_1.default)(state.height === prev.height);
            (0, assert_1.default)(prev.height < next.height);
            (0, assert_1.default)(prev.hash != next.hash);
            for (let i = state.top.length - 1; i >= 0; i--) {
                let block = state.top[i];
                await (0, hot_1.rollbackBlock)(this.statusSchema, em, block.height);
            }
            await this.performUpdates(cb, em);
            await this.updateStatus(em, state.nonce, next);
        });
    }
    transactHot(info, cb) {
        return this.transactHot2(info, async (store, sliceBeg, sliceEnd) => {
            for (let i = sliceBeg; i < sliceEnd; i++) {
                await cb(store, info.newBlocks[i]);
            }
        });
    }
    transactHot2(info, cb) {
        return this.submit(async (em) => {
            let state = await this.getState(em);
            let chain = [state, ...state.top];
            assertChainContinuity(info.baseHead, info.newBlocks);
            (0, assert_1.default)(info.finalizedHead.height <= ((0, util_internal_1.maybeLast)(info.newBlocks) ?? info.baseHead).height);
            (0, assert_1.default)(chain.find(b => b.hash === info.baseHead.hash), RACE_MSG);
            if (info.newBlocks.length == 0) {
                (0, assert_1.default)((0, util_internal_1.last)(chain).hash === info.baseHead.hash, RACE_MSG);
            }
            (0, assert_1.default)(chain[0].height <= info.finalizedHead.height, RACE_MSG);
            let rollbackPos = info.baseHead.height + 1 - chain[0].height;
            for (let i = chain.length - 1; i >= rollbackPos; i--) {
                await (0, hot_1.rollbackBlock)(this.statusSchema, em, chain[i].height);
            }
            if (info.newBlocks.length) {
                let finalizedEnd = info.finalizedHead.height - info.newBlocks[0].height + 1;
                if (finalizedEnd > 0) {
                    await this.performUpdates(store => cb(store, 0, finalizedEnd), em);
                }
                else {
                    finalizedEnd = 0;
                }
                for (let i = finalizedEnd; i < info.newBlocks.length; i++) {
                    let b = info.newBlocks[i];
                    await this.insertHotBlock(em, b);
                    await this.performUpdates(store => cb(store, i, i + 1), em, new hot_1.ChangeTracker(em, this.statusSchema, b.height));
                }
            }
            chain = chain.slice(0, rollbackPos).concat(info.newBlocks);
            let finalizedHeadPos = info.finalizedHead.height - chain[0].height;
            (0, assert_1.default)(chain[finalizedHeadPos].hash === info.finalizedHead.hash);
            await this.deleteHotBlocks(em, info.finalizedHead.height);
            await this.updateStatus(em, state.nonce, info.finalizedHead);
        });
    }
    deleteHotBlocks(em, finalizedHeight) {
        return em.query(`DELETE FROM ${this.escapedSchema()}.hot_block WHERE height <= $1`, [finalizedHeight]);
    }
    insertHotBlock(em, block) {
        return em.query(`INSERT INTO ${this.escapedSchema()}.hot_block (height, hash) VALUES ($1, $2)`, [block.height, block.hash]);
    }
    async updateStatus(em, nonce, next) {
        let schema = this.escapedSchema();
        let result = await em.query(`UPDATE ${schema}.status SET height = $1, hash = $2, nonce = nonce + 1 WHERE id = 0 AND nonce = $3`, [next.height, next.hash, nonce]);
        let rowsChanged = result[1];
        // Will never happen if isolation level is SERIALIZABLE or REPEATABLE_READ,
        // but occasionally people use multiprocessor setups and READ_COMMITTED.
        assert_1.default.strictEqual(rowsChanged, 1, RACE_MSG);
    }
    async performUpdates(cb, em, changeTracker) {
        let running = true;
        let store = new store_1.Store(() => {
            (0, assert_1.default)(running, `too late to perform db updates, make sure you haven't forgot to await on db query`);
            return em;
        }, changeTracker);
        try {
            await cb(store);
        }
        finally {
            running = false;
        }
    }
    async submit(tx) {
        let retries = 3;
        while (true) {
            try {
                let con = this.con;
                (0, assert_1.default)(con != null, 'not connected');
                return await con.transaction(this.isolationLevel, tx);
            }
            catch (e) {
                if (e.code == '40001' && retries) {
                    retries -= 1;
                }
                else {
                    throw e;
                }
            }
        }
    }
    escapedSchema() {
        let con = (0, util_internal_1.assertNotNull)(this.con);
        return con.driver.escape(this.statusSchema);
    }
}
exports.TypeormDatabase = TypeormDatabase;
const RACE_MSG = 'status table was updated by foreign process, make sure no other processor is running';
function assertStateInvariants(state) {
    let height = state.height;
    // Sanity check. Who knows what driver will return?
    (0, assert_1.default)(Number.isSafeInteger(height));
    assertChainContinuity(state, state.top);
    return state;
}
function assertChainContinuity(base, chain) {
    let prev = base;
    for (let b of chain) {
        (0, assert_1.default)(b.height === prev.height + 1, 'blocks must form a continues chain');
        prev = b;
    }
}
//# sourceMappingURL=database.js.map