import { createLogger } from '@subsquid/logger'
import { isTsNode } from '@subsquid/util-internal-ts-node'
import * as path from 'path'
import * as process from 'process'
import type { DataSourceOptions as OrmConfig } from 'typeorm'
import { SnakeNamingStrategy } from './namingStrategy'

export interface DbConnectionParams {
    host: string
    port: number
    database: string
    username: string
    password: string
}

const log = createLogger('sqd:typeorm-config')

export interface OrmOptions {
    projectDir?: string
}

export const MIGRATIONS_DIR = 'db/migrations'


export function createOrmConfig(connectionParams: DbConnectionParams, options?: OrmOptions): OrmConfig {
    let dir = path.resolve(options?.projectDir || process.cwd())
    let model = resolveModel(dir)
    let migrationsDir = path.join(dir, MIGRATIONS_DIR)
    let locations = {
        entities: [model],
        migrations: [migrationsDir + '/*.js']
    }
    log.debug(locations, 'typeorm locations');

    return {
        type: 'postgres',
        namingStrategy: new SnakeNamingStrategy(),
        ...locations,
        ...connectionParams
    }
}


function resolveModel(projectDir: string): string {
    let model = path.join(projectDir, isTsNode() ? 'src/model' : 'lib/model')
    try {
        return require.resolve(model)
    } catch (e: any) {
        throw new Error(
            `Failed to resolve model ${model}. Did you forget to run codegen or compile the code?`
        )
    }
}
