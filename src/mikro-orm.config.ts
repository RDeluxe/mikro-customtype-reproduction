import { defineConfig, Options } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

const config: Options = defineConfig({
    dbName: 'postgres',
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    metadataProvider: TsMorphMetadataProvider,
    forceUtcTimezone: true,
    port: 5488,
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    debug: ['query', 'query-params']
})

export default config;