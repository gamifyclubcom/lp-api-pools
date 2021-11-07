import {Body, Controller, Post} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {StakeService} from './stake.service';
import {CreateUserStakeHistory} from './dto/userStakeHisotry.dto';

@Controller('user/stake')
@ApiTags('user-stake')
export class UserStakeController {
  constructor(private readonly stakeService: StakeService) {}

  @Post('history')
  @ApiOperation({
    operationId: 'createUserStakeHistory',
    summary: 'Create User Stake History',
  })
  async joinPool(@Body() input: CreateUserStakeHistory) {
    return this.stakeService.createJoinPoolHistory(input);
  }
}
