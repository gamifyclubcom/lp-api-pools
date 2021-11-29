import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {ReadPoolUserDto} from './poolMembers.dto';
import {PoolMembersService} from './poolMembers.service';

@ApiBearerAuth()
@Controller('')
@ApiTags('pool.users')
export class PoolMembersController {
  constructor(private readonly poolMembersService: PoolMembersService) {}

  @Get('pools/:id/users')
  @ApiOperation({
    operationId: 'readPoolUser',
    summary: 'Read Pool User',
  })
  async index(@Query() input: ReadPoolUserDto, @Param('id') poolId: string) {
    return this.poolMembersService.readPoolUserAccount(poolId, input.userAccount);
  }
}
