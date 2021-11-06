import {Body, Controller, Get, Post, Query, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AdminGuard} from 'src/guards/admin.guard';
import {PoolOwnerBodyGuard} from 'src/guards/pool-owner.body.guard';
import { PoolOwnerQueryGuard } from 'src/guards/pool-owner.query.guard';
import {ACCESS_TOKEN_HEADER_NAME} from 'src/middlewares/auth.middleware';
import {RemoveWhitelistUserDto, SetWhitelistUserDto, WhitelistsFilterInput} from './whitelists.dto';
import {WhitelistsService} from './whitelists.service';

@ApiBearerAuth(ACCESS_TOKEN_HEADER_NAME)
@UseGuards(AdminGuard)
@Controller('whitelists')
@ApiTags('whitelist')
export class WhitelistsController {
  constructor(private readonly whitelistsService: WhitelistsService) {}

  @Post('add')
  @ApiOperation({
    operationId: 'addUserToWhitelist',
    summary:
      'Add user to whitelist and return a raw transaction that can be signed by pool administrator',
  })
  @UseGuards(PoolOwnerBodyGuard)
  async add(@Body() input: SetWhitelistUserDto) {
    return this.whitelistsService.addUserToWhitelist(input);
  }

  @Post('remove')
  @ApiOperation({
    operationId: 'removeUsersToWhitelist',
    summary: 'remove list users to whitelist',
  })
  @UseGuards(PoolOwnerBodyGuard)
  async remove(@Body() input: RemoveWhitelistUserDto) {
    return this.whitelistsService.removeUserToWhitelist(input);
  }

  @Post('add/batch')
  @ApiOperation({
    operationId: 'addBatchUserToWhitelist',
    summary:
      'Add batch user to whitelist and return a raw transaction that can be signed by pool administrator',
  })
  @UseGuards(PoolOwnerBodyGuard)
  async addBatch(@Body() input: SetWhitelistUserDto) {
    return this.whitelistsService.addBatchUserToWhitelist(input);
  }

  @Post('check-and-add-missing')
  @ApiOperation({
    operationId: 'checkAndAddMissing',
    summary:
      'Add batch user to whitelist and return a raw transaction that can be signed by pool administrator',
  })
  @UseGuards(PoolOwnerBodyGuard)
  async checkAndAddMissing(@Body() input: SetWhitelistUserDto) {
    return this.whitelistsService.checkAndAddMissing(input);
  }

  @Get('index')
  @ApiOperation({
    operationId: 'indexWhitelistedUsers',
    summary: 'Index whitelisted users',
  })
  @UseGuards(PoolOwnerQueryGuard)
  async index(@Query() input: WhitelistsFilterInput) {
    return this.whitelistsService.index(input);
  }
}
