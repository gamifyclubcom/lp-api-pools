import {Body, Controller, Get, Param, Post, Put, Query} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {
  CreateJoinPoolHistory,
  IndexJoinPoolHistoryFilter,
  UpdateJoinPoolHistoryStatus,
} from './dto/join-pool-history.dto';
import {PoolParticipantsService} from './pool-participants.service';

@Controller('pool-participants/join-pool-history')
@ApiTags('join-pool-history')
export class JoinPoolHistoryController {
  constructor(private readonly poolParticipantsService: PoolParticipantsService) {}

  @Get()
  @ApiOperation({
    operationId: 'indexJoinPoolHistory',
    summary: 'User get list join pool history',
  })
  async index(@Query() filters: IndexJoinPoolHistoryFilter) {
    return this.poolParticipantsService.indexUserJoinPoolHistory(filters);
  }

  @Post()
  @ApiOperation({
    operationId: 'createJoinPoolHistory',
    summary: 'User Create Join Pool History',
  })
  async joinPool(@Body() input: CreateJoinPoolHistory) {
    return this.poolParticipantsService.userJoinPool(input);
  }

  @Put('/:id')
  @ApiOperation({
    operationId: 'updateJoinPoolHistory',
    summary: 'User Update Join Pool History status base on result of join pool action',
  })
  async updateJoinPoolHistoryStatus(
    @Param('id') id: string,
    @Body() input: UpdateJoinPoolHistoryStatus,
  ) {
    return this.poolParticipantsService.updateJoinPoolHistory(id, input);
  }
}
