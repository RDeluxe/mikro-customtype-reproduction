import { MikroORM } from "@mikro-orm/core"
import { MikroOrmModule } from "@mikro-orm/nestjs"
import { OnModuleInit } from "@nestjs/common"
import { Module } from "@nestjs/common"
import config from "../mikro-orm.config"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"

@Module({
    imports: [
        MikroOrmModule.forRoot(config),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements OnModuleInit {
    constructor(private readonly orm: MikroORM) { }
    onModuleInit() {
        const connection = this.orm.em.getConnection()
        connection.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
    }
}
