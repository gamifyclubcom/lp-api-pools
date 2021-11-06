import {Controller, Get} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {CURRENT_POOL_PROGRAM_ID} from '@intersola/onchain-program-sdk';
import {PlatformService} from './platform.service';
import {PublicKey} from '@solana/web3.js';

@ApiBearerAuth()
@Controller('platform')
@ApiTags('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('get')
  @ApiOperation({
    operationId: 'getPlatformAccount',
    summary: 'Get platform account',
  })
  async generate() {
    return this.platformService.generate();
  }

  @Get('latest')
  @ApiOperation({
    operationId: 'getLatestPlatformAccount',
    summary: 'Get latest platform account',
  })
  async getLatest() {
    return this.platformService.generate(new PublicKey(CURRENT_POOL_PROGRAM_ID));
  }
}
