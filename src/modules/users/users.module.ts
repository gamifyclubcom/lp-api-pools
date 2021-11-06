import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import UsersService from './users.service';
import UsersController from './users.controller';
import { User, UserSchema } from './users.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export default class UsersModule {}
