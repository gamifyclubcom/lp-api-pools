import {Controller, Get, Param, Res} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import {StakeService} from './stake.service';
import {Response} from 'express';
import {ExportStakingUsersDto} from './dto/exportStakingUser.dto';

@Controller('admin/stake')
@ApiTags('admin-stake')
export class AdminStakeController {
  constructor(private readonly stakeService: StakeService) {}

  @ApiBearerAuth()
  @Get('export-user-stake-history')
  @ApiOperation({
    operationId: 'exportUserStakeHistory',
    description: 'Export User Stake History',
  })
  async exportJoinPoolHistory(@Res() res: Response, @Param() input: ExportStakingUsersDto) {
    return this.stakeService.exportJoinPoolHistory(res, input.stake_account);
  }

  @ApiBearerAuth()
  @Get('read-user/:user_address')
  @ApiOperation({
    operationId: 'readUserStake',
    description: 'read User Stake Data',
  })
  async readUserStakeData(@Param('user_address') user_address: string) {
    return this.stakeService.readUserStakeData(user_address);
  }
}
