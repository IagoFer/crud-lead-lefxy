import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import configuration from './config/configuration';
import { LeadsModule } from './modules/leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/lefxy-crm'),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = process.env.REDIS_PORT || '6379';
        return {
          stores: [createKeyv(`redis://${redisHost}:${redisPort}`)],
          ttl: 60000,
        };
      },
    }),

    LeadsModule,
  ],
})
export class AppModule {}
