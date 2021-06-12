import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    options: {
      host: process.env.HOST ? process.env.HOST : 'localhost',
      port: process.env.PORT ? Number(process.env.PORT) : 5000,
    },
  });
  app.listen(() => console.log('product microservice is running'));
}
bootstrap().then(() => console.log('done bootstrap'));
