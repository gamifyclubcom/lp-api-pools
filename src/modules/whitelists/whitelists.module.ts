import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {WhitelistsController} from './whitelists.controller';
import {Whitelist, WhitelistSchema} from './whitelists.schema';
import {WhitelistsService} from './whitelists.service';
import PoolsModule from '../pools/pools.module';
import {PoolsService} from '../pools/pools.service';
import {Pool, PoolSchema} from '../pools/pools.schema';
import {Platform, PlatformSchema} from '../platform/platform.schema';
import {PlatformService} from '../platform/platform.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Whitelist.name, schema: WhitelistSchema},
      {name: Pool.name, schema: PoolSchema},
      {name: Platform.name, schema: PlatformSchema},
    ]),
    PoolsModule,
  ],
  controllers: [WhitelistsController],
  providers: [WhitelistsService],
  exports: [WhitelistsService],
})
export class WhitelistsModule {}
