import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchEntity, ColorEntity, ProductEntity } from 'db';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomExceptionFilter } from './filters/custom-exception-filter';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoLoadEntities: true,
        database: configService.get('DATABASE_NAME'),
        host: configService.get('DATABASE_HOST'),
        keepConnectionAlive: true,
        logging: true,
        password: configService.get('DATABASE_PASS'),
        port: Number(configService.get('DATABASE_PORT')),
        synchronize: true,
        type: 'postgres',
        username: configService.get('DATABASE_USER'),
      }),
    }),
    TypeOrmModule.forFeature([ProductEntity, BranchEntity, ColorEntity]),
  ],
  providers: [
    {
      inject: [ConfigService],
      provide: 'LOG_SERVICE',
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          options: {
            host: configService.get('LOG_SERVICE_HOST'),
            port: configService.get('LOG_SERVICE_PORT'),
          },
          transport: Transport.TCP,
        }),
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
