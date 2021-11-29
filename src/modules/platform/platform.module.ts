import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {PlatformController} from './platform.controller';
import {Platform, PlatformSchema} from './platform.schema';
import {PlatformService} from './platform.service';

@Module({
  imports: [MongooseModule.forFeature([{name: Platform.name, schema: PlatformSchema}])],
  controllers: [PlatformController],
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {}
