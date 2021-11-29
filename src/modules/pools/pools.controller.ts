import {Body, Controller, Get, Param, Post, Put, Query} from '@nestjs/common';
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {
  CreateClaimTokenHistoryDto,
  GetClaimTokenHistoryDto,
  GetJoinPoolHistoryDto,
} from './dto/claim-token-history.dto';
import {CreateJoinPoolHistory} from './dto/join-pool.dto';
import {
  IndexPoolsOutput,
  PoolOutput,
  PoolsFilterInput,
  PoolsVotingFilterInput,
  UserVoteDto,
} from './pools.dto';
import {PoolsService} from './pools.service';

@Controller('pools')
@ApiTags('pool')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get('voting')
  @ApiOperation({
    operationId: 'indexPoolsVoting',
    summary: 'Index Pools Voting',
  })
  @ApiOkResponse({type: IndexPoolsOutput})
  async indexPoolsVoting(@Query() filters: PoolsVotingFilterInput) {
    return this.poolsService.indexPoolsVoting(filters);
  }

  @Get('voting/:id')
  @ApiOperation({
    operationId: 'getOnePoolVoting',
    summary: 'Get One Pool Voting',
  })
  @ApiOkResponse({type: PoolOutput})
  async getOnePoolVoting(@Param('id') id: string) {
    return this.poolsService.getOnePoolVoting(id);
  }

  @Put('voting/:id')
  @ApiBearerAuth()
  @ApiOperation({
    operationId: 'userVote',
    summary: 'Update voting info of pool after user vote',
  })
  @ApiOkResponse({type: Boolean})
  async userVote(@Param('id') id: string, @Body() body: UserVoteDto): Promise<boolean> {
    return this.poolsService.userVote(id, body);
  }

  @Get('')
  @ApiOperation({
    operationId: 'indexPools',
    summary: 'Index Pools',
  })
  @ApiOkResponse({type: IndexPoolsOutput})
  async index(@Query() filters: PoolsFilterInput) {
    return this.poolsService.index(filters);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getOnePool',
    summary: 'Get One Pool',
  })
  @ApiOkResponse({type: PoolOutput})
  async findOne(@Param('id') id: string) {
    return this.poolsService.findOne(id);
  }

  @Post('join_pool')
  @ApiOperation({
    operationId: 'createJoinPoolHistory',
    summary: 'Create Join Pool History',
  })
  async joinPool(@Body() input: CreateJoinPoolHistory) {
    return this.poolsService.createJoinPoolHistory(input);
  }

  @Get('join_pool/histories')
  @ApiOperation({
    operationId: 'getJoinPoolHistory',
    description: 'User get join pool history',
  })
  async getJoinPoolHistory(@Query() query: GetJoinPoolHistoryDto) {
    return this.poolsService.getJoinPoolHistory(query.user_address, query.pool_address);
  }

  @Post('claim-token/histories')
  @ApiOperation({
    operationId: 'createClaimTokenHistory',
    description: 'User create claim token history',
  })
  async createClaimTokenHistory(@Body() input: CreateClaimTokenHistoryDto) {
    return this.poolsService.createClaimTokenHistory(input);
  }

  @Get('claim-token/history')
  @ApiOperation({
    operationId: 'getClaimTokenHistory',
    description: 'User get claim token history',
  })
  async getClaimTokenHistory(@Query() query: GetClaimTokenHistoryDto) {
    return this.poolsService.getClaimTokenHistory(
      query.user_address,
      query.pool_address,
      query.token_address,
    );
  }
}
