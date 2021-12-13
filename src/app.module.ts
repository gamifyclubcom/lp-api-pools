import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfigModule} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import {ScheduleModule} from '@nestjs/schedule';
import {ThrottlerModule} from '@nestjs/throttler';
import pino from 'pino';

import PoolsModule from './modules/pools/pools.module';
import AuthModule from './modules/auth/auth.module';
import UserModule from './modules/users/users.module';

import {HealthModule} from './modules/health/health.module';
import {WhitelistsModule} from './modules/whitelists/whitelists.module';
import * as mongoose from 'mongoose';
import {PlatformModule} from './modules/platform/platform.module';
import {PoolMembersModule} from './modules/poolMembers/poolMembers.module';
import StakeModule from './modules/stake/stake.module';
import {AuthMiddleware} from './middlewares/auth.middleware';

mongoose.set('debug', process.env.MONGO_DEBUG);

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        prettyPrint: {
          colorize: true,
          levelFirst: true,
          translateTime: 'UTC:mm/dd/yyyy, HH:MM:ss TT p',
        },
        serializers: {
          err: pino.stdSerializers.err,
          req: (req) => {
            req.body = req.raw.body;
            return req;
          },
        },
      },
    }),
    ConfigModule.forRoot({isGlobal: true, envFilePath: './.env'}),
    MongooseModule.forRoot(process.env.MONGODB_URL, {
      useCreateIndex: true,
      useFindAndModify: false,
    }),
    ScheduleModule.forRoot(),
    PlatformModule,
    UserModule,
    AuthModule,
    PoolsModule,
    HealthModule,
    WhitelistsModule,
    PoolMembersModule,
    StakeModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({path: '*', method: RequestMethod.ALL});
  }
}
