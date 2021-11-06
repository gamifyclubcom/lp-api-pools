import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import UsersModule from '../users/users.module';
import AuthRepository from '../auth/auth.repository';
import JwtAccessStrategy from './strategies/jwt-access.strategy';
import JwtRefreshStrategy from './strategies/jwt-refresh.strategy';

import AuthController from './auth.controller';
import AuthService from './auth.service';
import { envConfig } from '../../configs';

const { JWT_SECRET } = envConfig;

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
    }),
  ],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy, AuthRepository],
  controllers: [AuthController],
  exports: [AuthService],
})
export default class AuthModule {}
