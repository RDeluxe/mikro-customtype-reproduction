import { NestFactory } from '@nestjs/core'
import { AppModule } from './nest-test/app.module'


async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true })
    app.enableCors({ origin: '*' })
    app.enableShutdownHooks()
    await app.listen(3333)
}

bootstrap()
