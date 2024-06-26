"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expect_1 = __importDefault(require("expect"));
const database_1 = require("../database");
const model_1 = require("./lib/model");
const util_1 = require("./util");
describe('TypeormDatabase', function () {
    (0, util_1.useDatabase)([
        `CREATE TABLE item (id text primary key, name text)`,
        `CREATE TABLE "data" (
            id text primary key, 
            "text" text, 
            text_array text[], 
            "integer" int4, 
            integer_array int4[], 
            big_integer numeric,
            date_time timestamp with time zone,
            "bytes" bytea,
            "json" jsonb,
            item_id text references item
        )`
    ]);
    let db;
    beforeEach(() => {
        db = new database_1.TypeormDatabase({ projectDir: __dirname, supportHotBlocks: true });
    });
    afterEach(() => db?.disconnect());
    it('initial connect', async function () {
        let state = await db.connect();
        (0, expect_1.default)(state).toMatchObject({ height: -1, hash: '0x', top: [] });
    });
    it('.transact() flow', async function () {
        await db.connect();
        await db.transact({
            prevHead: { height: -1, hash: '0x' },
            nextHead: { height: 10, hash: '0x10' }
        }, async (store) => {
            await store.insert(new model_1.Data({
                id: '1',
                text: 'hello',
                integer: 10
            }));
        });
        await db.transact({
            prevHead: { height: 10, hash: '0x10' },
            nextHead: { height: 20, hash: '0x20' }
        }, async (store) => {
            await store.insert(new model_1.Data({
                id: '2',
                text: 'world',
                integer: 20
            }));
        });
        let em = await (0, util_1.getEntityManager)();
        let records = await em.find(model_1.Data, {
            order: { id: 'asc' }
        });
        (0, expect_1.default)(records).toMatchObject([
            {
                id: '1',
                text: 'hello',
                integer: 10
            },
            {
                id: '2',
                text: 'world',
                integer: 20
            }
        ]);
        await db.disconnect();
        (0, expect_1.default)(await db.connect()).toMatchObject({
            height: 20,
            hash: '0x20',
            top: []
        });
    });
    it('.transactHot() flow', async function () {
        let em = await (0, util_1.getEntityManager)();
        await db.connect();
        await db.transactHot({
            baseHead: { height: -1, hash: '0x' },
            newBlocks: [
                { height: 0, hash: '0' },
            ],
            finalizedHead: { height: 0, hash: '0' }
        }, async () => { });
        let a1 = new model_1.Data({
            id: '1',
            text: 'a1',
            textArray: ['a1', 'A1'],
            integer: 1,
            integerArray: [1, 10],
            bigInteger: 1000000000000000000000000000000000000000000000000000000000n,
            dateTime: new Date(1000000000000),
            bytes: Buffer.from([100, 100, 100]),
            json: [1, { foo: 'bar' }]
        });
        let a2 = new model_1.Data({
            id: '2',
            text: 'a2',
            textArray: ['a2', 'A2'],
            integer: 2,
            integerArray: [2, 20],
            bigInteger: 2000000000000000000000000000000000000000000000000000000000n,
            dateTime: new Date(2000000000000),
            bytes: Buffer.from([200, 200, 200]),
            json: [2, { foo: 'baz' }]
        });
        let a3 = new model_1.Data({
            id: '3',
            text: 'a3',
            textArray: ['a3', 'A30'],
            integer: 30,
            integerArray: [30, 300],
            bigInteger: 3000000000000000000000000000000000000000000000000000000000n,
            dateTime: new Date(3000000000000),
            bytes: Buffer.from([3, 3, 3]),
            json: [3, { foo: 'qux' }]
        });
        await db.transactHot({
            baseHead: { height: 0, hash: '0' },
            finalizedHead: { height: 0, hash: '0' },
            newBlocks: [
                { height: 1, hash: 'a-1' },
                { height: 2, hash: 'a-2' },
                { height: 3, hash: 'a-3' }
            ]
        }, async (store, block) => {
            switch (block.height) {
                case 1:
                    return await store.insert(a1);
                case 2:
                    (0, expect_1.default)(await store.get(model_1.Data, '1')).toEqual(a1);
                    await store.insert([a2, a3]);
            }
        });
        (0, expect_1.default)(await em.find(model_1.Data, { order: { id: 'asc' } })).toEqual([
            a1, a2, a3
        ]);
        let b1 = new model_1.Data({
            id: '1',
            text: 'b1',
            textArray: ['b1', 'B1'],
            integer: 10,
            integerArray: [10, 100],
            bigInteger: 8000000000000000000000000000000000000000000000000000000000000000n,
            dateTime: new Date(100000),
            bytes: Buffer.from([1, 1, 1]),
            json: ["b1", { foo: 'bar' }]
        });
        let b2 = new model_1.Data({
            id: '2',
            text: 'b2',
            textArray: ['b2', 'B2'],
            integer: 20,
            integerArray: [20, 200],
            bigInteger: 9000000000000000000000000000000000000000000000000000000000000n,
            dateTime: new Date(2000),
            bytes: Buffer.from([2, 2, 2]),
            json: { b2: true }
        });
        await db.transactHot({
            finalizedHead: { height: 0, hash: '0' },
            baseHead: { height: 1, hash: 'a-1' },
            newBlocks: [
                { height: 2, hash: 'b-2' }
            ]
        }, async (store, block) => {
            (0, expect_1.default)(block).toEqual({ height: 2, hash: 'b-2' });
            await store.save(b1);
            await store.insert(b2);
        });
        (0, expect_1.default)(await em.find(model_1.Data, { order: { id: 'asc' } })).toEqual([
            b1, b2
        ]);
        await db.transactHot({
            finalizedHead: { height: 0, hash: '0' },
            baseHead: { height: 1, hash: 'a-1' },
            newBlocks: [
                { height: 2, hash: 'c-2' }
            ]
        }, async (store, block) => {
            (0, expect_1.default)(block).toEqual({ height: 2, hash: 'c-2' });
            (0, expect_1.default)(await store.find(model_1.Data)).toEqual([a1]);
            await store.remove(a1);
        });
        (0, expect_1.default)(await em.find(model_1.Data)).toEqual([]);
        await db.transactHot({
            finalizedHead: { height: 0, hash: '0' },
            baseHead: { height: 1, hash: 'a-1' },
            newBlocks: [
                { height: 2, hash: 'd-2' }
            ]
        }, async () => { });
        (0, expect_1.default)(await em.find(model_1.Data)).toEqual([a1]);
        await db.disconnect();
        (0, expect_1.default)(await db.connect()).toMatchObject({
            height: 0,
            hash: '0',
            top: [
                { height: 1, hash: 'a-1' },
                { height: 2, hash: 'd-2' }
            ]
        });
    });
});
//# sourceMappingURL=database.test.js.map