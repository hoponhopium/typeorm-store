"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrmConfig = exports.MIGRATIONS_DIR = void 0;
const logger_1 = require("@subsquid/logger");
const util_internal_ts_node_1 = require("@subsquid/util-internal-ts-node");
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const namingStrategy_1 = require("./namingStrategy");
const log = (0, logger_1.createLogger)('sqd:typeorm-config');
exports.MIGRATIONS_DIR = 'db/migrations';
function createOrmConfig(connectionParams, options) {
    let dir = path.resolve(options?.projectDir || process.cwd());
    let model = resolveModel(dir);
    let migrationsDir = path.join(dir, exports.MIGRATIONS_DIR);
    let locations = {
        entities: [model],
        migrations: [migrationsDir + '/*.js']
    };
    log.debug(locations, 'typeorm locations');
    return {
        type: 'postgres',
        namingStrategy: new namingStrategy_1.SnakeNamingStrategy(),
        ...locations,
        ...connectionParams
    };
}
exports.createOrmConfig = createOrmConfig;
function resolveModel(projectDir) {
    let model = path.join(projectDir, (0, util_internal_ts_node_1.isTsNode)() ? 'src/model' : 'lib/model');
    try {
        return require.resolve(model);
    }
    catch (e) {
        throw new Error(`Failed to resolve model ${model}. Did you forget to run codegen or compile the code?`);
    }
}
//# sourceMappingURL=config.js.map