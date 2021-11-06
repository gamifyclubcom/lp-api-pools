import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationOptions {
  @ApiPropertyOptional({ type: Number })
  page?: number;
  @ApiPropertyOptional({ type: Number })
  limit?: number;
}
