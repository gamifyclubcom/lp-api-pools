import {Body, Controller, Get, Param, Post, Put, Query, Res, UseGuards} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import {Address} from 'src/decorators/address.decorator';
import {AdminGuard} from 'src/guards/admin.guard';
import {ACCESS_TOKEN_HEADER_NAME} from 'src/middlewares/auth.middleware';
import {PoolFiltersValidationPipe} from '../../pipes/pool-filters.validation.pipe';
import {CommitInitPoolDto, CreatePoolInput} from './dto/create-pool.dto';
import {
  ChangePoolAdminInput,
  UpdateOffchainPoolInput,
  UpdateOnchainPoolInput,
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
import {PoolOwnerGuard} from 'src/guards/pool-owner.guard';

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
  @UseGuards(PoolOwnerGuard)
  @ApiOkResponse({type: PoolOutput})
  async findOne(@Param('id') id: string) {
    return this.poolsService.findOne(id);
  }

  @Post('')
  @ApiOperation({
    operationId: 'createPool',
    summary: 'Create Pool',
  })
  // @ApiCreatedResponse({ rawTx: any })
  async create(@Body() input: CreatePoolInput) {
    return this.poolsService.create(input);
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

  @Put(':id/on-chain')
  @ApiOperation({
    operationId: 'updateOffchainDataPool',
    summary: 'Update Pool',
  })
  @ApiCreatedResponse({type: UpdatePoolResponse})
  @UseGuards(PoolOwnerGuard)
  async updateOnchain(@Param('id') id: string, @Body() input: UpdateOnchainPoolInput) {
    return this.poolsService.updateOnchainPool(id, input);
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

  @Post('change-admin')
  @ApiOperation({
    operationId: 'changePoolAdmin',
    deprecated: true,
    summary: 'Change Pool Admin',
  })
  // @ApiCreatedResponse({ type: UpdatePoolResponse })
  async changePoolAdmin(@Body() input: ChangePoolAdminInput) {
    return this.poolsService.changePoolAdmin(input);
  }

  @Post(':id/activate')
  @ApiOperation({
    operationId: 'activatePool',
    deprecated: true,
    summary: 'Activate Pool',
  })
  @UseGuards(PoolOwnerGuard)
  @ApiCreatedResponse({type: PoolDto})
  async activate(@Param('id') id: string) {
    return this.poolsService.activatePool(id);
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
