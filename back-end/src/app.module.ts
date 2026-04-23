import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import configuration from './config/configuration';
import { LeadsModule } from './modules/leads/leads.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { FollowUpsModule } from './modules/followups/followups.module';
import { AiSummaryModule } from './modules/ai-summary/ai-summary.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 segundos
      limit: 100, // 100 requests max por IP nesse tempo
    }]),

    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/lefxy-crm'),

    BullModule.forRootAsync({
      useFactory: () => ({
        connection: process.env.REDIS_URL
          ? { url: process.env.REDIS_URL }
          : {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379', 10),
            },
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        const redisUrl =
          process.env.REDIS_URL ||
          `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;
        return {
          stores: [createKeyv(redisUrl)],
          ttl: 60000,
        };
      },
    }),

    LeadsModule,
    FollowUpsModule,
    InteractionsModule,
    AiSummaryModule,
    AuthModule,
    UsersModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
