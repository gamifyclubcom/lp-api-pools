import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import PoolsModule from '../pools/pools.module';
import {Pool, PoolSchema} from '../pools/pools.schema';
import {Platform, PlatformSchema} from '../platform/platform.schema';
import {PoolMembersService} from './poolMembers.service';
import {PoolMembersController} from './poolMembers.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Pool.name, schema: PoolSchema},
      {name: Platform.name, schema: PlatformSchema},
    ]),
    PoolsModule,
  ],
  controllers: [PoolMembersController],
  providers: [PoolMembersService],
  exports: [PoolMembersService],
})
export class PoolMembersModule {}
