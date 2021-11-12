import {Body, Controller, Get, Param, Post, Put, Query, Res, UseGuards} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import {Address} from '../../decorators/address.decorator';
import {AdminGuard} from '../../guards/admin.guard';
import {ACCESS_TOKEN_HEADER_NAME} from '../../middlewares/auth.middleware';
import {PoolFiltersValidationPipe} from '../../pipes/pool-filters.validation.pipe';
import {CommitInitPoolDto} from './dto/create-pool.dto';
import {
  UpdateOffchainPoolInput,
} from './dto/update-pool.dto';
import {
  IndexPoolsOutput,
  PoolDto,
  PoolOutput,
  PoolsFilterInput,
  UpdatePoolResponse,
} from './pools.dto';
import {PoolsService} from './pools.service';
import {Response} from 'express';
import {PoolOwnerGuard} from '../../guards/pool-owner.guard';

@Controller('admin/pools')
@ApiTags('adminPool')
@ApiBearerAuth(ACCESS_TOKEN_HEADER_NAME)
@UseGuards(AdminGuard)
export class PoolsAdminController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get('')
  @ApiOperation({
    operationId: 'adminIndexPools',
    summary: 'Index Pools',
  })
  @ApiOkResponse({type: IndexPoolsOutput})
  async index(
    @Query(new PoolFiltersValidationPipe()) filters: PoolsFilterInput,
    @Address() address: string,
  ) {
    return this.poolsService.adminIndex(filters, address);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getOnePool',
    summary: 'Get One Pool',
  })
  // @UseGuards(PoolOwnerGuard)
  @ApiOkResponse({type: PoolOutput})
  async findOne(@Param('id') id: string) {
    return this.poolsService.findOne(id);
  }

  @Post('/commit')
  @ApiOperation({
    operationId: 'commitInitPool',
    summary: 'Commit init Pool',
  })
  @ApiCreatedResponse({type: PoolDto})
  async commit(@Body() input: CommitInitPoolDto) {
    return this.poolsService.commitInitPool(input);
  }

  @Put(':id/off-chain')
  @ApiOperation({
    operationId: 'updateOffchainDataPool',
    summary: 'Update Pool',
  })
  @ApiCreatedResponse({type: UpdatePoolResponse})
  @UseGuards(PoolOwnerGuard)
  async updateOffchain(@Param('id') id: string, @Body() input: UpdateOffchainPoolInput) {
    return this.poolsService.updateOffchainPool(id, input);
  }

  @Get('export-join-pool-history/:id')
  @ApiOperation({
    operationId: 'exportJoinPoolHistory',
    description: 'Export Join Pool History',
  })
  @UseGuards(PoolOwnerGuard)
  @ApiProduces('application/octet-stream')
  async exportJoinPoolHistory(@Param('id') poolAddress: string, @Res() res: Response) {
    return this.poolsService.exportJoinPoolHistory(poolAddress, res);
  }

  @Post(':id/sync')
  @ApiOperation({
    operationId: 'sync',
    deprecated: true,
    summary: 'Sync pool data',
  })
  async syncPool(@Param('id') id: string) {
    return this.poolsService.syncPool(id);
  }
}
