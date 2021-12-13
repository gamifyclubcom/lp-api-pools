import {Controller, Get, Param, Res} from '@nestjs/common';
import {ApiOperation, ApiProduces, ApiTags} from '@nestjs/swagger';
import {Response} from 'express';
import {PoolParticipantsService} from './pool-participants.service';

@Controller('pool-participants')
@ApiTags('pool-participants')
export class PoolParticipantsController {
  constructor(private readonly poolParticipantsService: PoolParticipantsService) {}

  @Get('export/:poolAddress')
  @ApiOperation({
    operationId: 'exportParticipants',
    description: 'Export Join Pool History',
  })
  @ApiProduces('application/octet-stream')
  async exportParticipants(@Param('poolAddress') poolAddress: string, @Res() res: Response) {
    return this.poolParticipantsService.exportParticipants(poolAddress, res);
  }

  @Get('verify-progress/:poolAddress')
  @ApiOperation({
    operationId: 'verifyParticipantsProgress',
    description: 'Get progress verify participants',
  })
  async verifyParticipantsProgress(@Param('poolAddress') poolAddress: string) {
    return this.poolParticipantsService.verifyParticipantsProgress(poolAddress);
  }
}
