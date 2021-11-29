import {Controller, Get, HttpStatus} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

@Controller()
@ApiTags('health')
export class HealthController {
  @ApiOperation({
    operationId: 'health',
    description: 'Health check',
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @Get('health')
  health() {
    return {status: 'OK'};
  }
}
